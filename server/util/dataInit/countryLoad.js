const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initCountry.json', 'utf8');
const countryDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const countryLoadDebugger = require('debug')('app:countryLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Country Model - Using Mongoose Model
const { Country, validateCountry } = require('../../models/country');

const app = express();

/*
Country.watch().on('change', data => {
  countryLoadDebugger(data);
});
*/

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runCountryLoad(runFlag){
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  for (let i = 0; i < countryDataIn.length; ++i ) {
    
    if (countryDataIn[i].loadType == "country") {     
      
      // delete old data
      //await deleteCountry(countryDataIn[i]);   will cause previously loaded country record id's to change

      await loadCountry(countryDataIn[i]);
    }
  }
};

async function loadCountry(cData){
  try {   
    //logger.debug("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);
    //console.log("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);
    
    let country = await Country.findOne( { code: cData.code } );

    if (!country) {
       // No New Country here ... should have been loaded by refData
      logger.error("Country Update Error ... Country Not Found for ", cData.code, cData.name );
      console.log("Country Update Error ... Country Not Found for ", cData.code, cData.name );
      return;
    } else {       
      // Existing Country here ... update
      let id = country._id;
      
      country.coastal = cData.coastal;
      let borderedBy_Ids = [];
      for (let j = 0; j < cData.borderedBy.length; ++j ) {
        let borderCountry = await Country.findOne( { code: cData.borderedBy[j].code } );
        if (borderCountry) {
          borderedBy_Ids.push(borderCountry._id);
        } else {
          logger.error("Country Update Error ... BorderedBy Country Not Found for ", cData.code, "By ", cData.borderedBy[j].code );
        }
      }
      country.borderedBy = borderedBy_Ids;

      //country.accounts  = cData.accounts;  ... moved to it's own load

      const { error } = validateCountry(country); 
      if (error) {
        countryLoadDebugger("Country Update Validate Error", cData.code, cData.name, error.message);
        return
      }
   
      await country.save((err, country) => {
      if (err) return logger.error(`Country Update Save Error: ${err}`);
      countryLoadDebugger(country.name, " update saved to countrys collection.", "Code: ", country.code, "Name: ", country.name);

    });
  }
  } catch (err) {
    countryLoadDebugger('Catch Country Error:', err.message);
    return;
}

};

async function deleteCountry(cData){

  if (cData.loadFlg === "true") return;   // shouldn't be here if flagged for load

  try {
    let delErrorFlag = false;
    for await (let country of Country.find( { code: cData.code } )) {    
      try {
        let delId = country._id;
        let countryDel = await Country.findByIdAndRemove(delId);
        if (countryDel = null) {
          countryLoadDebugger(`deleteCountry: Country with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        countryLoadDebugger('deleteCountry Error 1:', err.message);
        let delErrorFlag = true;
      }
    }        
    if (!delErrorFlag) {
       countryLoadDebugger("All Countrys succesfully deleted for Code:", cData.code);
    } else {
       countryLoadDebugger("Some Error In Countrys delete for Code:", cData.code);
    }
  } catch (err) {
    countryLoadDebugger(`deleteCountry Error 2: ${err.message}`);
  }
};

module.exports = runCountryLoad;