// Country Model - Using Mongoose Model
const { Country, validateCountry } = require('../../models/country');
const { Site } = require('../../models/sites/site');
const countryCheckDebugger = require('debug')('app:countryLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkCountry(runFlag) {
  
  // get sites once
  let sFinds = await Site.find();    
  
  for (const country of await Country.find()
                                     .populate("zone", "name")) { 
    if (!country.populated("zone")) {  
      logger.error(`Zone link missing for Country ${country.name}`);
    }

    let { error } = await validateCountry(country); 
    if (error) {
      logger.error(`Country Validation Error For ${country.code} ${country.name} Error: ${error.details[0].message}`);
    }

    //if not space, should have at least 1 city site
    //if space, should have at least 1 spacecraft
    let countryId = country._id.toHexString();
    let cityCount = 0;
    let spacecraftCount = 0;

    siteLoop:
    for (let j = 0; j < sFinds.length; ++j){
      let sCountryId = sFinds[j].country.toHexString();

      if (sCountryId === countryId) {
        
        if (sFinds[j].type === "City") {
          ++cityCount;
        } else if (sFinds[j].type === "Spacecraft") {
          ++spacecraftCount;
        }
      }  
      
      // only need 1
      if (country.type === "T" && cityCount > 0) {
        break siteLoop;
      } else if ((country.type === "A" && spacecraftCount > 0) ) {
        break siteLoop;
      }
    }

    if (country.type === "T") {
      if (cityCount < 1){
        logger.error(`No Cities Found In Country ${country.code} ${country.name}`);
      }
    } else if (country.type === "A") {
      if (spacecraftCount < 1){
        logger.error(`No Spacecraft Found In Country ${country.code} ${country.name}`);
      }
    } 

    let currentCode = country.code;
    let currentCountryIdString = country._id.toHexString();

    await checkBorderedByList(country.borderedBy, currentCode, currentCountryIdString, country.name);

  }
  return true;
};

async function checkBorderedByList(bBy, curCode, curIdString, curName){
  //check borderedBy array of IDs for this country listed (reference back to this country)
  for (let j = 0; j < bBy.length; ++j){
    let b_Id = bBy[j];
    let testIdString = b_Id.toHexString();
    //countryCheckDebugger(`jeff 0  ... jindex ${j}  cur string ${curIdString} curCode ${curCode} test string ${testIdString}`);

    if (curIdString === testIdString) {
      logger.error(`Country ${curCode} ${curName} has itself in its borderedBy list ${j}: ${testIdString}`);
    } else {
      let bCountry = await Country.findById(b_Id);
      if (!bCountry) {
        logger.error(`Country ${curCode} ${curName} references an invalid borderedBy ${j}: ${b_Id}`);
      } else {
        // found a borderedBy country ... does it reference back to this country in its list?
        let selfCount = 0;
        for (let k = 0, selfFound = false; k < bCountry.borderedBy.length && selfFound == false; ++k ) {
          let c_Id = bCountry.borderedBy[k];
          //countryCheckDebugger(`Jeff 1 here ... j-index ${j} K-index ${k} c_Id ${c_Id}`);          
          let cCountry = await Country.findById(c_Id);
          if (cCountry) {
            let checkCode = cCountry.code;
            //countryCheckDebugger(`Jeff 2 here ... currentCode ${curCode} j-index ${j} k-index ${k} check code ${checkCode}`);
            if (curCode === checkCode) {
              ++selfCount;
              //countryCheckDebugger(`Jeff 3 here ... currentCode ${curCode} j-index ${j} k-index ${k} check code ${checkCode} selfCount ${selfCount}`);
              selfFound = true;   // will exit for loop when found
            }
          }
        }
        //countryCheckDebugger(`Jeff 4 ${selfCount} currentCode ${curCode} j-index ${j}`);           
        if (selfCount < 1) {
          logger.error(`Country ${curCode} ${curName} borderedBy ${bCountry.name} does not list it as a borderedBy as well`);
        }
      }
    }
  }  
}

module.exports = chkCountry;