// Facility Model - Using Mongoose Model
const { Facility, validateFacility } = require('../../models/gov/facility/facility');
const { Factory } = require('../../models/gov/facility/factory');
const { Hanger } = require('../../models/gov/facility/hanger');
const { Lab } = require('../../models/gov/facility/lab');
const { Equipment } = require('../../models/gov/equipment/equipment');
const Research = require('../../models/sci/research');

const facilityCheckDebugger = require('debug')('app:facilityCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkFacility(runFlag) {
  for (const facility of await Facility.find()
                                     .populate("team", "name")
                                     .populate("site", "siteName")) { 
    if (!facility.populated("team")) {  
      logger.error(`Team link missing for Facility ${facility.name} ${facility._id}`);
    }
    if (!facility.populated("site")) {  
        logger.error(`Site link missing for Facility ${facility.name} ${facility._id}`);
    }    

    let { error } = await validateFacility(facility); 
    if (error) {
      logger.error(`Facility Validation Error For ${facility.name} ${facility._id} Error: ${error.details[0].message}`);
    }
    
    if (facility.type === 'Factory'){
      //check equipment references
      //facilityCheckDebugger(`Factory ${facility.name} ${facility._id} Check of Equipment ${facility.equipment.length} and project ${facility.project.length}`)
      for (let i = 0; i < facility.equipment.length; ++i){
        let eFind = await Equipment.findById(facility.equipment[i]);
        if (!eFind) {
          logger.error(`Factory Facility ${facility.name} ${facility._id} has an invalid equipment reference ${i}: ${facility.equipment[i]}`);
        }
      }

      for (let i = 0; i < facility.project.length; ++i){
        let pFind = await Equipment.findById(facility.project[i]);
        if (!pFind) {
          logger.error(`Factory Facility ${facility.name} ${facility._id} has an invalid project(equipment) reference ${i}: ${facility.project[i]}`);
        }
      }
    }

    if (facility.type === 'Hanger'){
      //check equipment references
      //facilityCheckDebugger(`Hanger ${facility.name} ${facility._id} Check of Equipment ${facility.equipment.length} and project ${facility.project.length}`)
      for (let i = 0; i < facility.equipment.length; ++i){
        let eFind = await Equipment.findById(facility.equipment[i]);
        if (!eFind) {
          logger.error(`Hanger Facility ${facility.name} ${facility._id} has an invalid equipment reference ${i}: ${facility.equipment[i]}`);
        }
      }

      /*
      for (let i = 0; i < facility.project.length; ++i){
        let pFind = await Equipment.findById(facility.project[i]);
        if (!pFind) {
          logger.error(`Hanger Facility ${facility.name} ${facility._id} has an invalid project(equipment) reference ${i}: ${facility.project[i]}`);
        }
      }
      */
    }

    if (facility.type === 'Lab'){
      //check equipment/research references
      //facilityCheckDebugger(`Lab ${facility.name} ${facility._id} Check of Equipment ${facility.equipment.length} and research ${facility.research.length}`)
      for (let i = 0; i < facility.equipment.length; ++i){
        let eFind = await Equipment.findById(facility.equipment[i]);
        if (!eFind) {
          logger.error(`Lab Facility ${facility.name} ${facility._id} has an invalid equipment reference ${i}: ${facility.equipment[i]}`);
        }
      }

      //facilityCheckDebugger(`Lab ${facility.name} ${facility._id} Check of Research ${facility.research.length}`);
      for (let i = 0; i < facility.research.length; ++i){
        //facilityCheckDebugger(`Lab ${facility.name} ${facility._id} about to find research for ID ${facility.research[i]}`);
        let rFind = await Research.findById(facility.research[i]);
        if (!rFind) {
          logger.error(`Lab Facility ${facility.name} ${facility._id} has an invalid research reference ${i}: ${facility.research[i]}`);
        }
      }

      if (isNaN(facility.sciRate)) {
        logger.error(`Lab Facility ${facility.name} ${facility._id} sciRate is not a number ${facility.sciRate}`);
      }
      
      
      if (isNaN(facility.bonus)) {
        logger.error(`Lab Facility ${facility.name} ${facility._id} bonus is not a number ${facility.bonus}`);
      }
      
      if (isNaN(facility.funding)) {
        logger.error(`Lab Facility ${facility.name} ${facility._id} funding is not a number ${facility.funding}`);
      }
    }

  }
  return true;
};

module.exports = chkFacility;