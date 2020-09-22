// Zone Model - Using Mongoose Model
const {
  Zone,
  validateZone,
  GroundZone,
  validateGroundZone,
  SpaceZone,
  validateSpaceZone,
} = require("../models/zone");
const { Country } = require("../models/country");
const { Site } = require("../models/site");

const zoneCheckDebugger = require("debug")("app:zoneCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

async function chkZone(runFlag) {
  // get countries once
  let cFinds = await Country.find();
  //zoneCheckDebugger(`jeff here length of cFinds ${cFinds.length}`);
  for (const zone of await Zone.find().lean()) {
    //do not need toObject with .lean()
    //let testPropertys = zone.toObject();

    if (!zone.hasOwnProperty("code")) {
      logger.error(`code missing for zone ${zone.name} ${zone._id}`);
    } else {
      if (zone.code === "" || zone.code == undefined || zone.code == null) {
        logger.error(`code is blank for Zone ${zone.name} ${zone._id}`);
      }
    }

    if (!zone.hasOwnProperty("name")) {
      logger.error(`name missing for zone ${zone._id}`);
    } else {
      if (zone.name === "" || zone.name == undefined || zone.name == null) {
        logger.error(`name is blank for Zone ${zone.code} ${zone._id}`);
      }
    }

    if (!zone.hasOwnProperty("model")) {
      logger.error(`model missing for zone ${zone.name} ${zone._id}`);
    }

    if (!zone.hasOwnProperty("gameState")) {
      logger.error(`gameState missing for zone ${zone.name} ${zone._id}`);
    }

    if (!zone.hasOwnProperty("serviceRecord")) {
      logger.error(`serviceRecord missing for Zone ${zone.name} ${zone._id}`);
    } else {
      for (let i = 0; i < zone.serviceRecord.length; ++i) {
        let lFind = await Log.findById(zone.serviceRecord[i]);
        if (!lFind) {
          logger.error(
            `Zone ${zone.name} ${zone._id} has an invalid serviceRecord reference ${i}: ${zone.serviceRecord[i]}`
          );
        }
      }
    }

    // should be at least one country in the zone
    let countryCount = 0;
    let zoneId = zone._id.toHexString();
    countryLoop: for (let j = 0; j < cFinds.length; ++j) {
      let cZoneId = cFinds[j].zone.toHexString();
      if (cZoneId === zoneId) {
        ++countryCount;
      }
      //only need one
      if (countryCount > 0) {
        break countryLoop;
      }
    }

    /* 2020-08-27 no longer requiring at least one country per zone
    //zoneCheckDebugger(`Zone ${zone.code} has ${countryCount} countries`);
    if (countryCount < 1) {
      logger.error(`No Countries Found In Zone ${zone.code} ${zone.name}`);
    }
    */

    if (zone.type === "Space") {
      try {
        let { error } = await validateSpaceZone(zone);
        if (error) {
          logger.error(
            `Zone Space Validation Error For ${zone.code} ${zone.name} Error: ${error.details[0].message}`
          );
        }
      } catch (err) {
        logger.error(
          `Zone Space Validation Error For ${zone.code} ${zone.name} Error: ${err.details[0].message}`
        );
      }
    } else {
      if (!zone.hasOwnProperty("terror")) {
        logger.error(`Terror missing for zone ${zone.name} ${zone._id}`);
      } else {
        if (isNaN(zone.terror)) {
          logger.error(
            `Zone ${zone.name} ${zone._id} terror is not a number ${zone.terror}`
          );
        }
      }

      try {
        let { error } = await validateGroundZone(zone);
        if (error) {
          logger.error(
            `Zone Ground Validation Error For ${zone.code} ${zone.name} Error: ${error.details[0].message}`
          );
        }
      } catch (err) {
        logger.error(
          `Zone Ground Validation Error For ${zone.code} ${zone.name} Error: ${err.details[0].message}`
        );
      }
    }
  }
  return true;
}

module.exports = chkZone;
