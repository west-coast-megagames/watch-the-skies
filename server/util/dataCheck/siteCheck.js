// Site Model - Using Mongoose Model
const { Site, validateSite, BaseSite, validateBase, CrashSite, validateCrash,
        CitySite, validateCity, Spacecraft, validateSpacecraft } = require('../../models/sites/site');
const { Equipment } = require('../../models/gov/equipment/equipment');
const { Facility } = require('../../models/gov/facility/facility');
const { Team } = require('../../models/team/team');
const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country');
const siteCheckDebugger = require('debug')('app:siteCheck');

const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const typeVals = ['City', 'Base', 'Crash', 'Spacecraft'];
const shipTypeVals = ['Satellite', 'Cruiser', 'Battleship', 'Hauler', 'Station'];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkSite(runFlag) {
  for (const site of await Site.find( /* { siteCode: "USBB"} */ )
                                     /* does not work with .lean()
                                     .populate("team", "name")
                                     .populate("country", "name")
                                     .populate("zone", "zoneName")
                                     */
                                    .lean()) { 
                                      
    /*  does not work with .lean()
    if (!site.populated("team")) {  
      logger.error(`Team link missing for Site ${site.name} ${site._id} ${site.type}`);
    }
    if (!site.populated("country")) {  
        logger.error(`Country link missing for Site ${site.name} ${site._id} ${site.type}`);
    }    
    if (!site.populated("zone")) {  
        logger.error(`Zone link missing for Site ${site.name} ${site._id} ${site.type}`);
    }    
    */

    if (!site.hasOwnProperty('team')) {
      logger.error(`Team missing for Site ${site.name} ${site._id}`);
    }  else {
      let team = await Team.findById({'_id': site.team});
      if (!team) {
        logger.error(`team reference is invalid for Site ${site.name} ${site._id}`);
      }
    }

    if (!site.hasOwnProperty('zone')) {
      logger.error(`Zone missing for Site ${site.name} ${site._id}`);
    }  else {
      let zone = await Zone.findById({'_id': site.zone});
      if (!zone) {
        logger.error(`zone reference is invalid for Site ${site.name} ${site._id}`);
      }
    }

    if (!site.hasOwnProperty('country')) {
      logger.error(`Country missing for Site ${site.name} ${site._id}`);
    }  else {
      let country = await Country.findById({'_id': site.country});
      if (!country) {
        logger.error(`country reference is invalid for Site ${site.name} ${site._id}`);
      }
    }

    try {
      let { error } = await validateSite(site); 
      if (error) {
        logger.error(`Site Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
      }
    } catch (err) {
      logger.error(`Site Validation Error For ${site.name} ${site._id} Error: ${err.details[0].message}`);
    } 
  
    if (!site.hasOwnProperty('model')) {
      logger.error(`model missing for Site ${site.name} ${site._id}`);
    }

    if (!site.hasOwnProperty('name')) {
      logger.error(`name missing for Site ${site.siteCode} ${site._id}`);
    }

    if (!site.hasOwnProperty('siteCode')) {
      logger.error(`siteCode missing for Site ${site.name} ${site._id}`);
    }

    if (!site.hasOwnProperty('geoDMS')) {
      logger.error(`geoDMS missing for Site ${site.name} ${site._id}`);
    } else {
      if (!site.geoDMS.hasOwnProperty('latDMS')) {
        logger.error(`citySite Site ${site.name} ${site._id} has missing geoDMS latDMS`);
      } else {  
        if (site.geoDMS.latDMS === '' || site.geoDMS.latDMS === 'undefined') {
          logger.error(`citySite Site ${site.name} ${site._id} has an invalid or blank geoDMS latDMS ${site.geoDMS.latDMS}`); 
        }
      }

      if (!site.geoDMS.hasOwnProperty('longDMS')) {
        logger.error(`citySite Site ${site.name} ${site._id} has missing geoDMS longDMS ${site.geoDMS.latDMS}`);
      } else { 
        if (site.geoDMS.longDMS === '' || site.geoDMS.longDMS === 'undefined') {
          logger.error(`citySite Site ${site.name} ${site._id} has an invalid or blankk geoDMS longDMS ${site.geoDMS.longDMS}`);
        } 
      }
    }

    if (!site.hasOwnProperty('geoDecimal')) {
      logger.error(`geoDecimal missing for Site ${site.name} ${site._id}`);
    } else {
      if (!site.geoDecimal.hasOwnProperty('latDecimal')) {
        logger.error(`citySite Site ${site.name} ${site._id} has missing geoDecimal latDecimal`);
      } else {  
        if (site.geoDecimal.latDecimal < -90 || site.geoDecimal.latDecimal > 90) {
          logger.error(`Site ${site.name} ${site._id} has an invalid geoDecimal latDecimal ${site.geoDecimal.latDecimal}`);
        }
      }
      if (!site.geoDecimal.hasOwnProperty('longDecimal')) {
        logger.error(`citySite Site ${site.name} ${site._id} has missing geoDecimal longDecimal`);
      } else {
        if (site.geoDecimal.longDecimal < -180 || site.geoDecimal.longDecimal > 180) {
          logger.error(`Site ${site.name} ${site._id} has an invalid geoDecimal longDecimal ${site.geoDecimal.longDecimal}`);
        }
      }
    }

    if (!site.hasOwnProperty('hidden')) {
      logger.error(`hidden missing for Site ${site.name} ${site._id}`);
    }

    if (!site.hasOwnProperty('type')) {
      logger.error(`Site type is missing  ${site.name} ${site._id}`);    
    } else {
      if (!inArray(typeVals, site.type)) {
        logger.error(`Invalid type ${site.type} for Site ${site.name} ${site._id}`);
      }

      if (!site.hasOwnProperty('facilities')) {
        logger.error(`facilities missing for Site ${site.name} ${site._id}`);
      } else {
        //check facility references
        //siteCheckDebugger(`Site ${site.name} ${site._id} ${site.type} Check of facility ${site.facilities.length} `)
        for (let i = 0; i < site.facilities.length; ++i){
          let fFind = await Facility.findById(site.facilities[i]);
          if (!fFind) {
            logger.error(`${site.type} Site ${site.name} ${site._id} has an invalid facilities reference ${i}: ${site.facilities[i]}`);
          }
        }
      }

      if (site.type === 'Base'){

        if (!site.hasOwnProperty('defenses')) {
          logger.error(`defenses missing for Base Site ${site.name} ${site._id}`);
        }

        if (!site.hasOwnProperty('public')) {
          logger.error(`public missing for Base Site ${site.name} ${site._id}`);
        }

        try {
          let { error } = await validateBase(site); 
          if (error) {
            logger.error(`Base Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
          }
        } catch ( err ) {
          logger.error(`Base Site Validation Error For ${site.name} ${site._id} Error: ${err.details[0].message}`);
        }
      }

      if (site.type === 'City'){

        if (!site.hasOwnProperty('dateline')) {
          logger.error(`dateline missing for City Site ${site.name} ${site._id}`);
        } else {
          if (site.dateline === '' || site.dateline === 'undefined') {
            logger.error(`citySite Site ${site.name} ${site._id} has an invalid or blank dateline ${site.dateline}`);
          }
        }
        try {
          let { error } = await validateCity(site); 
          if (error) {
            logger.error(`City Validation Error For ${site.name} ${site._id} Error: ${error.details[0].message}`);
          }
        } catch ( err ) {
          logger.error(`City Site Validation Error For ${site.name} ${site._id} Error: ${err.details[0].message}`);
        }
      }
    
      if (site.type === 'Crash'){

        if (!site.hasOwnProperty('salvage')) {
          logger.error(`salvage missing for Crash Site ${site.name} ${site._id}`);
        } else {
          //check system references
          //siteCheckDebugger(`Spacecraft ${site.name} ${site._id} Check of Salvage ${site.salvage.length}`)
          for (let i = 0; i < site.salvage.length; ++i){
            let sFind = await System.findById(site.salvage[i]);
            if (!sFind) {
              logger.error(`Crash Site ${site.name} ${site._id} has an invalid salvage reference ${i}: ${site.salvage[i]}`);
            }
          }
        }
      
        if (!site.hasOwnProperty('status')) {
          logger.error(`status missing for Crash Site ${site.name} ${site._id}`);
        } else {
          if (!site.status.hasOwnProperty('public')) {
            logger.error(`status.public missing for crash Site ${site.name} ${site._id}`);
          } 
          if (!site.status.hasOwnProperty('secret')) {
            logger.error(`status.secret missing for crash Site ${site.name} ${site._id}`);
          } 
        }

        try {
          let { error } = await validateCrash(site); 
          if (error) {
            logger.error(`Crash Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
          }
        } catch ( err ) {
          logger.error(`Crash Site Validation Error For ${site.name} ${site._id} Error: ${err.details[0].message}`);
        }
      }

      if (site.type === 'Spacecraft'){

        if (!site.hasOwnProperty('shipType')) {
          logger.error(`shipType missing for Spacecraft Site ${site.name} ${site._id}`);
        } else {
          if (!inArray(shipTypeVals, site.shipType)) {
            logger.error(`Invalid shipType ${site.shipType} for Spacecraft Site ${site.name} ${site._id}`);
          }          
        }

        if (!site.hasOwnProperty('status')) {
          logger.error(`status missing for Spacecraft Site ${site.name} ${site._id}`);
        } else {
          if (!site.status.hasOwnProperty('damaged')) {
            logger.error(`status.damaged missing for Spacecraft Site ${site.name} ${site._id}`);
          } 
          if (!site.status.hasOwnProperty('destroyed')) {
            logger.error(`status.destroyed missing for Spacecraft Site ${site.name} ${site._id}`);
          } 
          if (!site.status.hasOwnProperty('upgrade')) {
            logger.error(`status.upgrade missing for Spacecraft Site ${site.name} ${site._id}`);
          } 
          if (!site.status.hasOwnProperty('repair')) {
            logger.error(`status.repair missing for Spacecraft Site ${site.name} ${site._id}`);
          } 
          if (!site.status.hasOwnProperty('secret')) {
            logger.error(`status.secret missing for Spacecraft Site ${site.name} ${site._id}`);
          } 
        }

        try {
          let { error } = await validateSpacecraft(site); 
          if (error) {
            logger.error(`Spacecraft Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
          } 
        } catch ( err ) {
          logger.error(`Space Site Validation Error For ${site.name} ${site._id} Error: ${err.details[0].message}`);
        }  
      }    
    }
  }
  return true;
};

module.exports = chkSite;