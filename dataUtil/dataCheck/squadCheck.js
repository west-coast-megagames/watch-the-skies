// Squad Model - Using Mongoose Model
const { Squad, validateSquad } = require("../models/ops/squad");
const { Upgrade } = require("../models/gov/upgrade/upgrade");
const { Site } = require("../models/sites/site");
const { Country, validateCountry } = require("../models/country");
const { Team } = require("../models/team/team");
const { Zone } = require("../models/zone");
const { Facility } = require("../models/gov/facility/facility");

const squadCheckDebugger = require("debug")("app:squadCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const typeVals = ["Raid", "Assault", "Infiltration", "Envoy", "Science"];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkSquad(runFlag) {
  for (const squad of await Squad.find()
    /* does not work with .lean()
                               .populate("team", "name teamType")
                               .populate("country", "name type")
                               .populate("zone", "name")
                               .populate("origin", "name")
                               */
    .lean()) {
    if (!squad.hasOwnProperty("model")) {
      logger.error(`model missing for Squad ${squad.name} ${squad._id}`);
    }

    if (!squad.hasOwnProperty("gameState")) {
      logger.error(`gameState missing for Squad ${squad.name} ${squad._id}`);
    }

    if (!squad.hasOwnProperty("zone")) {
      logger.error(`zone missing for Squad ${squad.name} ${squad._id}`);
    } else {
      let zone = await Zone.findById({ _id: squad.zone });
      if (!zone) {
        logger.error(
          `zone reference is invalid for Squad ${squad.name} ${squad._id}`
        );
      }
    }

    if (!squad.hasOwnProperty("team")) {
      logger.error(`team missing for Squad ${squad.name} ${squad._id}`);
    } else {
      let team = await Team.findById({ _id: squad.team });
      if (!team) {
        logger.error(
          `team reference is invalid for Squad ${squad.name} ${squad._id}`
        );
      }
    }

    if (!squad.hasOwnProperty("country")) {
      logger.error(`country missing for Squad ${squad.name} ${squad._id}`);
    } else {
      let country = await Country.findById({ _id: squad.country });
      if (!country) {
        logger.error(
          `country reference is invalid for Squad ${squad.name} ${squad._id}`
        );
      }
    }

    if (!squad.hasOwnProperty("origin")) {
      logger.error(`origin missing for Squad ${squad.name} ${squad._id}`);
    } else {
      let facility = await Facility.findById({ _id: squad.origin });
      if (!facility) {
        logger.error(
          `origin reference is invalid for Squad ${squad.name} ${squad._id}`
        );
      }
    }

    if (!squad.hasOwnProperty("site")) {
      logger.error(`site missing for Squad ${squad.name} ${squad._id}`);
    } else {
      let site = await Site.findById({ _id: squad.site });
      if (!site) {
        logger.error(
          `site reference is invalid for Squad ${squad.name} ${squad._id}`
        );
      }
    }

    if (!squad.hasOwnProperty("name")) {
      logger.error(`name missing for Squad ${squad.name} ${squad._id}`);
    } else {
      if (squad.name === "" || squad.name == undefined || squad.name == null) {
        logger.error(`name is blank for Squad ${squad._id}`);
      }
    }

    if (!squad.hasOwnProperty("status")) {
      logger.error(`Squad status is missing ${squad.name} ${squad._id}`);
    } else {
      if (!squad.status.hasOwnProperty("damaged")) {
        logger.error(
          `status.damaged missing for Squad ${squad.name} ${squad._id}`
        );
      } else {
        if (
          squad.status.damaged === undefined ||
          squad.status.damaged === null
        ) {
          logger.error(
            `Squad status.damaged is not set ${squad.name} ${squad._id}`
          );
        }
      }

      if (!squad.status.hasOwnProperty("deployed")) {
        logger.error(
          `status.deployed missing for Squad ${squad.name} ${squad._id}`
        );
      } else {
        if (
          squad.status.deployed === undefined ||
          squad.status.deployed === null
        ) {
          logger.error(
            `Squad status.deployed is not set ${squad.name} ${squad._id}`
          );
        }
      }

      if (!squad.status.hasOwnProperty("destroyed")) {
        logger.error(
          `status.destroyed missing for Squad ${squad.name} ${squad._id}`
        );
      } else {
        if (
          squad.status.destroyed === undefined ||
          squad.status.destroyed === null
        ) {
          logger.error(
            `Squad status.destroyed is not set ${squad.name} ${squad._id}`
          );
        }
      }

      if (!squad.status.hasOwnProperty("repair")) {
        logger.error(
          `status.repair missing for Squad ${squad.name} ${squad._id}`
        );
      } else {
        if (squad.status.repair === undefined || squad.status.repair === null) {
          logger.error(
            `Squad status.repair is not set ${squad.name} ${squad._id}`
          );
        }
      }

      if (!squad.status.hasOwnProperty("secret")) {
        logger.error(
          `status.secret missing for Squad ${squad.name} ${squad._id}`
        );
      } else {
        if (squad.status.repair === undefined || squad.status.repair === null) {
          logger.error(
            `Squad status.secret is not set ${squad.name} ${squad._id}`
          );
        }
      }
    }

    if (!squad.hasOwnProperty("type")) {
      logger.error(`type missing for Squad ${squad.name} ${squad._id}`);
    } else {
      if (!inArray(typeVals, squad.type)) {
        logger.error(
          `Invalid type ${squad.type} for Squad ${squad.name} ${squad._id}`
        );
      }
    }

    if (!squad.hasOwnProperty("rollBonus")) {
      logger.error(`rollBonus missing for squad ${squad.name} ${squad._id}`);
    } else {
      if (isNaN(squad.rollBonus)) {
        logger.error(
          `Squad ${squad.name} ${squad._id} rollBonus is not a number ${squad.rollBonus}`
        );
      }
    }

    if (!squad.hasOwnProperty("upgrades")) {
      logger.error(`upgrades missing for squad ${squad.name} ${squad._id}`);
    } else {
      for (let i = 0; i < squad.upgrades.length; ++i) {
        let uFind = await Upgrade.findById(squad.upgrades[i]);
        if (!uFind) {
          logger.error(
            `Squad ${squad.name} ${squad._id} has an invalid upgrades reference ${i}: ${squad.upgrades[i]}`
          );
        }
      }
    }

    try {
      let { error } = validateSquad(squad);
      if (error) {
        logger.error(
          `Squad Validation Error For ${squad.name} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Squad Validation Error For ${squad.name} Error: ${err.details[0].message}`
      );
    }
  }
  return true;
}

module.exports = chkSquad;
