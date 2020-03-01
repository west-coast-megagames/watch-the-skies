// Site Model - Using Mongoose Model
const { Site, validateSite } = require('../../models/sites/site');
const { BaseSite, validateBase } = require('../../models/sites/baseSite');
const { CitySite, validateCity } = require('../../models/sites/citySite');
const { CrashSite, validateCrash } = require('../../models/sites/crashSite');
const { Spacecraft, validateSpacecraft } = require('../../models/sites/spacecraft');
const { Equipment } = require('../../models/gov/equipment/equipment');
const { Facility } = require('../../models/gov/facility/facility');
const { System } = require('../../models/gov/equipment/systems');
const siteCheckDebugger = require('debug')('app:siteCheck');

const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkSite(runFlag) {
  for (const site of await Site.find()
                                     .populate("team", "name")
                                     .populate("country", "name")
                                     .populate("zone", "zoneName")) { 
    if (!site.populated("team")) {  
      logger.error(`Team link missing for Site ${site.name} ${site._id} ${site.type}`);
    }
    if (!site.populated("country")) {  
        logger.error(`Country link missing for Site ${site.name} ${site._id} ${site.type}`);
    }    
    if (!site.populated("zone")) {  
        logger.error(`Zone link missing for Site ${site.name} ${site._id} ${site.type}`);
    }    

    let { error } = await validateSite(site); 
    if (error) {
      logger.error(`Site Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
    }

    if (site.geoDecimal.latDecimal < -90 || site.geoDecimal.latDecimal > 90) {
      logger.error(`Site ${site.name} ${site._id} has an invalid geoDecimal latDecimal ${site.geoDecimal.latDecimal}`);
    }
    if (site.geoDecimal.longDecimal < -180 || site.geoDecimal.longDecimal > 180) {
      logger.error(`Site ${site.name} ${site._id} has an invalid geoDecimal longDecimal ${site.geoDecimal.longDecimal}`);
    }
    
    if (site.type === 'Base'){

      let { error } = await validateBase(site); 
      if (error) {
        logger.error(`Base Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
      }

      //check facility references
      //siteCheckDebugger(`BaseSite ${site.name} ${site._id} ${site.type} Check of facility ${site.facilities.length} `)
      for (let i = 0; i < site.facilities.length; ++i){
        let fFind = await Facility.findById(site.facilities[i]);
        if (!fFind) {
          logger.error(`baseSite Site ${site.name} ${site._id} has an invalid facilities reference ${i}: ${site.facilities[i]}`);
        }
      }

      if (site.geoDMS.latDMS === '' || site.geoDMS.latDMS === 'undefined') {
        logger.error(`baseSite Site ${site.name} ${site._id} has an invalid or blank geoDMS latDMS ${site.geoDMS.latDMS}`);
      }
      if (site.geoDMS.longDMS === '' || site.geoDMS.longDMS === 'undefined') {
        logger.error(`baseSite Site ${site.name} ${site._id} has an invalid or blank geoDMS longDMS ${site.geoDMS.longDMS}`);
      }
    }

    if (site.type === 'City'){

      let { error } = await validateCity(site); 
      if (error) {
        logger.error(`City Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
      }

      //no references to check
      if (site.geoDMS.latDMS === '' || site.geoDMS.latDMS === 'undefined') {
        logger.error(`citySite Site ${site.name} ${site._id} has an invalid or blank geoDMS latDMS ${site.geoDMS.latDMS}`);
      }
      if (site.geoDMS.longDMS === '' || site.geoDMS.longDMS === 'undefined') {
        logger.error(`citySite Site ${site.name} ${site._id} has an invalid or blankk geoDMS longDMS ${site.geoDMS.longDMS}`);
      }
      if (site.dateline === '' || site.dateline === 'undefined') {
        logger.error(`citySite Site ${site.name} ${site._id} has an invalid or blank dateline ${site.dateline}`);
      }
    }
    
    if (site.type === 'Crash'){

      let { error } = await validateCrash(site); 
      if (error) {
        logger.error(`Crash Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
      }

      //check system references
      //siteCheckDebugger(`CrashSite ${site.name} ${site._id} Check of Salvage ${site.salvage.length}`)
      for (let i = 0; i < site.salvage.length; ++i){
        let sFind = await System.findById(site.salvage[i]);
        if (!sFind) {
          logger.error(`crashSite Site ${site.name} ${site._id} has an invalid salvage reference ${i}: ${site.salvage[i]}`);
        }
      }
    }

    if (site.type === 'Spacecraft'){

      let { error } = await validateSpacecraft(site); 
      if (error) {
        logger.error(`Spacecraft Validation Error For ${site.name} ${site._id} ${site.type} Error: ${error.details[0].message}`);
      }
  
      //check system references
      //siteCheckDebugger(`Spacecraft ${site.name} ${site._id} Check of Systems ${site.systems.length}`)
      for (let i = 0; i < site.systems.length; ++i){
        let sFind = await System.findById(site.systems[i]);
        if (!sFind) {
          logger.error(`Spacecraft Site ${site.name} ${site._id} has an invalid systems reference ${i}: ${site.systems[i]}`);
        }
      }
    }    
  }
  return true;
};

module.exports = chkSite;