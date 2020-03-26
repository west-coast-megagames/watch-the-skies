// Equipment Model - Using Mongoose Model
const { Equipment, validateEquipment, Gear, Kit } = require('../../models/gov/equipment/equipment');
const { System } = require('../../models/gov/equipment/systems');
const { Team } = require('../../models/team/team');

const equipmentCheckDebugger = require('debug')('app:equipmentCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

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
    if (!equipment.hasOwnProperty('team')) {  
      logger.error(`team link missing for Equipment ${equipment.name} ${equipment._id}`);
    } else {
      let team = await Team.findById({'_id': equipment.team});
      if (!team) {
        logger.error(`team reference is invalid for Equipment ${equipment.name} ${equipment._id}`);
      }
    }

    if (!equipment.hasOwnProperty('manufacturer')) {  
      logger.error(`Manufacturer link missing for Equipment ${equipment.name} ${equipment._id}`);
    }else {
      let team = await Team.findById({'_id': equipment.manufacturer});
      if (!team) {
        logger.error(`manufacturer/team reference is invalid for Equipment ${equipment.name} ${equipment._id}`);
      }
    }

    if (!equipment.hasOwnProperty('model')) {  
      logger.error(`model missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.hasOwnProperty('name')) {  
      logger.error(`name missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.hasOwnProperty('unitType')) {  
      logger.error(`unitType missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.hasOwnProperty('cost')) {  
      logger.error(`cost missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.hasOwnProperty('buildTime')) {  
      logger.error(`buildTime missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.hasOwnProperty('buildCount')) {  
      logger.error(`buildCount missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.hasOwnProperty('desc')) {  
      logger.error(`desc missing for Equipment ${equipment.name} ${equipment._id}`);
    }

    if (!equipment.hasOwnProperty('prereq')) {  
      logger.error(`prereq missing for Equipment ${equipment.name} ${equipment._id}`);
    } else {
      for (let j = 0; j < equipment.prereq.length; ++j){
        if (!equipment.prereq[j].hasOwnProperty('type')) {
          logger.error(`prereq.type ${j} missing for Equipment ${equipment.name} ${equipment._id}`);
        }
        if (!equipment.prereq[j].hasOwnProperty('code')) {
          logger.error(`prereq.code ${j} missing for Equipment ${equipment.name} ${equipment._id}`);
        }
      }
    }

    if (!equipment.hasOwnProperty('status')) {  
      logger.error(`status missing for Equipment ${equipment.name} ${equipment._id}`);
    } else {
      if (!equipment.status.hasOwnProperty('building')) {
        logger.error(`status.building missing for Equipment ${equipment.name} ${equipment._id}`);
      }  
      if (!equipment.status.hasOwnProperty('salvage')) {
        logger.error(`status.salvage missing for Equipment ${equipment.name} ${equipment._id}`);
      }  
      if (!equipment.status.hasOwnProperty('damaged')) {
        logger.error(`status.damaged missing for Equipment ${equipment.name} ${equipment._id}`);
      }  
      if (!equipment.status.hasOwnProperty('destroyed')) {
        logger.error(`status.destroyed missing for Equipment ${equipment.name} ${equipment._id}`);
      }  

      if (equipment.status.building) {
        logger.info(`Equipment Status Is Building For ${equipment.name} ${equipment._id}`);
      }
    }

    if (!equipment.hasOwnProperty('type')) {  
      logger.error(`type missing for Equipment ${equipment.name} ${equipment._id}`);
    } else {
      if (equipment.type === "Gear") {
        if (!equipment.hasOwnProperty('category')) {  
          logger.error(`category missing for Gear Equipment ${equipment.name} ${equipment._id}`);
        } else if (equipment.category != "Training") {
          if (!equipment.hasOwnProperty('stats')) {  
            logger.error(`stats missing for Gear Equipment ${equipment.name} ${equipment._id}`);
          } else {
            //don't take it down to stats fields as they are only present if value assigned (no defaults)
          }
        }
      }

      if (equipment.type === "Kits") {
        if (!equipment.hasOwnProperty('code')) {  
          logger.error(`code missing for Gear Equipment ${equipment.name} ${equipment._id}`);
        } 
        
        if (!equipment.hasOwnProperty('stats')) {  
          logger.error(`stats missing for Gear Equipment ${equipment.name} ${equipment._id}`);
        } else {
          //don't take it down to stats fields as they are only present if value assigned (no defaults)
        }

        if (!equipment.hasOwnProperty('effects')) {  
          logger.error(`effects missing for Gear Equipment ${equipment.name} ${equipment._id}`);
        } else {
          //don't take it down to effects fields as they are only present if value assigned (no defaults)
        } 
      }
    }  

    try {
      let { error } = validateEquipment(equipment);
      if ( error)  {
        logger.error(`Equipment Validation Error For ${equipment.name} ${equipment._id} Error: ${error.details[0].message}`);
      }
    } catch (err) {
      logger.error(`Equipment Validation Error For ${equipment.name} ${equipment._id} Error: ${err.details[0].message}`);
    }
  }
  return true;
};

module.exports = chkEquipment;