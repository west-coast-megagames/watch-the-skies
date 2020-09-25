// Aircraft Model - Using Mongoose Model
const {
  Aircraft,
  validateAircraft,
  validateName,
  validateAddr,
} = require("../models/aircraft");
const { Upgrade } = require("../models/upgrade");
const { Team } = require("../models/team");
const { Zone } = require("../models/zone");
const { Country } = require("../models/country");
const { Site } = require("../models/site");
const { Log } = require("../models/logs/log");
const { Facility } = require("../models/facility");

const aircraftCheckDebugger = require("debug")("app:aircraftCheck");
const { logger } = require("../middleware/log/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const typeVals = ["Interceptor", "Transport", "Decoy", "Fighter"];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkAircraft(runFlag) {
  for (const aircraft of await Aircraft.find()
    // does not work with .lean
    /*
                               .populate("team", "name teamType")
                               .populate("zone", "name")
                               .populate("origin", "name")
                               .populate("country", "name")
                               .populate("site", "name")
                               */
    .lean()) {
    //do not need toObject with .lean()
    //let testPropertys = aircraft.toObject();

    if (!aircraft.hasOwnProperty("team")) {
      logger.error(
        `Team missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      let team = await Team.findById({ _id: aircraft.team });
      if (!team) {
        logger.error(
          `team reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
    }

    if (!aircraft.hasOwnProperty("zone")) {
      logger.error(
        `Zone missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      let zone = await Zone.findById({ _id: aircraft.zone });
      if (!zone) {
        logger.error(
          `zone reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
    }

    if (!aircraft.hasOwnProperty("country")) {
      logger.error(
        `Country missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      let country = await Country.findById({ _id: aircraft.country });
      if (!country) {
        logger.error(
          `country reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
    }

    let skipSiteCheck = false;
    // assume all types should have a site/origin

    if (!skipSiteCheck) {
      if (!aircraft.hasOwnProperty("origin")) {
        logger.error(
          `origin missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        let facility = await Facility.findById({ _id: aircraft.origin });
        if (!facility) {
          logger.error(
            `origin reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }

      if (!aircraft.hasOwnProperty("site")) {
        logger.error(
          `site missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        let site = await Site.findById({ _id: aircraft.site });
        if (!site) {
          logger.error(
            `site reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }
    }

    if (!aircraft.hasOwnProperty("serviceRecord")) {
      logger.error(
        `serviceRecord missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      for (let i = 0; i < aircraft.serviceRecord.length; ++i) {
        let lFind = await Log.findById(aircraft.serviceRecord[i]);
        if (!lFind) {
          logger.error(
            `Aircraft ${aircraft.name} ${aircraft._id} has an invalid serviceRecord reference ${i}: ${aircraft.serviceRecord[i]}`
          );
        }
      }
    }

    if (!aircraft.hasOwnProperty("model")) {
      logger.error(
        `model missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    }

    if (!aircraft.hasOwnProperty("gameState")) {
      logger.error(
        `gameState missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    }

    if (!aircraft.hasOwnProperty("type")) {
      logger.error(
        `type missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      if (!inArray(typeVals, aircraft.type)) {
        logger.error(
          `Invalid type ${aircraft.type} for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
    }

    if (!aircraft.hasOwnProperty("name")) {
      logger.error(`name missing for Aircraft ${aircraft._id}`);
    } else {
      if (
        aircraft.name === "" ||
        aircraft.name == undefined ||
        aircraft.name == null
      ) {
        logger.error(`name is blank for Aircraft ${aircraft._id}`);
      }
    }

    if (!aircraft.hasOwnProperty("mission")) {
      logger.error(
        `mission missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    }

    if (!aircraft.hasOwnProperty("status")) {
      logger.error(
        `status missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      if (!aircraft.status.hasOwnProperty("damaged")) {
        logger.error(
          `status.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.status.hasOwnProperty("deployed")) {
        logger.error(
          `status.deployed missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.status.hasOwnProperty("destroyed")) {
        logger.error(
          `status.destroyed missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.status.hasOwnProperty("ready")) {
        logger.error(
          `status.ready missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.status.hasOwnProperty("upgrade")) {
        logger.error(
          `status.upgrade missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.status.hasOwnProperty("repair")) {
        logger.error(
          `status.repair missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.status.hasOwnProperty("secret")) {
        logger.error(
          `status.secret missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
    }

    if (!aircraft.hasOwnProperty("upgrades")) {
      logger.error(
        `upgrades missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      for (let i = 0; i < aircraft.upgrades.length; ++i) {
        let uFind = await Upgrade.findById(aircraft.upgrades[i]);
        if (!uFind) {
          logger.error(
            `Aircraft ${aircraft.name} ${aircraft._id} has an invalid upgrades reference ${i}: ${aircraft.upgrades[i]}`
          );
        }
      }
    }

    if (!aircraft.hasOwnProperty("newSystems")) {
      logger.error(
        `newSystems missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      if (!aircraft.newSystems.hasOwnProperty("cockpit")) {
        logger.error(
          `newSystems.cockpit missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        if (!aircraft.newSystems.cockpit.hasOwnProperty("active")) {
          logger.error(
            `newSystems.cockpit.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
        if (!aircraft.newSystems.cockpit.hasOwnProperty("damaged")) {
          logger.error(
            `newSystems.cockpit.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }
      if (!aircraft.newSystems.hasOwnProperty("engine")) {
        logger.error(
          `newSystems.engine missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        if (!aircraft.newSystems.engine.hasOwnProperty("active")) {
          logger.error(
            `newSystems.engine.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
        if (!aircraft.newSystems.engine.hasOwnProperty("damaged")) {
          logger.error(
            `newSystems.engine.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }

      if (!aircraft.newSystems.hasOwnProperty("weapon")) {
        logger.error(
          `newSystems.weapon missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        if (!aircraft.newSystems.weapon.hasOwnProperty("active")) {
          logger.error(
            `newSystems.weapon.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
        if (!aircraft.newSystems.weapon.hasOwnProperty("damaged")) {
          logger.error(
            `newSystems.weapon.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }
      if (!aircraft.newSystems.hasOwnProperty("sensor")) {
        logger.error(
          `newSystems.sensor missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        if (!aircraft.newSystems.sensor.hasOwnProperty("active")) {
          logger.error(
            `newSystems.sensor.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
        if (!aircraft.newSystems.sensor.hasOwnProperty("damaged")) {
          logger.error(
            `newSystems.sensor.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }
      if (!aircraft.newSystems.hasOwnProperty("armor")) {
        logger.error(
          `newSystems.armor missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        if (!aircraft.newSystems.armor.hasOwnProperty("active")) {
          logger.error(
            `newSystems.armor.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
        if (!aircraft.newSystems.armor.hasOwnProperty("damaged")) {
          logger.error(
            `newSystems.armor.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }

      if (!aircraft.newSystems.hasOwnProperty("utility")) {
        logger.error(
          `newSystems.utility missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      } else {
        if (!aircraft.newSystems.utility.hasOwnProperty("active")) {
          logger.error(
            `newSystems.utility.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
        if (!aircraft.newSystems.utility.hasOwnProperty("damaged")) {
          logger.error(
            `newSystems.utility.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
          );
        }
      }
    }

    if (!aircraft.hasOwnProperty("stats")) {
      logger.error(
        `stats missing for Aircraft ${aircraft.name} ${aircraft._id}`
      );
    } else {
      if (!aircraft.stats.hasOwnProperty("hull")) {
        logger.error(
          `stats.hull missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("hullMax")) {
        logger.error(
          `stats.hullMax missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("attack")) {
        logger.error(
          `stats.attack missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("penetration")) {
        logger.error(
          `stats.penetration missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("armor")) {
        logger.error(
          `stats.armor missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("evade")) {
        logger.error(
          `stats.evade missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("range")) {
        logger.error(
          `stats.range missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("cargo")) {
        logger.error(
          `stats.cargo missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("passiveRolls")) {
        logger.error(
          `stats.passiveRolls missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
      if (!aircraft.stats.hasOwnProperty("activeRolls")) {
        logger.error(
          `stats.activeRolls missing for Aircraft ${aircraft.name} ${aircraft._id}`
        );
      }
    }

    try {
      let { error } = validateAircraft(aircraft);
      if (error) {
        logger.error(
          `Aircraft Validation Error For ${aircraft.name} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Aircraft Validation Error For ${aircraft.name} Error: ${err.details[0].message}`
      );
    }
  }
  return true;
}

module.exports = chkAircraft;
