// Aircraft Model - Using Mongoose Model
const { Aircraft, validateAircraft, validateName, validateAddr } = require('../../models/ops/aircraft');
const { System } = require('../../models/gov/equipment/systems');

const aircraftCheckDebugger = require('debug')('app:aircraftCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkAircraft(runFlag) {
  
  for (const aircraft of await Aircraft.find()
                               .populate("team", "name teamType")
                               .populate("zone", "zoneName")
                               .populate("baseOrig", "name")
                               .populate("country", "name")
                               .populate("site", "name")) { 
    
    if (!aircraft.populated("team")) {  
      logger.error(`Team link missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

    if (!aircraft.populated("zone")) {  
      logger.error(`Zone link missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

    if (!aircraft.populated("country")) {  
      logger.error(`Country link missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

    let skipSiteCheck = false;
    // assume all types should have a site/baseOrig
    /*
    if (!aircraft.populated("team")) {
      skipSiteCheck = true; 
    } else {
      let team = await Team.findById( aircraft.team );
      if (!team) {
        skipSiteCheck = true;
      } else {
        if (team.teamType === "A") {
           skipSiteCheck = true;    
        }      
      }
    } 
    */

    if (!skipSiteCheck) {
      if (!aircraft.populated("baseOrig")) { 
        logger.error(`Site link missing for Aircraft ${aircraft.name} ${aircraft._id}`);
      }

      if (!aircraft.populated("baseOrig")) {  
        logger.error(`baseOrig Site link missing for Aircraft ${aircraft.name} ${aircraft._id}`);
      }
    }

    //has at least one system
    if (aircraft.systems.length < 1) {
      logger.error(`No Systems Assigned to ${aircraft.name} ${aircraft._id}`);
    } 

    //aircraftCheckDebugger(`Aircraft ${aircraft.name} ${aircraft._id} Check of Systems ${aircraft.systems.length}`);
    for (let i = 0; i < aircraft.systems.length; ++i){
      //aircraftCheckDebugger(`Aircraft ${aircraft.name} ${aircraft._id} about to find systems for ID ${aircraft.systems[i]}`);
      let sFind = await System.findById(aircraft.systems[i]);
      if (!sFind) {
        logger.error(`Aircraft ${aircraft.name} ${aircraft._id} has an invalid systems reference ${i}: ${aircraft.systems[i]}`);
      }
    }

    let { error } = validateAircraft(aircraft);
    if ( error)  {
      logger.error(`Aircraft Validation Error For ${aircraft.name} Error: ${error.details[0].message}`);
    }

  }
  return true;
};

module.exports = chkAircraft;