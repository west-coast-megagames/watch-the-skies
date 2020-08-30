// Military Model - Using Mongoose Model
const {
  Military,
  validateMilitary,
  Fleet,
  Corps,
} = require("../models/ops/military/military");
const { Gear } = require("../models/gov/upgrade/upgrade");
const { Site } = require("../models/sites/site");
const { Team } = require("../models/team/team");
const { Country } = require("../models/country");
const { Zone } = require("../models/zone");
const { Log } = require("../models/logs/log");
const { Facility } = require("../models/gov/facility/facility");

const militaryCheckDebugger = require("debug")("app:militaryCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

// type are Terrestrial(earth) and Alien (T or A)
const typeVals = ["Fleet", "Corps"];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkMilitary(runFlag) {
  for (const military of await Military.find()
    //.populate("team", "name teamType")       does not work with .lean()
    //.populate("country", "name type")        does not work with .lean()
    //.populate("zone", "name")            does not work with .lean()
    //.populate("origin", "name")            does not work with .lean()
    .lean()) {
    /* does not work with .lean()
    if (!military.populated("team")) {  
      logger.error(`Team link missing for Military ${military.name} ${military._id}`);
    }

    if (!military.populated("country")) {  
      logger.error(`Country link missing for Military ${military.name} ${military._id}`);
    }

    if (!military.populated("zone")) {  
      logger.error(`Zone link missing for Military ${military.name} ${military._id}`);
    }

    if (!military.populated("origin")) {  
      logger.error(`origin link missing for Military ${military.name} ${military._id}`);
    }
    */

    if (!military.hasOwnProperty("model")) {
      logger.error(
        `model missing for Military ${military.name} ${military._id}`
      );
    }

    if (!military.hasOwnProperty("gameState")) {
      logger.error(
        `gameState missing for Military ${military.name} ${military._id}`
      );
    }

    if (!military.hasOwnProperty("name")) {
      logger.error(
        `name missing for Military ${military.name} ${military._id}`
      );
    } else {
      if (
        military.name === "" ||
        military.name == undefined ||
        military.name == null
      ) {
        logger.error(
          `name is blank for Military ${military.name} ${military._id}`
        );
      }
    }

    if (!military.hasOwnProperty("team")) {
      logger.error(
        `team missing for Military ${military.name} ${military._id}`
      );
    } else {
      let team = await Team.findById({ _id: military.team });
      if (!team) {
        logger.error(
          `team reference is invalid for Military ${military.name} ${military._id}`
        );
      }
    }

    if (!military.hasOwnProperty("zone")) {
      logger.error(
        `zone missing for Military ${military.name} ${military._id}`
      );
    } else {
      let zone = await Zone.findById({ _id: military.zone });
      if (!zone) {
        logger.error(
          `zone reference is invalid for Military ${military.name} ${military._id}`
        );
      }
    }

    if (!military.hasOwnProperty("country")) {
      logger.error(
        `country missing for Military ${military.name} ${military._id}`
      );
    } else {
      let country = await Country.findById({ _id: military.country });
      if (!country) {
        logger.error(
          `country reference is invalid for Military ${military.name} ${military._id}`
        );
      }
    }

    if (!military.hasOwnProperty("site")) {
      logger.error(
        `site missing for Military ${military.name} ${military._id}`
      );
    } else {
      let site = await Site.findById({ _id: military.site });
      if (!site) {
        logger.error(
          `site reference is invalid for Military ${military.name} ${military._id}`
        );
      }
    }

    if (!military.hasOwnProperty("origin")) {
      logger.error(
        `origin missing for Military ${military.name} ${military._id}`
      );
    } else {
      let facility = await Facility.findById({ _id: military.origin });
      if (!facility) {
        logger.error(
          `origin reference is invalid for Military ${military.name} ${military._id}`
        );
      }
    }

    if (!military.hasOwnProperty("status")) {
      logger.error(
        `status missing for Military ${military.name} ${military._id}`
      );
    } else {
      if (!military.status.hasOwnProperty("deployed")) {
        logger.error(
          `status.deployed missing for Military ${military.name} ${military._id}`
        );
      }
      if (!military.status.hasOwnProperty("damaged")) {
        logger.error(
          `status.damaged missing for Military ${military.name} ${military._id}`
        );
      }
      if (!military.status.hasOwnProperty("destroyed")) {
        logger.error(
          `status.destroyed missing for Military ${military.name} ${military._id}`
        );
      }
      if (!military.status.hasOwnProperty("repair")) {
        logger.error(
          `status.repair missing for Military ${military.name} ${military._id}`
        );
      }
      if (!military.status.hasOwnProperty("secret")) {
        logger.error(
          `status.secret missing for Military ${military.name} ${military._id}`
        );
      }
    }

    if (!military.hasOwnProperty("hidden")) {
      logger.error(
        `hidden missing for Military ${military.name} ${military._id}`
      );
    }

    if (!military.hasOwnProperty("gear")) {
      logger.error(
        `gear missing for Military ${military.name} ${military._id}`
      );
    } else {
      if (military.gear.length < 1) {
        logger.error(
          `No gear assigned for Military ${military.name} ${military._id}`
        );
      }

      //militaryCheckDebugger(`Military ${military.name} ${military._id} Check of Gear ${military.gear.length}`);
      for (let i = 0; i < military.gear.length; ++i) {
        //militaryCheckDebugger(`Military ${military.name} ${military._id} about to find gear for ID ${military.gear[i]}`);
        let gFind = await Gear.findById(military.gear[i]);
        if (!gFind) {
          logger.error(
            `Military ${military.name} ${military._id} has an invalid gear reference ${i}: ${military.gear[i]}`
          );
        }
      }
    }

    if (!military.hasOwnProperty("serviceRecord")) {
      logger.error(
        `serviceRecord missing for Military ${military.name} ${military._id}`
      );
    } else {
      //militaryCheckDebugger(`Military ${military.name} ${military._id} Check of Gear ${military.gear.length}`);
      for (let i = 0; i < military.serviceRecord.length; ++i) {
        //militaryCheckDebugger(`Military ${military.name} ${military._id} about to find gear for ID ${military.gear[i]}`);
        let lFind = await Log.findById(military.serviceRecord[i]);
        if (!lFind) {
          logger.error(
            `Military ${military.name} ${military._id} has an invalid serviceRecord reference ${i}: ${military.serviceRecord[i]}`
          );
        }
      }
    }

    if (!military.hasOwnProperty("type")) {
      logger.error(
        `type missing for Military ${military.name} ${military._id}`
      );
    } else {
      if (!inArray(typeVals, military.type)) {
        logger.error(
          `Invalid type ${military.type} for Military ${military.name} ${military._id}`
        );
      }
      if (military.type === "Fleet" || military.type === "Corps") {
        if (!military.hasOwnProperty("stats")) {
          logger.error(
            `stats missing for Military ${military.name} ${military._id}`
          );
        } else {
          if (!military.stats.hasOwnProperty("health")) {
            logger.error(
              `stats.health missing for Military ${military.name} ${military._id}`
            );
          }
          if (!military.stats.hasOwnProperty("healthMax")) {
            logger.error(
              `stats.healthMax missing for Military ${military.name} ${military._id}`
            );
          }
          if (!military.stats.hasOwnProperty("attack")) {
            logger.error(
              `stats.attack missing for Military ${military.name} ${military._id}`
            );
          }
          if (!military.stats.hasOwnProperty("defense")) {
            logger.error(
              `stats.defense missing for Military ${military.name} ${military._id}`
            );
          }
          if (!military.stats.hasOwnProperty("localDeploy")) {
            logger.error(
              `stats.localDeploy missing for Military ${military.name} ${military._id}`
            );
          }
          if (!military.stats.hasOwnProperty("globalDeploy")) {
            logger.error(
              `stats.globalDeploy missing for Military ${military.name} ${military._id}`
            );
          }
          if (!military.stats.hasOwnProperty("invasion")) {
            logger.error(
              `stats.invasion missing for Military ${military.name} ${military._id}`
            );
          }
        }
      } else {
        logger.error(
          `Invalid Type ${military.type} for Military ${military.name} ${military._id}`
        );
      }
    }

    try {
      let { error } = validateMilitary(military);
      if (error) {
        logger.error(
          `Military Validation Error For ${military.name} ${military._id} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Military Validation Error For ${military.name} ${military._id} Error: ${err.details[0].message}`
      );
    }
  }
  return true;
}

module.exports = chkMilitary;
