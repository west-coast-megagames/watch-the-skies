// Facility Model - Using Mongoose Model
const {
  Facility,
  validateFacility,
} = require("../models/gov/facility/facility");
const { Equipment } = require("../models/gov/equipment/equipment");
const { Research } = require("../models/sci/research");
const { Team } = require("../models/team/team");
const { Site } = require("../models/sites/site");

const facilityCheckDebugger = require("debug")("app:facilityCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const typeList = ["Lab", "Hanger", "Factory", "Crisis", "Civilian"];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkFacility(runFlag) {
  for (const facility of await Facility.find()
    //.populate("team", "name")           does not work with .lean()
    //.populate("site", "siteName")       does not work with .lean()
    .lean()) {
    /* does not work with .lean()                                           
    if (!facility.populated("team")) {  
      logger.error(`Team link missing for Facility ${facility.name} ${facility._id}`);
    }
    if (!facility.populated("site")) {  
        logger.error(`Site link missing for Facility ${facility.name} ${facility._id}`);
    }    
    */

    if (!facility.hasOwnProperty("model")) {
      logger.error(
        `model missing for Facility ${facility.name} ${facility._id}`
      );
    }

    if (!facility.hasOwnProperty("gameState")) {
      logger.error(
        `gameState missing for Facility ${facility.name} ${facility._id}`
      );
    }

    if (!facility.hasOwnProperty("serviceRecord")) {
      logger.error(
        `serviceRecord missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      for (let i = 0; i < facility.serviceRecord.length; ++i) {
        let lFind = await Log.findById(facility.serviceRecord[i]);
        if (!lFind) {
          logger.error(
            `Facility ${facility.name} ${facility._id} has an invalid serviceRecord reference ${i}: ${facility.serviceRecord[i]}`
          );
        }
      }
    }

    if (!facility.hasOwnProperty("name")) {
      logger.error(`name missing for Facility ${facility._id}`);
    } else {
      if (
        facility.name === "" ||
        facility.name == undefined ||
        facility.name == null
      ) {
        logger.error(
          `name is blank for Facility ${facility.name} ${facility._id}`
        );
      }
    }

    if (!facility.hasOwnProperty("team")) {
      logger.error(
        `team missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      let team = await Team.findById({ _id: facility.team });
      if (!team) {
        logger.error(
          `team reference is invalid for Facility ${facility.name} ${facility._id}`
        );
      }
    }

    if (!facility.hasOwnProperty("site")) {
      logger.error(
        `site missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      let site = await Site.findById({ _id: facility.site });
      if (!site) {
        logger.error(
          `site reference is invalid for Facility ${facility.name} ${facility._id}`
        );
      }
    }

    //check equipment references
    if (!facility.hasOwnProperty("equipment")) {
      logger.error(
        `equipment missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      //facilityCheckDebugger(`Factory ${facility.name} ${facility._id} Check of Equipment ${facility.equipment.length} and project ${facility.project.length}`)
      for (let i = 0; i < facility.equipment.length; ++i) {
        let eFind = await Equipment.findById(facility.equipment[i]);
        if (!eFind) {
          logger.error(
            `Facility ${facility.name} ${facility._id} has an invalid equipment reference ${i}: ${facility.equipment[i]}`
          );
        }
      }
    }

    if (!facility.hasOwnProperty("capacity")) {
      logger.error(
        `capacity missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      if (isNaN(facility.capacity)) {
        logger.error(
          `Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capacity}`
        );
      }
    }

    if (!facility.hasOwnProperty("status")) {
      logger.error(
        `status missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      if (!facility.status.hasOwnProperty("repair")) {
        logger.error(
          `status.building missing for Facility ${facility.name} ${facility._id}`
        );
      }
      if (!facility.status.hasOwnProperty("damaged")) {
        logger.error(
          `status.damaged missing for Facility ${facility.name} ${facility._id}`
        );
      }
      if (!facility.status.hasOwnProperty("destroyed")) {
        logger.error(
          `status.destroyed missing for Facility ${facility.name} ${facility._id}`
        );
      }
      if (!facility.status.hasOwnProperty("secret")) {
        logger.error(
          `status.secret missing for Facility ${facility.name} ${facility._id}`
        );
      }
    }

    if (!facility.hasOwnProperty("hidden")) {
      logger.error(
        `hidden missing for Facility ${facility.name} ${facility._id}`
      );
    }

    if (!facility.hasOwnProperty("type")) {
      logger.error(
        `type missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      if (!inArray(typeList, facility.type)) {
        logger.error(
          `Invalid type ${facility.type} for Facility ${facility.name} ${facility._id}`
        );
      }

      if (facility.type === "Factory") {
        if (!facility.hasOwnProperty("project")) {
          logger.error(
            `project missing for Factory Facility ${facility.name} ${facility._id}`
          );
        } else {
          for (let i = 0; i < facility.project.length; ++i) {
            let pFind = await Equipment.findById(facility.project[i]);
            if (!pFind) {
              logger.error(
                `Factory Facility ${facility.name} ${facility._id} has an invalid project(equipment) reference ${i}: ${facility.project[i]}`
              );
            }
          }
        }
      }

      if (facility.type === "Hanger") {
        //only have type field for Hanger currently
      }

      if (facility.type === "Crisis") {
        //only have type field for Crisis currently
      }

      if (facility.type === "Civilian") {
        //only have type field for Civilian currently
      }

      if (facility.type === "Lab") {
        if (!facility.hasOwnProperty("research")) {
          logger.error(
            `research missing for Lab Facility ${facility.name} ${facility._id}`
          );
        } else {
          //facilityCheckDebugger(`Lab ${facility.name} ${facility._id} Check of Research ${facility.research.length}`);
          for (let i = 0; i < facility.research.length; ++i) {
            //facilityCheckDebugger(`Lab ${facility.name} ${facility._id} about to find research for ID ${facility.research[i]}`);
            let rFind = await Research.findById(facility.research[i]);
            if (!rFind) {
              logger.error(
                `Lab Facility ${facility.name} ${facility._id} has an invalid research reference ${i}: ${facility.research[i]}`
              );
            }
          }
        }

        if (!facility.hasOwnProperty("sciRate")) {
          logger.error(
            `sciRate missing for Lab Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.sciRate)) {
            logger.error(
              `Lab Facility ${facility.name} ${facility._id} sciRate is not a number ${facility.sciRate}`
            );
          }
        }

        if (!facility.hasOwnProperty("bonus")) {
          logger.error(
            `bonus missing for Lab Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.bonus)) {
            logger.error(
              `Lab Facility ${facility.name} ${facility._id} bonus is not a number ${facility.bonus}`
            );
          }
        }

        if (!facility.hasOwnProperty("funding")) {
          logger.error(
            `funding missing for Lab Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.funding)) {
            logger.error(
              `Lab Facility ${facility.name} ${facility._id} funding is not a number ${facility.funding}`
            );
          }
        }
      }
    }

    try {
      let { error } = await validateFacility(facility);
      if (error) {
        logger.error(
          `Facility Validation Error For ${facility.name} ${facility._id} Error: ${error.details[0].message}`
        );
      }
    } catch (err) {
      logger.error(
        `Facility Validation Error For ${facility.name} ${facility._id} Error: ${err.details[0].message}`
      );
    }
  }

  return true;
}

module.exports = chkFacility;
