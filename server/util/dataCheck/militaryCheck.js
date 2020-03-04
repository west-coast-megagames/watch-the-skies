// Military Model - Using Mongoose Model
const { Military, validateMilitary, Fleet, Corps } = require('../../models/ops/military/military');
const { Gear } = require('../../models/gov/equipment/gear');
const { Site } = require('../../models/sites/site');

const militaryCheckDebugger = require('debug')('app:militaryCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkMilitary(runFlag) {
  
  for (const military of await Military.find()
                               .populate("team", "name teamType")
                               .populate("country", "name type")
                               .populate("zone", "zoneName")
                               .populate("homeBase", "name")) { 
    
    if (!military.populated("team")) {  
      logger.error(`Team link missing for Military ${military.name} ${military._id}`);
    }

    if (!military.populated("country")) {  
      logger.error(`Country link missing for Military ${military.name} ${military._id}`);
    }

    if (!military.populated("zone")) {  
      logger.error(`Zone link missing for Military ${military.name} ${military._id}`);
    }

    if (!military.populated("homeBase")) {  
      logger.error(`homeBase link missing for Military ${military.name} ${military._id}`);
    }

    if (military.gear.length < 1) {
      logger.error(`No gear assigned for Military ${military.name} ${military._id}`);
    }

    //militaryCheckDebugger(`Military ${military.name} ${military._id} Check of Gear ${military.gear.length}`);
    for (let i = 0; i < military.gear.length; ++i){
      //militaryCheckDebugger(`Military ${military.name} ${military._id} about to find gear for ID ${military.gear[i]}`);
      let gFind = await Gear.findById(military.gear[i]);
      if (!gFind) {
        logger.error(`Military ${military.name} ${military._id} has an invalid gear reference ${i}: ${military.gear[i]}`);
      }
    }

    let { error } = validateMilitary(military);
    if ( error)  {
      logger.error(`Military Validation Error For ${military.name} Error: ${error.details[0].message}`);
    }

  }
  return true;
};

module.exports = chkMilitary;