const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initSpacecraft.json', 'utf8');
const spacecraftDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const spacecraftDebugger = require('debug')('app:spacecraftLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');
const { convertToDms } = require('../../util/systems/geo');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Spacecraft Model - Using Mongoose Model
const { Spacecraft, validateSpacecraft } = require('../../models/sites/site');
const { Country } = require('../../models/country');
const { Team } = require('../../models/team/team');
const { Facility, Lab, Hanger, Factory, Crisis, Civilian } = require('../../models/gov/facility/facility');
const { Zone } = require('../../models/zone');
const { loadFacilitys, facilitys } = require('../../wts/construction/facilities/facilities');
const { delFacilities } = require('../../wts/util/construction/deleteFacilities');
const { validUnitType } = require('../../wts/util/construction/validateUnitType');
const {  addSatelliteToZone,   } = require('../../wts/util/construction/zoneSatellite');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runSpacecraftLoad(runFlag){
  try {
    //spacecraftDebugger("Jeff in runSpacecraftLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {

      await loadFacilitys();                    // load wts/json/facilities/facilitys.json data into array

      await deleteAllSpacecraft(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    logger.error(`Catch runSpacecraftLoad Error: ${err.message}`);
    return;
  }
};

async function initLoad(doLoad) {

  if (!doLoad) return;
  let recReadCount = 0;
  let recCounts = { loadCount: 0,
                    loadErrCount: 0,
                    updCount: 0};

  for (let i = 0; i < spacecraftDataIn.length; ++i ) {
    ++recReadCount;
    await loadSpacecraft(spacecraftDataIn[i], recCounts);
  }

  logger.info(`Spacecraft Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`);

};


async function loadSpacecraft(iData, rCounts){
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";
  let loadCode = "";
  try {
    let spacecraft = await Spacecraft.findOne( { name: iData.name } );

    loadName = iData.name;
    loadCode = iData.code;

    let newLatDecimal = iData.latDecimal;
    let newLongDecimal = iData.longDecimal;
    if (!newLatDecimal) {
      newLatDecimal = 0;
    }
    if (!newLongDecimal) {
      newLongDecimal = 0;
    }
    let newLatDMS = convertToDms(newLatDecimal, false);
    let newLongDMS = convertToDms(newLongDecimal, true);

    if (!spacecraft) {
      // New Spacecraft here  
      let spacecraft = new Spacecraft({
        name: iData.name,
        siteCode: iData.code,
        geoDMS: {
        latDMS: newLatDMS,
        longDMS: newLongDMS
        },
        geoDecimal: {
         latDecimal: newLatDecimal,
         longDecimal: newLongDecimal
        }
      });

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //spacecraftDebugger("Spacecraft Load Team Error, New Spacecraft:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          spacecraft.team  = team._id;
          //spacecraftDebugger("Spacecraft Load Team Found, Spacecraft:", iData.name, " Team: ", iData.countryCode, "Team ID:", team._id);
        }
      }

      let { error } = validateSpacecraft(spacecraft);
      if (error) {
        //spacecraftDebugger("New Spacecraft Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return;
      }

      spacecraft.shipType     = iData.shipType;
      spacecraft.status       = iData.status;
      spacecraft.hidden       = iData.hidden;

      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //spacecraftDebugger("Spacecraft Load Country Error, New Spacecraft:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.countryCode;
        } else {
          spacecraft.country = country._id;
          spacecraft.zone    = country.zone;
          //spacecraftDebugger("Spacecraft Load Country Found, New Spacecraft:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }
      }

      spacecraft.facilities = [];
      if (!loadError) {

        // create facility records for spacecraft
        for (let fac of iData.facilities) {
          let facError = true;
          let facId    = null;
          let facRef = facilitys[facilitys.findIndex(facility => facility.code === fac.code )];
          if (facRef) {
            if (validUnitType(facRef.unitType, "Spacecraft")) {
              facError     = false;
              let facType  = facRef.type;
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
                logger.error(`Invalid Facility Type In spacecraft Load: ${facRef.type}`);
                facError = true;
              }
            } else {
              logger.debug(`Error in creation of facility ${fac} for  ${spacraft.name} - wrong unitType`);
              facError = true;
            }
          } else {
            logger.debug(`Error in creation of facility ${fac} for  ${spacecraft.name}`);
            facError = true;
          }

          if (!facError) {
            newFacility.site = spacecraft._id;
            newFacility.team = spacecraft.team;
            newFacility.name = fac.name;

            await newFacility.save(((err, newFacility) => {
              if (err) {
                logger.error(`New Spacecraft Facility Save Error: ${err}`);
                facError = true;
              }
              //spacecraftDebugger(spacecraft.name, "Facility", fac.name, " add saved to facility collection.");
            }));

            if (!facError) {
              spacecraft.facilities.push(facId);
            }
          }
        }
      }

      if (loadError) {
        ++rCounts.loadErrCount;
        logger.error(`Spacecraft skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`);
        delFacilities(spacecraft.facilities);
        return;
      } else {
        await spacecraft.save((err, spacecraft) => {
          if (err) {
            ++rCounts.loadErrCount;
            delFacilities(spacecraft.facilities);
            logger.error(`New Spacecraft Save Error: ${err}`);
            return;
          }
          ++rCounts.loadCount;
          spacecraftDebugger(`${spacecraft.name} add saved to spacecraft collection.`);
          //updateStats(spacecraft._id);

          if (spacecraft.shipType === "Satellite") {
             addSatelliteToZone(spacecraft._id, spacecraft.zone, spacecraft.team);
          }
        });
      }
    } else {
      // Existing Spacecraft here ... update
      let id = spacecraft._id;

      spacecraft.name         = iData.name;
      spacecraft.siteCode     = iData.code;
      spacecraft.baseDefenses = iData.baseDefenses;
      spacecraft.baseDefenses = iData.baseDefenses;
      spacecraft.shipType     = iData.shipType;
      spacecraft.status       = iData.status;
      spacecraft.stats        = iData.stats;
      spacecraft.hidden       = iData.hidden;
      spacecraft.latDMS       = newLatDMS;
      spacecraft.longDMS      = newLongDMS;
      spacecraft.latDecimal   = newLatDecimal;
      spacecraft.longDecimal  = newLongDecimal;

      if (iData.teamCode != ""){
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //spacecraftDebugger("Spacecraft Load Team Error, Update Spacecraft:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          spacecraft.team = team._id;
          //spacecraftDebugger("Spacecraft Load Update Team Found, Spacecraft:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }

      if (iData.countryCode != ""){
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //spacecraftDebugger("Spacecraft Load Country Error, Update Spacecraft:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.countryCode;
        } else {
          spacecraft.country = country._id;
          spacecraft.zone    = country.zone;
          //spacecraftDebugger("Spacecraft Load Country Found, Update Spacecraft:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }
      }

      const { error } = validateSpacecraft(spacecraft);
      if (error) {
        //spacecraftDebugger("Spacecraft Update Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return
      }

      spacecraft.facilities = [];
      if (!loadError) {
        // create facility records for spacecraft
        for (let fac of iData.facilities) {
          let facRef = facilitys[facilitys.findIndex(facility => facility.code === fac.code )];
          let facError = true;
          let facId    = null;
          if (facRef) {
            if (validUnitType(facRef.unitType, "Spacecraft")) {
              let facType  = facRef.type;
              facError     = false;
              //switch not working ... using if else
              if (facType == 'Factory') {
                newFacility = await new Factory(facRef);
                facId = newFacility._id;
              } else if (facType == 'Lab') {
                newFacility = await new Lab(facRef);
                facId = newFacility._id;
                newFacility.sciRate = facRef.sciRate;
                newFacility.bonus   = facRef.bonus;
                newFacility.funding = facRef.funding;
              } else if (facType == 'Hanger') {
                newFacility = await new Hanger(fac);
                facId = newFacility._id;
              } else if (facType == 'Crisis') {
                newFacility = await new Crisis(facRef);
                facId = newFacility._id;
              } else if (facType == 'Civilian') {
                newFacility = await new Civilian(facRef);
                facId = newFacility._id;
              } else {
                logger.error("Invalid Facility Type In Spacecraft Load:", facRef.type);
                facError = true;
              }
            } else {
              logger.debug(`Error in creation of facility ${fac} for  ${spacecraft.name} - wrong unitType`);
              facError = true;
            }
          } else {
            logger.debug(`Error in creation of facility ${fac} for  ${spacecraft.name}`);
            facError = true;
          }

          if (!facError) {
            newFacility.site = spacecraft._id;
            newFacility.team = spacecraft.team;
            newFacility.name = fac.name;

            await newFacility.save(((err, newFacility) => {
              if (err) {
                delFacilities(spacecraft.facilities);
                logger.error(`Update Spacecraft Facility Save Error: ${err}`);
                facError = true;
              }
              //spacecraftDebugger(spacecraft.name, "Facility", fac.name, " add saved to facility collection.");

            }));

            if (!facError) {
              spacecraft.facilities.push(facId);
            }
          }
        }
      }

      if (loadError) {
        delFacilities(spacecraft.facilities);
        logger.error(`Spacecraft skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`);
        ++rCounts.loadErrCount;
        return;
      } else {
        await spacecraft.save((err, spacecraft) => {
          if (err) {
            delFacilities(spacecraft.facilities);
            logger.error(`Update Spacecraft Save Error: ${err}`);
            ++rCounts.loadErrCount;
            return;
          }
          spacecraftDebugger(`${spacecraft.name}  add saved to spacecraft collection.`);
          ++rCounts.updCount;
          //updateStats(spacecraft._id);
          return;
        });
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch Spacecraft Error: ${err.message}`);
    return;
  }
};

async function deleteAllSpacecraft(doLoad) {

  spacecraftDebugger("Jeff in deleteAllSpacecrafts", doLoad);
  if (!doLoad) return;

  try {
    for await (const spacecraft of Spacecraft.find()) {
      let id = spacecraft._id;
      try {
        let spacecraftDel = await Spacecraft.findByIdAndRemove(id);
        if (spacecraftDel = null) {
          spacecraftDebugger(`The Spacecraft with the ID ${id} was not found!`);
        }
      } catch (err) {
        spacecraftDebugger('Spacecraft Delete All Error:', err.message);
      }
    }
    spacecraftDebugger("All Spacecrafts succesfully deleted!");
  } catch (err) {
    spacecraftDebugger(`Delete All Spacecrafts Catch Error: ${err.message}`);
  }
};


module.exports = runSpacecraftLoad;
