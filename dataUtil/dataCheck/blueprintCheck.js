// Blueprint Model - Using Mongoose Model
const {
  Blueprint,
  validateBlueprint,
  FacilityBlueprint,
  validateFacilityBlueprint,
  AircraftBlueprint,
  validateAircraftBlueprint,
  SquadBlueprint,
  validateSquadBlueprint,
  UpgradeBlueprint,
  validateUpgradeBlueprint,
} = require("../models/blueprint");

const { Site } = require("../models/site");

const blueprintCheckDebugger = require("debug")("app:blueprintCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

async function chkBlueprint(runFlag) {
  for (const blueprint of await Blueprint.find().lean()) {
    //do not need toObject with .lean()
    //let testPropertys = blueprint.toObject();

    if (!blueprint.hasOwnProperty("code")) {
      logger.error(
        `code missing for blueprint ${blueprint.name} ${blueprint._id}`
      );
    } else {
      if (
        blueprint.code === "" ||
        blueprint.code == undefined ||
        blueprint.code == null
      ) {
        logger.error(
          `code is blank for Blueprint ${blueprint.name} ${blueprint._id}`
        );
      }
    }

    if (!blueprint.hasOwnProperty("name")) {
      logger.error(`name missing for blueprint ${blueprint._id}`);
    } else {
      if (
        blueprint.name === "" ||
        blueprint.name == undefined ||
        blueprint.name == null
      ) {
        logger.error(
          `name is blank for Blueprint ${blueprint.code} ${blueprint._id}`
        );
      }
    }

    if (!blueprint.hasOwnProperty("model")) {
      logger.error(
        `model missing for blueprint ${blueprint.name} ${blueprint._id}`
      );
    }

    if (!blueprint.hasOwnProperty("cost")) {
      logger.error(
        `cost missing for blueprint ${blueprint.name} ${blueprint._id}`
      );
    } else {
      if (isNaN(blueprint.cost)) {
        logger.error(
          `Blueprint ${blueprint.name} ${blueprint._id} cost is not a number ${blueprint.cost}`
        );
      }
    }

    if (!blueprint.hasOwnProperty("buildTime")) {
      logger.error(
        `buildTime missing for blueprint ${blueprint.name} ${blueprint._id}`
      );
    } else {
      if (isNaN(blueprint.buildTime)) {
        logger.error(
          `Blueprint ${blueprint.name} ${blueprint._id} buildTime is not a number ${blueprint.buildTime}`
        );
      }
    }

    if (!blueprint.hasOwnProperty("desc")) {
      logger.error(
        `desc missing for Blueprint ${blueprint.name} ${blueprint._id}`
      );
    }

    if (!blueprint.hasOwnProperty("prereq")) {
      logger.error(
        `prereq missing for Blueprint ${blueprint.name} ${blueprint._id}`
      );
    }

    if (!blueprint.hasOwnProperty("hidden")) {
      logger.error(
        `hidden missing for Blueprint ${blueprint.name} ${blueprint._id}`
      );
    }

    if (!blueprint.hasOwnProperty("buildModel")) {
      logger.error(
        `buildModel missing for Blueprint ${blueprint.name} ${blueprint._id}`
      );
    } else {
      switch (blueprint.buildModel) {
        case "facility":
          if (!blueprint.hasOwnProperty("type")) {
            logger.error(
              `type missing for facility blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          if (!blueprint.hasOwnProperty("site")) {
            /*
            logger.error(
              `site missing for facility blueprint ${blueprint.name} ${blueprint._id}`
            );
            */
          } else {
            let site = await Site.findById({ _id: blueprint.site });
            if (!site) {
              logger.error(
                `site reference is invalid for facility blueprint ${blueprint.name} ${blueprint._id}`
              );
            }
          }

          if (!blueprint.hasOwnProperty("upgrades")) {
            logger.error(
              `upgrades missing for facility blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          if (!blueprint.hasOwnProperty("capacity")) {
            logger.error(
              `capacity missing for facility blueprint ${blueprint.name} ${blueprint._id}`
            );
          } else {
            if (isNaN(blueprint.capacity)) {
              logger.error(
                `Blueprint ${blueprint.name} ${blueprint._id} capacity is not a number ${blueprint.capacity}`
              );
            }
          }

          if (!blueprint.hasOwnProperty("status")) {
            logger.error(
              `status missing for facility blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          if (!blueprint.hasOwnProperty("unitType")) {
            logger.error(
              `unitType missing for facility blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          if (blueprint.type === "Lab") {
            if (!blueprint.hasOwnProperty("funding")) {
              logger.error(
                `funding missing for facility blueprint ${blueprint.name} ${blueprint._id}`
              );
            }

            if (!blueprint.hasOwnProperty("sciRate")) {
              logger.error(
                `sciRate missing for facility blueprint ${blueprint.name} ${blueprint._id}`
              );
            } else {
              if (isNaN(blueprint.sciRate)) {
                logger.error(
                  `Blueprint ${blueprint.name} ${blueprint._id} sciRate is not a number ${blueprint.sciRate}`
                );
              }
            }

            if (!blueprint.hasOwnProperty("sciBonus")) {
              logger.error(
                `sciBonus missing for facility blueprint ${blueprint.name} ${blueprint._id}`
              );
            } else {
              if (isNaN(blueprint.sciBonus)) {
                logger.error(
                  `Blueprint ${blueprint.name} ${blueprint._id} sciBonus is not a number ${blueprint.sciBonus}`
                );
              }
            }
          }

          try {
            let { error } = await validateFacilityBlueprint(blueprint);
            if (error) {
              logger.error(
                `Blueprint Facility Validation Error For ${blueprint.code} ${blueprint.name} Error: ${error.details[0].message}`
              );
            }
          } catch (err) {
            logger.error(
              `Blueprint Facility Validation Error For ${blueprint.code} ${blueprint.name} Error: ${err.details[0].message}`
            );
          }
          break;

        case "aircraft":
          if (!blueprint.hasOwnProperty("type")) {
            logger.error(
              `type missing for aircraft blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          if (!blueprint.hasOwnProperty("upgrades")) {
            logger.error(
              `upgrades missing for aircraft blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          if (!blueprint.hasOwnProperty("stats")) {
            logger.error(
              `stats missing for aircraft blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          try {
            let { error } = await validateAircraftBlueprint(blueprint);
            if (error) {
              logger.error(
                `Blueprint Aircraft Validation Error For ${blueprint.code} ${blueprint.name} Error: ${error.details[0].message}`
              );
            }
          } catch (err) {
            logger.error(
              `Blueprint Aircraft Validation Error For ${blueprint.code} ${blueprint.name} Error: ${err.details[0].message}`
            );
          }
          break;

        case "upgrade":
          if (!blueprint.hasOwnProperty("unitType")) {
            logger.error(
              `unitType missing for upgrade blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          if (!blueprint.hasOwnProperty("effects")) {
            logger.error(
              `effects missing for upgrade blueprint ${blueprint.name} ${blueprint._id}`
            );
          }

          try {
            let { error } = await validateUpgradeBlueprint(blueprint);
            if (error) {
              logger.error(
                `Blueprint Upgrade Validation Error For ${blueprint.code} ${blueprint.name} Error: ${error.details[0].message}`
              );
            }
          } catch (err) {
            logger.error(
              `Blueprint Upgrade Validation Error For ${blueprint.code} ${blueprint.name} Error: ${err.details[0].message}`
            );
          }
          break;

        default:
          logger.error(
            `Invalid Blueprint BuildModel:  ${blueprint.buildModel} for ${blueprint.name} ${blueprint._id}`
          );
      }
    }
  }
  return true;
}

module.exports = chkBlueprint;
