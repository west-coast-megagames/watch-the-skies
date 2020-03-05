const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initBaseSite.json', 'utf8');
const baseDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const baseSiteLoadDebugger = require('debug')('app:baseLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');
const { convertToDms } = require('../../util/systems/geo');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

// Base Model - Using Mongoose Model
const { BaseSite, validateBase } = require('../../models/sites/site');
const { Country } = require('../../models/country');
const { Team } = require('../../models/team/team');
const { Facility, Lab, Hanger, Factory, Crisis, Civilian } = require('../../models/gov/facility/facility');
const { loadFacilitys, facilitys, validUnitType } = require('../../wts/construction/facilities/facilities');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runbaseSiteLoad(runFlag){
  try {
    //baseSiteLoadDebugger("Jeff in runbaseSiteLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {

      await loadFacilitys();                    // load wts/json/facilities/facilitys.json data into array

      await deleteAllBases(runFlag);
      await initLoad(runFlag);

    }
    return true;
  } catch (err) {
    logger.error(`Catch runbaseSiteLoad Error: ${err.message}`);
    return;
  }
};

async function initLoad(doLoad) {

  if (!doLoad) return;
  let recReadCount = 0;
  let recCounts = { loadCount: 0,
                    loadErrCount: 0,
                    updCount: 0};
  
  for (let i = 0; i < baseDataIn.length; ++i ) {

    ++recReadCount;

    await loadBase(baseDataIn[i], recCounts);
    
  }

  logger.info(`baseSite Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`);

};

async function loadBase(iData, rCounts){
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";
  let loadCode = "";
  
  try {
    let baseSite = await BaseSite.findOne( { name: iData.name } );

    loadName = iData.name;
    loadCode = iData.code;

    if (!baseSite) {
      // New Base here
      let newLatDMS = convertToDms(iData.latDecimal, false);
      let newLongDMS = convertToDms(iData.longDecimal, true);
      let baseSite = new BaseSite({
        name: iData.name,
        siteCode: iData.code,
        geoDMS: {
        latDMS: newLatDMS,
        longDMS: newLongDMS
        },
        geoDecimal: {
         latDecimal: iData.latDecimal,
         longDecimal: iData.longDecimal
        }
      });
      let { error } = validateBase(baseSite);
      if (error) {
        //baseSiteLoadDebugger("New BaseSite Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return;
      }
      baseSite.baseDefenses = iData.baseDefenses;
      baseSite.publice      = iData.public;

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //baseSiteLoadDebugger("BaseSite Load Team Error, New Base:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          baseSite.team  = team._id;
          //baseSiteLoadDebugger("BaseSite Load Team Found, Base:", iData.name, " Team: ", iData.countryCode, "Team ID:", team._id);
        }
      }

      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //baseSiteLoadDebugger("BaseSite Load Country Error, New Base:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.countryCode;
        } else {
          baseSite.country = country._id;
          baseSite.zone    = country.zone;
          //baseSiteLoadDebugger("BaseSite Load Country Found, New Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }
      }

      baseSite.facilities = [];
      if (!loadError) {
        // create facility records for baseSite and store ID in baseSite.facilities
        for (let fac of iData.facilities) {
          let facError = true;
          let facId    = null;
          let facRef = facilitys[facilitys.findIndex(facility => facility.code === fac.code )];

          if (facRef) {
            if (validUnitType(facRef.unitType, "Base")) {
              let facType  = facRef.type;
              facError = false;
              //switch not working ... using if else
              if (facType == 'Factory') {
                newFacility = await new Factory(facRef);
                facId = newFacility._id;
              } else if (facType == 'Lab') {
                newFacility = await new Lab(facRef);
                newFacility.sciRate = facRef.sciRate;
                newFacility.bonus   = facRef.bonus;
                newFacility.funding = facRef.funding;
                facId = newFacility._id;
              } else if (facType == 'Hanger') {
                newFacility = await new Hanger(facRef);
                facId = newFacility._id;
              } else if (facType == 'Crisis') {
                newFacility = await new Crisis(facRef);
                facId = newFacility._id;
              } else if (facType == 'Civilian') {
                newFacility = await new Civilian(facRef);
                facId = newFacility._id;
              } else {
                logger.error(`Invalid Facility Type In baseSite Load: ${facRef.type}`);
                facError = true;
              }
            } else {
              logger.debug(`Error in creation of facility ${fac} for  ${baseSite.name} - wrong unitType`);
              facError = true;
            }
          } else {
            logger.debug(`Error in creation of facility ${fac} for  ${baseSite.name}`);
            facError = true;
          }

          if (!facError) {
            newFacility.site = baseSite._id;
            newFacility.team = baseSite.team;
            newFacility.name = fac.name;
  
            await newFacility.save(((err, newFacility) => {
              if (err) {
                logger.error(`New BaseSite Facility Save Error: ${err}`);
                //return;
                facError = true;
              }
              //baseSiteLoadDebugger(baseSite.name, "Facility", fac.name, " add saved to facility collection.");
            }));
  
            if (!facError) {
              baseSite.facilities.push(facId);
            }
          }
        }
      }

      if (loadError) {
        logger.error(`Spacecraft skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`);
        delFacilities(spacecraft.facilities);
        ++rCounts.loadErrCount;
        return;
      } else {
        await baseSite.save((err, baseSite) => {
          if (err) {
            delFacilities(spacecraft.facilities);
            logger.error(`New BaseSite Save Error: ${err}`);
            ++rCounts.loadErrCount;
            return;
          }
          ++rCounts.loadCount;
          baseSiteLoadDebugger(`${baseSite.name} add saved to baseSite collection.`);
          return;
        });
      }
    } else {
      // Existing Base here ... update
      let id = baseSite._id;

      let newLatDMS = convertToDms(iData.latDecimal, false);
      let newLongDMS = convertToDms(iData.longDecimal, true);
      baseSite.name         = iData.name;
      baseSite.siteCode     = iData.code;
      baseSite.baseDefenses = iData.baseDefenses;
      baseSite.publice      = iData.public;
      baseSite.latDMS       = newLatDMS;
      baseSite.longDMS      = newLongDMS;
      baseSite.latDecimal   = iData.latDecimal;
      baseSite.longDecimal  = iData.longDecimal;

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //baseSiteLoadDebugger("BaseSite Load Team Error, Update Base:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          baseSite.team = team._id;
          //baseSiteLoadDebugger("BaseSite Load Update Team Found, Base:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }

      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //baseSiteLoadDebugger("BaseSite Load Country Error, Update Base:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.countryCode;
        } else {
          baseSite.country = country._id;
          baseSite.zone    = country.zone;
          //baseSiteLoadDebugger("BaseSite Load Country Found, Update Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }
      }

      const { error } = validateBase(baseSite);
      if (error) {
        //baseSiteLoadDebugger("BaseSite Update Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return
      }

      // create facility records for baseSite and store ID in baseSite.facilities
      baseSite.facilities = [];
      if (!loadError) {
        for (let fac of iData.facilities) {
          let facRef = facilitys[facilitys.findIndex(facility => facility.code === fac.code )];
          let facError = true;
          let facId    = null;
          if (facRef) {
            if (validUnitType(facRef.unitType, "Base")) {
              let facType  = facRef.type;
              facError     = false;
              //switch not working ... using if else
              if (facType == 'Factory') {
                newFacility = await new Factory(facRef);
                facId = newFacility._id;
              } else if (facType == 'Lab') {
                newFacility = await new Lab(facRef);
                newFacility.sciRate = facRef.sciRate;
                newFacility.bonus   = facRef.bonus;
                newFacility.funding = facRef.funding;
                facId = newFacility._id;
              } else if (facType == 'Hanger') {
                newFacility = await new Hanger(facRef);
                facId = newFacility._id;
              } else if (facType == 'Crisis') {
                newFacility = await new Crisis(facRef);
                facId = newFacility._id;
              } else if (facType == 'Civilian') {
                newFacility = await new Civilian(facRef);
                facId = newFacility._id;
              } else {
                logger.error("Invalid Facility Type In baseSite Load:", facRef.type);
                facError = true;
              }
            } else {
              logger.debug(`Error in creation of facility ${fac} for  ${baseSite.name} - wrong unitType`);
              facError = true;
            }
          } else {
            logger.debug(`Error in creation of facility ${fac} for  ${baseSite.name}`);
            facError = true;
          }

          if (!facError) {
            newFacility.site = baseSite._id;
            newFacility.team = baseSite.team;
            newFacility.name = fac.name;

            await newFacility.save(((err, newFacility) => {
              if (err) {
                delFacilities(baseSite.facilities);
                logger.error(`New BaseSite Facility Save Error: ${err}`);
                facError = true;
                //return;
              }
              //baseSiteLoadDebugger(baseSite.name, "Facility", fac.name, " add saved to facility collection.");
            }));
            if (!facError) {
              baseSite.facilities.push(facId);
            }
          }
        }
      }

      if (loadError) {
        delFacilities(baseSite.facilities);
        logger.error(`Base Site skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`);
        ++rCounts.loadErrCount;
        return;
      } else {
        await baseSite.save((err, baseSite) => {
          if (err) {
            delFacilities(baseSite.facilities);
            logger.error(`Update BaseSite Save Error: ${err}`);
            ++rCounts.loadErrCount;
            return;
          }
          ++rCounts.updCount;
          baseSiteLoadDebugger(`${baseSite.name} update saved to baseSite collection.`);
          return;
        });
      }
    }
  } catch (err) {
    logger.error(`Catch Base Error: ${err.message}`);
    ++rCounts.loadErrCount;
    return;
  }
};

