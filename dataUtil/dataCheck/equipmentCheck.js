// Equipment Model - Using Mongoose Model
const {
  Equipment,
  validateEquipment,
  Gear,
  Kit,
  System,
} = require("../models/gov/equipment/equipment");
const { Team } = require("../models/team/team");

const equipmentCheckDebugger = require("debug")("app:equipmentCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
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

async function chkEquipment(runFlag) {
  for (const equipment of await Equipment.find()
    //.populate("team", "name teamType")             does not work with .lean
    //.populate("manufacturer", "name teamType")     does not work with .lean()
    .lean()) {
    /* does not work with .lean()                             
    if (!equipment.populated("team")) {  
      logger.error(`Team link missing for Equipment ${equipment.name} ${equipment._id}`);
    }
    */
    if (!equipment.hasOwnProperty("team")) {
      logger.error(
        `team link missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      let team = await Team.findById({ _id: equipment.team });
      if (!team) {
        logger.error(
          `team reference is invalid for Equipment ${equipment.name} ${equipment._id}`
        );
      }
    }

    if (!equipment.hasOwnProperty("manufacturer")) {
      logger.error(
        `Manufacturer link missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      let team = await Team.findById({ _id: equipment.manufacturer });
      if (!team) {
        logger.error(
          `manufacturer/team reference is invalid for Equipment ${equipment.name} ${equipment._id}`
        );
      }
    }

    if (!equipment.hasOwnProperty("model")) {
      logger.error(
        `model missing for Equipment ${equipment.name} ${equipment._id}`
      );
    }

    if (!equipment.hasOwnProperty("gameState")) {
      logger.error(
        `gameState missing for Equipment ${equipment.name} ${equipment._id}`
      );
    }

    if (!equipment.hasOwnProperty("serviceRecord")) {
      logger.error(
        `serviceRecord missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      for (let i = 0; i < equipment.serviceRecord.length; ++i) {
        let lFind = await Log.findById(equipment.serviceRecord[i]);
        if (!lFind) {
          logger.error(
            `Equipment ${equipment.name} ${equipment._id} has an invalid serviceRecord reference ${i}: ${equipment.serviceRecord[i]}`
          );
        }
      }
    }

    if (!equipment.hasOwnProperty("name")) {
      logger.error(
        `name missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      if (
        equipment.name === "" ||
        equipment.name == undefined ||
        equipment.name == null
      ) {
        logger.error(
          `name is blank for Equipment ${equipment.name} ${equipment._id}`
        );
      }
    }

    if (!equipment.hasOwnProperty("unitType")) {
      logger.error(
        `unitType missing for Equipment ${equipment.name} ${equipment._id}`
      );
    }

    if (!equipment.hasOwnProperty("cost")) {
      logger.error(
        `cost missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      if (isNaN(equipment.cost)) {
        logger.error(
          `Equipment ${equipment.name} ${equipment._id} cost is not a number ${equipment.cost}`
        );
      }
    }

    if (!equipment.hasOwnProperty("buildTime")) {
      logger.error(
        `buildTime missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      if (isNaN(equipment.buildTime)) {
        logger.error(
          `Equipment ${equipment.name} ${equipment._id} buildTime is not a number ${equipment.buildTime}`
        );
      }
    }

    if (!equipment.hasOwnProperty("buildCount")) {
      logger.error(
        `buildCount missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      if (isNaN(equipment.buildCount)) {
        logger.error(
          `Equipment ${equipment.name} ${equipment._id} buildCount is not a number ${equipment.buildCount}`
        );
      }
    }

    if (!equipment.hasOwnProperty("desc")) {
      logger.error(
        `desc missing for Equipment ${equipment.name} ${equipment._id}`
      );
    }

    if (!equipment.hasOwnProperty("prereq")) {
      logger.error(
        `prereq missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      for (let j = 0; j < equipment.prereq.length; ++j) {
        if (!equipment.prereq[j].hasOwnProperty("type")) {
          logger.error(
            `prereq.type ${j} missing for Equipment ${equipment.name} ${equipment._id}`
          );
        }
        if (!equipment.prereq[j].hasOwnProperty("code")) {
          logger.error(
            `prereq.code ${j} missing for Equipment ${equipment.name} ${equipment._id}`
          );
        }
      }
    }

    if (!equipment.hasOwnProperty("status")) {
      logger.error(
        `status missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      if (!equipment.status.hasOwnProperty("building")) {
        logger.error(
          `status.building missing for Equipment ${equipment.name} ${equipment._id}`
        );
      }
      if (!equipment.status.hasOwnProperty("salvage")) {
        logger.error(
          `status.salvage missing for Equipment ${equipment.name} ${equipment._id}`
        );
      }
      if (!equipment.status.hasOwnProperty("damaged")) {
        logger.error(
          `status.damaged missing for Equipment ${equipment.name} ${equipment._id}`
        );
      }
      if (!equipment.status.hasOwnProperty("destroyed")) {
        logger.error(
          `status.destroyed missing for Equipment ${equipment.name} ${equipment._id}`
        );
      }

      if (equipment.status.building) {
        logger.info(
          `Equipment Status Is Building For ${equipment.name} ${equipment._id}`
        );
      }
    }

    if (!equipment.hasOwnProperty("type")) {
      logger.error(
        `type missing for Equipment ${equipment.name} ${equipment._id}`
      );
    } else {
      if (equipment.type === "Gear") {
        if (!equipment.hasOwnProperty("category")) {
          logger.error(
            `category missing for Gear Equipment ${equipment.name} ${equipment._id}`
          );
        } else {
          if (!inArray(gearCategories, equipment.category)) {
            logger.error(
              `Invalid category ${equipment.category} for Gear ${equipment.name} ${equipment._id}`
            );
          }
        }

        if (equipment.category != "Training") {
          if (!equipment.hasOwnProperty("stats")) {
            logger.error(
              `stats missing for Gear Equipment ${equipment.name} ${equipment._id}`
            );
          } else {
            //don't take it down to stats fields as they are only present if value assigned (no defaults)
          }
        }
      }

      if (equipment.type === "Kits") {
        if (!equipment.hasOwnProperty("code")) {
          logger.error(
            `code missing for Kits Equipment ${equipment.name} ${equipment._id}`
          );
        }

        if (!equipment.hasOwnProperty("stats")) {
          logger.error(
            `stats missing for Kits Equipment ${equipment.name} ${equipment._id}`
          );
        } else {
          //don't take it down to stats fields as they are only present if value assigned (no defaults)
        }

        if (!equipment.hasOwnProperty("effects")) {
          logger.error(
            `effects missing for Kits Equipment ${equipment.name} ${equipment._id}`
          );
        } else {
          //don't take it down to effects fields as they are only present if value assigned (no defaults)
        }
      }

      if (equipment.type === "System") {
        if (!equipment.hasOwnProperty("category")) {
          logger.error(
            `category missing for System Equipment ${equipment.name} ${equipment._id}`
          );
        } else {
          if (!inArray(systemCategories, equipment.category)) {
            logger.error(
              `Invalid category ${equipment.category} for System ${equipment.name} ${equipment._id}`
            );
          }
        }

        if (!equipment.hasOwnProperty("stats")) {
          if (equipment.hasOwnProperty("name")) {
            if (equipment.name != "Targeting CPU") {
              //targeting CPU does not add any stats
              logger.error(
                `stats missing for System Equipment ${equipment.name} ${equipment._id}`
              );
            }
          }
        } else {
          //don't take it down to stats fields as they are only present if value assigned (no defaults)
        }
      }
    }

    try {
      let { error } = validateEquipment(equipment);
      if (error) {
        logger.error(
          `Equipment Validation Error For ${equipment.name} ${equipment._id} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Equipment Validation Error For ${equipment.name} ${equipment._id} Error: ${err.details[0].message}`
      );
    }
  }
  return true;
}

module.exports = chkEquipment;
