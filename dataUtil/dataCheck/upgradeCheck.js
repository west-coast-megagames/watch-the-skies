// Upgrade Model - Using Mongoose Model
const {
  Upgrade,
  validateUpgrade,
  Gear,
  Kit,
  System,
} = require("../models/upgrade");
const { Team } = require("../models/team");

const upgradeCheckDebugger = require("debug")("app:upgradeCheck");
const { logger } = require("../middleware/log/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const systemCategories = ["Weapon", "Engine", "Sensor", "Compartment", "Util"];
const gearCategories = ["Weapons", "Vehicles", "Transport", "Training"];
//do not have kit Category yet
//const kitCategories = [];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkUpgrade(runFlag) {
  for (const upgrade of await Upgrade.find()
    //.populate("team", "name teamType")             does not work with .lean
    //.populate("manufacturer", "name teamType")     does not work with .lean()
    .lean()) {
    /* does not work with .lean()                             
    if (!upgrade.populated("team")) {  
      logger.error(`Team link missing for Upgrade ${upgrade.name} ${upgrade._id}`);
    }
    */
    if (!upgrade.hasOwnProperty("team")) {
      logger.error(
        `team link missing for Upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      let team = await Team.findById({ _id: upgrade.team });
      if (!team) {
        logger.error(
          `team reference is invalid for Upgrade ${upgrade.name} ${upgrade._id}`
        );
      }
    }

    if (!upgrade.hasOwnProperty("manufacturer")) {
      logger.error(
        `Manufacturer link missing for Upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      let team = await Team.findById({ _id: upgrade.manufacturer });
      if (!team) {
        logger.error(
          `manufacturer/team reference is invalid for Upgrade ${upgrade.name} ${upgrade._id}`
        );
      }
    }

    if (!upgrade.hasOwnProperty("model")) {
      logger.error(`model missing for Upgrade ${upgrade.name} ${upgrade._id}`);
    }

    if (!upgrade.hasOwnProperty("gameState")) {
      logger.error(
        `gameState missing for Upgrade ${upgrade.name} ${upgrade._id}`
      );
    }

    if (!upgrade.hasOwnProperty("serviceRecord")) {
      logger.error(
        `serviceRecord missing for Upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      for (let i = 0; i < upgrade.serviceRecord.length; ++i) {
        let lFind = await Log.findById(upgrade.serviceRecord[i]);
        if (!lFind) {
          logger.error(
            `Upgrade ${upgrade.name} ${upgrade._id} has an invalid serviceRecord reference ${i}: ${upgrade.serviceRecord[i]}`
          );
        }
      }
    }

    if (!upgrade.hasOwnProperty("name")) {
      logger.error(`name missing for Upgrade ${upgrade.name} ${upgrade._id}`);
    } else {
      if (
        upgrade.name === "" ||
        upgrade.name == undefined ||
        upgrade.name == null
      ) {
        logger.error(
          `name is blank for Upgrade ${upgrade.name} ${upgrade._id}`
        );
      }
    }

    if (!upgrade.hasOwnProperty("code")) {
      logger.error(`code missing for Upgrade ${upgrade.name} ${upgrade._id}`);
    } else {
      if (
        upgrade.code === "" ||
        upgrade.code == undefined ||
        upgrade.code == null
      ) {
        logger.error(
          `code is blank for Upgrade ${upgrade.name} ${upgrade._id}`
        );
      }
    }

    if (!upgrade.hasOwnProperty("unitType")) {
      logger.error(
        `unitType missing for Upgrade ${upgrade.name} ${upgrade._id}`
      );
    }

    if (!upgrade.hasOwnProperty("cost")) {
      logger.error(`cost missing for Upgrade ${upgrade.name} ${upgrade._id}`);
    } else {
      if (isNaN(upgrade.cost)) {
        logger.error(
          `Upgrade ${upgrade.name} ${upgrade._id} cost is not a number ${upgrade.cost}`
        );
      }
    }

    if (!upgrade.hasOwnProperty("buildTime")) {
      logger.error(
        `buildTime missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      if (isNaN(upgrade.buildTime)) {
        logger.error(
          `upgrade ${upgrade.name} ${upgrade._id} buildTime is not a number ${upgrade.buildTime}`
        );
      }
    }

    if (!upgrade.hasOwnProperty("buildCount")) {
      logger.error(
        `buildCount missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      if (isNaN(upgrade.buildCount)) {
        logger.error(
          `upgrade ${upgrade.name} ${upgrade._id} buildCount is not a number ${upgrade.buildCount}`
        );
      }
    }

    if (!upgrade.hasOwnProperty("desc")) {
      logger.error(`desc missing for upgrade ${upgrade.name} ${upgrade._id}`);
    }

    if (!upgrade.hasOwnProperty("prereq")) {
      logger.error(`prereq missing for upgrade ${upgrade.name} ${upgrade._id}`);
    } else {
      for (let j = 0; j < upgrade.prereq.length; ++j) {
        if (!upgrade.prereq[j].hasOwnProperty("type")) {
          logger.error(
            `prereq.type ${j} missing for upgrade ${upgrade.name} ${upgrade._id}`
          );
        }
        if (!upgrade.prereq[j].hasOwnProperty("code")) {
          logger.error(
            `prereq.code ${j} missing for upgrade ${upgrade.name} ${upgrade._id}`
          );
        }
      }
    }

    if (!upgrade.hasOwnProperty("status")) {
      logger.error(`status missing for upgrade ${upgrade.name} ${upgrade._id}`);
    } else {
      if (!upgrade.status.hasOwnProperty("building")) {
        logger.error(
          `status.building missing for upgrade ${upgrade.name} ${upgrade._id}`
        );
      }
      if (!upgrade.status.hasOwnProperty("salvage")) {
        logger.error(
          `status.salvage missing for upgrade ${upgrade.name} ${upgrade._id}`
        );
      }
      if (!upgrade.status.hasOwnProperty("damaged")) {
        logger.error(
          `status.damaged missing for upgrade ${upgrade.name} ${upgrade._id}`
        );
      }
      if (!upgrade.status.hasOwnProperty("destroyed")) {
        logger.error(
          `status.destroyed missing for upgrade ${upgrade.name} ${upgrade._id}`
        );
      }

      if (!upgrade.status.hasOwnProperty("storage")) {
        logger.error(
          `status.storage missing for upgrade ${upgrade.name} ${upgrade._id}`
        );
      }

      if (upgrade.status.building) {
        logger.info(
          `upgrade Status Is Building For ${upgrade.name} ${upgrade._id}`
        );
      }
    }

    /* not yet (???)
    if (!upgrade.hasOwnProperty("militaryStats")) {
      logger.error(
        `militaryStats missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      //don't take it down to stats fields as they are only present if value assigned (no defaults)
    }

    if (!upgrade.hasOwnProperty("facilityStats")) {
      logger.error(
        `facilityStats missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      //don't take it down to stats fields as they are only present if value assigned (no defaults)
    }

    if (!upgrade.hasOwnProperty("aircraftStats")) {
      logger.error(
        `aircraftStats missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      //don't take it down to stats fields as they are only present if value assigned (no defaults)
		}
		jeff */

    try {
      let { error } = validateUpgrade(upgrade);
      if (error) {
        logger.error(
          `upgrade Validation Error For ${upgrade.name} ${upgrade._id} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `upgrade Validation Error For ${upgrade.name} ${upgrade._id} Error: ${err.details[0].message}`
      );
    }
  }

  return true;
}

module.exports = chkUpgrade;