async function deleteAllBases(doLoad) {

  //baseSiteLoadDebugger("Jeff in deleteAllBaseSites", doLoad);
  if (!doLoad) return;

  try {
    for await (const baseSite of BaseSite.find()) {
      let id = baseSite._id;
      try {
        // remove associated facility records
        for (let j = 0; j < baseSite.facilities.length; ++j ) {
          facilityId = baseSite.facilities[j];
          let facilityDel = await Facility.findByIdAndRemove(facilityId);
          if (facilityDel = null) {
            baseSiteLoadDebugger(`The Base Facility with the ID ${facilityId} was not found!`);
          }
        }
        let baseDel = await BaseSite.findByIdAndRemove(id);
        if (baseDel = null) {
          baseSiteLoadDebugger(`The BaseSite with the ID ${id} was not found!`);
        }
      } catch (err) {
        baseSiteLoadDebugger('BaseSite Delete All Error:', err.message);
      }
    }
    baseSiteLoadDebugger("All BaseSites succesfully deleted!");
  } catch (err) {
    baseSiteLoadDebugger(`Delete All BaseSites Catch Error: ${err.message}`);
  }
};

async function delFacilities(arrayIds) {
  // remove associated facility records
  for (let j = 0; j < arrayIds.length; ++j ) {
    facId = arrayIds[j];
    let facDel = await Facility.findByIdAndRemove(facId);
    if (facDel = null) {
      logger.debug(`The Base Facility with the ID ${facId} was not found!`);
    }
  }
}

module.exports = runbaseSiteLoad;
