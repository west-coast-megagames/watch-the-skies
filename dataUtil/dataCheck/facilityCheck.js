const {
  Facility,
  validateFacility,
} = require("../models/gov/facility/facility");
const { Equipment } = require("../models/gov/equipment/equipment");
const { Research } = require("../models/sci/research");
const { Team } = require("../models/team/team");
const { Site } = require("../models/sites/site");
const { Aircraft } = require("../models/ops/aircraft");
const { Military } = require("../models/ops/military/military");

const facilityCheckDebugger = require("debug")("app:facilityCheck");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const typeList = ["Hanger", "Crisis", "Civilian", "Research", "Base"];

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

    if (!facility.hasOwnProperty("code")) {
      logger.error(
        `code missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      if (
        facility.code === "" ||
        facility.code == undefined ||
        facility.code == null
      ) {
        logger.error(
          `code is blank for Facility ${facility.name} ${facility._id}`
        );
      }
    }

    if (!facility.hasOwnProperty("capability")) {
      logger.error(
        `capability missing for Facility ${facility.name} ${facility._id}`
      );
    } else {
      // only some of the capabilities may be present, so check that they exist rather than not
      if (facility.capability.hasOwnProperty("research")) {
        researchCapacity = 0;
        researchActive = false;
        if (!facility.capability.research.hasOwnProperty("capacity")) {
          logger.error(
            `research capacity missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.capability.research.capacity)) {
            logger.error(
              `research Facility ${facility.name} ${facility._id} research capacity is not a number ${facility.capability.research.capacity}`
            );
          } else {
            researchCapacity = facility.capability.research.capacity;
          }
        }
        if (!facility.capability.research.hasOwnProperty("funding")) {
          logger.error(
            `research funding missing for Facility ${facility.name} ${facility._id}`
          );
        }
        if (!facility.capability.research.hasOwnProperty("sciRate")) {
          logger.error(
            `research sciRate missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.capability.research.sciRate)) {
            logger.error(
              `research Facility ${facility.name} ${facility._id} research sciRate is not a number ${facility.capability.research.sciRate}`
            );
          }
        }
        if (!facility.capability.research.hasOwnProperty("sciBonus")) {
          logger.error(
            `research sciBonus missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.capability.research.sciBonus)) {
            logger.error(
              `research Facility ${facility.name} ${facility._id} research sciBonus is not a number ${facility.capability.research.sciRate}`
            );
          }
        }
        if (!facility.capability.research.hasOwnProperty("active")) {
          logger.error(
            `research active missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          researchActive = facility.capability.research.active;
        }

        if (!facility.capability.research.hasOwnProperty("status")) {
          logger.error(
            `research status missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (!facility.capability.research.status.hasOwnProperty("damage")) {
            logger.error(
              `research status damage missing for Facility ${facility.name} ${facility._id}`
            );
          }
          if (!facility.capability.research.status.hasOwnProperty("pending")) {
            logger.error(
              `research status pending missing for Facility ${facility.name} ${facility._id}`
            );
          }
        }

        if (!facility.capability.research.hasOwnProperty("projects")) {
          logger.error(
            `research projects missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (facility.capability.research.projects.length > researchCapacity) {
            logger.error(
              `research projects entries exceeds capacity for Facility ${facility.name} ${facility._id}`
            );
          }

          if (
            facility.capability.research.projects.length > 0 &&
            !researchActive
          ) {
            logger.error(
              `research projects entries on in-active research for Facility ${facility.name} ${facility._id}`
            );
          }
          for (
            let i = 0;
            i < facility.capability.research.projects.length;
            ++i
          ) {
            let rFind = await Research.findById(
              facility.capability.research.projects[i]
            );
            if (!rFind) {
              logger.error(
                `Facility ${facility.name} ${facility._id} has an invalid research projects reference ${i}: ${facility.capability.research.projects[i]}`
              );
            }
          }
        }
      }

      if (facility.capability.hasOwnProperty("airMission")) {
        airCapacity = 0;
        airActive = false;
        if (!facility.capability.airMission.hasOwnProperty("capacity")) {
          logger.error(
            `airMission capacity missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.capability.airMission.capacity)) {
            logger.error(
              `Lab Facility ${facility.name} ${facility._id} airMission capacity is not a number ${facility.capability.airMission.capacity}`
            );
          } else {
            airCapacity = facility.capability.airMission.capacity;
          }
        }
        if (!facility.capability.airMission.hasOwnProperty("damage")) {
          logger.error(
            `airMission damage missing for Facility ${facility.name} ${facility._id}`
          );
        }
        if (!facility.capability.airMission.hasOwnProperty("active")) {
          logger.error(
            `airMission active missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          airActive = facility.capability.airMission.active;
        }

        if (!facility.capability.airMission.hasOwnProperty("aircraft")) {
          logger.error(
            `airMission aircraft missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (facility.capability.airMission.aircraft.length > airCapacity) {
            logger.error(
              `airMission aircraft entries exceeds capacity for Facility ${facility.name} ${facility._id}`
            );
          }

          if (
            facility.capability.airMission.aircraft.length > 0 &&
            !airActive
          ) {
            logger.error(
              `aircraft entries for in-active airMission for Facility ${facility.name} ${facility._id}`
            );
          }
          for (
            let i = 0;
            i < facility.capability.airMission.aircraft.length;
            ++i
          ) {
            let aFind = await Aircraft.findById(
              facility.capability.airMission.aircraft[i]
            );
            if (!aFind) {
              logger.error(
                `Facility ${facility.name} ${facility._id} has an invalid airMission Aircraft reference ${i}: ${facility.capability.airMission.aircraft[i]}`
              );
            }
          }
        }
      }

      if (facility.capability.hasOwnProperty("storage")) {
        storageCapacity = 0;
        storageActive = false;
        if (!facility.capability.storage.hasOwnProperty("capacity")) {
          logger.error(
            `storage capacity missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (isNaN(facility.capability.storage.capacity)) {
            logger.error(
              `storage Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.storage.capacity}`
            );
          } else {
            storageCapacity = facility.capability.storage.capacity;
          }
        }
        if (!facility.capability.storage.hasOwnProperty("damage")) {
          logger.error(
            `storage damage missing for Facility ${facility.name} ${facility._id}`
          );
        }
        if (!facility.capability.storage.hasOwnProperty("active")) {
          logger.error(
            `storage active missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          storageActive = facility.capability.storage.active;
        }

        if (!facility.capability.storage.hasOwnProperty("equipment")) {
          logger.error(
            `storage equipment missing for Facility ${facility.name} ${facility._id}`
          );
        } else {
          if (facility.capability.storage.equipment.length > storageCapacity) {
            logger.error(
              `storage equipment entries exceeds capacity for Facility ${facility.name} ${facility._id}`
            );
          }

          if (
            facility.capability.storage.equipment.length > 0 &&
            !storageActive
          ) {
            logger.error(
              `equipment entries for in-active storage for Facility ${facility.name} ${facility._id}`
            );
          }
          for (
            let i = 0;
            i < facility.capability.storage.equipment.length;
            ++i
          ) {
            let eFind = await Equipment.findById(
              facility.capability.storage.equipment[i]
            );
            if (!eFind) {
              logger.error(
                `Facility ${facility.name} ${facility._id} has an invalid storage equipment reference ${i}: ${facility.capability.storage.equipment[i]}`
              );
            }
          }
        }
      }
    }

    if (facility.capability.hasOwnProperty("manufacturing")) {
      manufacturingCapacity = 0;
      manufacturingActive = false;
      if (!facility.capability.manufacturing.hasOwnProperty("capacity")) {
        logger.error(
          `manufacturing capacity missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        if (isNaN(facility.capability.manufacturing.capacity)) {
          logger.error(
            `manufacturing Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.manufacturing.capacity}`
          );
        } else {
          manufacturingCapacity = facility.capability.manufacturing.capacity;
        }
      }
      if (!facility.capability.manufacturing.hasOwnProperty("damage")) {
        logger.error(
          `manufacturing damage missing for Facility ${facility.name} ${facility._id}`
        );
      }
      if (!facility.capability.manufacturing.hasOwnProperty("active")) {
        logger.error(
          `manufacturing active missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        manufacturingActive = facility.capability.manufacturing.active;
      }

      if (!facility.capability.manufacturing.hasOwnProperty("equipment")) {
        logger.error(
          `manufacturing equipment missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        if (
          facility.capability.manufacturing.equipment.length >
          manufacturingCapacity
        ) {
          logger.error(
            `manufacturing equipment entries exceeds capacity for Facility ${facility.name} ${facility._id}`
          );
        }

        if (
          facility.capability.manufacturing.equipment.length > 0 &&
          !manufacturingActive
        ) {
          logger.error(
            `equipment entries for in-active manufacturing for Facility ${facility.name} ${facility._id}`
          );
        }
        for (
          let i = 0;
          i < facility.capability.manufacturing.equipment.length;
          ++i
        ) {
          let eFind = await Equipment.findById(
            facility.capability.manufacturing.equipment[i]
          );
          if (!eFind) {
            logger.error(
              `Facility ${facility.name} ${facility._id} has an invalid manufacturing equipment reference ${i}: ${facility.capability.manufacturing.equipment[i]}`
            );
          }
        }
      }
    }

    if (facility.capability.hasOwnProperty("ground")) {
      groundCapacity = 0;
      groundActive = false;
      if (!facility.capability.ground.hasOwnProperty("capacity")) {
        logger.error(
          `ground capacity missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        if (isNaN(facility.capability.ground.capacity)) {
          logger.error(
            `ground Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.ground.capacity}`
          );
        } else {
          groundCapacity = facility.capability.ground.capacity;
        }
      }
      if (!facility.capability.ground.hasOwnProperty("damage")) {
        logger.error(
          `ground damage missing for Facility ${facility.name} ${facility._id}`
        );
      }
      if (!facility.capability.ground.hasOwnProperty("active")) {
        logger.error(
          `ground active missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        groundActive = facility.capability.ground.active;
      }

      if (!facility.capability.ground.hasOwnProperty("corps")) {
        logger.error(
          `ground corps missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        if (facility.capability.ground.corps.length > groundCapacity) {
          logger.error(
            `ground corps entries exceeds capacity for Facility ${facility.name} ${facility._id}`
          );
        }

        if (facility.capability.ground.corps.length > 0 && !groundActive) {
          logger.error(
            `corps entries for in-active ground for Facility ${facility.name} ${facility._id}`
          );
        }
        for (let i = 0; i < facility.capability.ground.corps.length; ++i) {
          let mFind = await Military.findById(
            facility.capability.ground.corps[i]
          );
          if (!mFind) {
            logger.error(
              `Facility ${facility.name} ${facility._id} has an invalid ground military reference ${i}: ${facility.capability.ground.corps[i]}`
            );
          }
        }
      }
    }

    if (facility.capability.hasOwnProperty("naval")) {
      navalCapacity = 0;
      navalActive = false;
      if (!facility.capability.naval.hasOwnProperty("capacity")) {
        logger.error(
          `naval capacity missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        if (isNaN(facility.capability.naval.capacity)) {
          logger.error(
            `naval Facility ${facility.name} ${facility._id} capacity is not a number ${facility.capability.naval.capacity}`
          );
        } else {
          navalCapacity = facility.capability.naval.capacity;
        }
      }
      if (!facility.capability.naval.hasOwnProperty("damage")) {
        logger.error(
          `naval damage missing for Facility ${facility.name} ${facility._id}`
        );
      }
      if (!facility.capability.naval.hasOwnProperty("active")) {
        logger.error(
          `naval active missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        navalActive = facility.capability.naval.active;
      }

      if (!facility.capability.naval.hasOwnProperty("fleet")) {
        logger.error(
          `naval fleet missing for Facility ${facility.name} ${facility._id}`
        );
      } else {
        if (facility.capability.naval.fleet.length > navalCapacity) {
          logger.error(
            `naval fleet entries exceeds capacity for Facility ${facility.name} ${facility._id}`
          );
        }

        if (facility.capability.naval.fleet.length > 0 && !navalActive) {
          logger.error(
            `fleet entries for in-active naval for Facility ${facility.name} ${facility._id}`
          );
        }
        for (let i = 0; i < facility.capability.naval.fleet.length; ++i) {
          let mFind = await Military.findById(
            facility.capability.naval.fleet[i]
          );
          if (!mFind) {
            logger.error(
              `Facility ${facility.name} ${facility._id} has an invalid naval military reference ${i}: ${facility.capability.naval.fleet[i]}`
            );
          }
        }
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
      if (!facility.status.hasOwnProperty("defenses")) {
        logger.error(
          `status.defenses missing for Facility ${facility.name} ${facility._id}`
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
