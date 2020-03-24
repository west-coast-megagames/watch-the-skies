// Aircraft Model - Using Mongoose Model
const { Aircraft, validateAircraft, validateName, validateAddr } = require('../../models/ops/aircraft');
const { System } = require('../../models/gov/equipment/systems');
const { Team } = require('../../models/team/team');
const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country');
const { Site } = require('../../models/sites/site');
const { Log } = require('../../models/logs/log');

const aircraftCheckDebugger = require('debug')('app:aircraftCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkAircraft(runFlag) {
  
  for (const aircraft of await Aircraft.find()
                               // does not work with .lean
                               /*
                               .populate("team", "name teamType")
                               .populate("zone", "zoneName")
                               .populate("baseOrig", "name")
                               .populate("country", "name")
                               .populate("site", "name")
                               */
                              .lean()) { 
    
    
    //do not need toObject with .lean()
    //let testPropertys = aircraft.toObject();
                         
    if (!aircraft.hasOwnProperty('team')) {
      logger.error(`Team missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }  else {
      let team = await Team.findById({'_id': aircraft.team});
      if (!team) {
        logger.error(`team reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`);
      }
    }
    
    if (!aircraft.hasOwnProperty('zone')) {
      logger.error(`Zone missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    } else {
      let zone = await Zone.findById({'_id': aircraft.zone});
      if (!zone) {
        logger.error(`zone reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`);
      }
    }
   
    if (!aircraft.hasOwnProperty('country')) {
      logger.error(`Country missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    } else {
      let country = await Country.findById({'_id': aircraft.country});
      if (!country) {
        logger.error(`country reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`);
      }
    }

    let skipSiteCheck = false;
    // assume all types should have a site/baseOrig
   
    if (!skipSiteCheck) {
      if (!aircraft.hasOwnProperty('baseOrig')) {
        logger.error(`baseOrig missing for Aircraft ${aircraft.name} ${aircraft._id}`);
      } else {
        let site = await Site.findById({'_id': aircraft.baseOrig});
        if (!site) {
          logger.error(`baseOrig reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`);
        }
      }

      if (!aircraft.hasOwnProperty('site')) {
        logger.error(`site missing for Aircraft ${aircraft.name} ${aircraft._id}`);
      } else {
        let site = await Site.findById({'_id': aircraft.site});
        if (!site) {
          logger.error(`site reference is invalid for Aircraft ${aircraft.name} ${aircraft._id}`);
        }
      }      
    }

    if (!aircraft.hasOwnProperty('serviceRecord')) {
      logger.error(`serviceRecord missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    } else {
      for (let i = 0; i < aircraft.serviceRecord.length; ++i){
        let lFind = await Log.findById(aircraft.serviceRecord[i]);
        if (!lFind) {
          logger.error(`Aircraft ${aircraft.name} ${aircraft._id} has an invalid serviceRecord reference ${i}: ${aircraft.serviceRecord[i]}`);
        }
      }
    }    

    if (!aircraft.hasOwnProperty('model')) {
      logger.error(`model missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

    if (!aircraft.hasOwnProperty('type')) {
      logger.error(`type missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

    if (!aircraft.hasOwnProperty('name')) {
      logger.error(`name missing for Aircraft ${aircraft._id}`);
    }

    if (!aircraft.hasOwnProperty('mission')) {
      logger.error(`mission missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

    if (!aircraft.hasOwnProperty('status')) {
      logger.error(`status missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

   if (!aircraft.hasOwnProperty('systems')) {
      logger.error(`systems missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    } else {
      //has at least one system
      if (aircraft.systems.length < 1) {
        logger.error(`No Systems Assigned to ${aircraft.name} ${aircraft._id}`);
      } else {
        //aircraftCheckDebugger(`Aircraft ${aircraft.name} ${aircraft._id} Check of Systems ${aircraft.systems.length}`);
        for (let i = 0; i < aircraft.systems.length; ++i){
          //aircraftCheckDebugger(`Aircraft ${aircraft.name} ${aircraft._id} about to find systems for ID ${aircraft.systems[i]}`);
          let sFind = await System.findById(aircraft.systems[i]);
          if (!sFind) {
            logger.error(`Aircraft ${aircraft.name} ${aircraft._id} has an invalid systems reference ${i}: ${aircraft.systems[i]}`);
          }
        }
      }
    }
  
    if (!aircraft.hasOwnProperty('stats')) {
      logger.error(`stats missing for Aircraft ${aircraft.name} ${aircraft._id}`);
    }

    try {
      let { error } = validateAircraft(aircraft);
      if ( error)  {
        logger.error(`Aircraft Validation Error For ${aircraft.name} Error: ${error.details[0].message}`);
      }
    } catch (err) {
      logger.error(`Aircraft Validation Error For ${aircraft.name} Error: ${err.details[0].message}`);
    } 
  }
  return true;
};

module.exports = chkAircraft;