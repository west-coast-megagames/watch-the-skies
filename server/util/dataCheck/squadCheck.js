// Squad Model - Using Mongoose Model
const { Squad, validateSquad } = require('../../models/ops/squad');
const { Gear } = require('../../models/gov/equipment/gear');
const { Site } = require('../../models/sites/site');

const squadCheckDebugger = require('debug')('app:squadCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkSquad(runFlag) {
  
  for (const squad of await Squad.find()
                               .populate("team", "name teamType")
                               .populate("country", "name type")
                               .populate("zone", "zoneName")
                               .populate("homeBase", "name")) { 
    
    if (!squad.populated("team")) {  
      logger.error(`Team link missing for Squad ${squad.name} ${squad._id}`);
    }

    if (!squad.populated("country")) {  
      logger.error(`Country link missing for Squad ${squad.name} ${squad._id}`);
    }

    if (!squad.populated("zone")) {  
      logger.error(`Zone link missing for Squad ${squad.name} ${squad._id}`);
    }

    if (!squad.populated("homeBase")) {  
      logger.error(`homeBase link missing for Squad ${squad.name} ${squad._id}`);
    }

    if (squad.gear.length < 1) {
      logger.error(`No gear assigned for Squad ${squad.name} ${squad._id}`);
    }

    //squadCheckDebugger(`Squad ${squad.name} ${squad._id} Check of Gear ${squad.gear.length}`);
    for (let i = 0; i < squad.gear.length; ++i){
      //squadCheckDebugger(`Squad ${squad.name} ${squad._id} about to find gear for ID ${squad.gear[i]}`);
      let gFind = await Gear.findById(squad.gear[i]);
      if (!gFind) {
        logger.error(`Squad ${squad.name} ${squad._id} has an invalid gear reference ${i}: ${squad.gear[i]}`);
      }
    }

    let { error } = validateSquad(squad);
    if ( error)  {
      logger.error(`Squad Validation Error For ${squad.name} Error: ${error.details[0].message}`);
    }

  }
  return true;
};

module.exports = chkSquad;