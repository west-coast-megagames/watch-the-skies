// Research Model - Using Mongoose Model
const { Research } = require('../../models/sci/research');
const { System } = require('../../models/gov/equipment/systems');

const researchCheckDebugger = require('debug')('app:researchCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkResearch(runFlag) {
  
  for (const research of await Research.find()
                               .populate("team", "name teamType")
                               .populate("credit", "name teamType")) { 
    
    let testPropertys = research.toObject();
    
    if (!testPropertys.hasOwnProperty('name')) {
      logger.error(`Research name is missing ${research._id}`);
    } else {    
      if (!research.name || research.name === "" || research.name === null) {
        logger.error(`Research name has length of zero ${research.name} ${research._id}`);
      }
    }

    if (!testPropertys.hasOwnProperty('code')) {
      logger.error(`Research code is missing  ${research.name} ${research._id}`);    
    } else {
      if (!research.code || research.code === "" || research.code === null) {
        logger.error(`Research code has length of zero ${research.name} ${research._id}`);
      }
    }

    if (!testPropertys.hasOwnProperty('desc')) {
      logger.error(`Research desc is missing  ${research.name} ${research._id}`);    
    } else {
      if (!research.desc || research.desc === "" || research.desc === null) {
        logger.error(`Research description has length of zero ${research.name} ${research._id}`);
      }
    }

    if (!testPropertys.hasOwnProperty('level')) {
      logger.error(`Research level is missing  ${research.name} ${research._id}`);    
    } else {
      if (isNaN(research.level)) {
        logger.error(`Research ${research.name} ${research._id} level is not a number ${research.level}`);
      }
    }  

    if (!testPropertys.hasOwnProperty('progress')) {
      logger.error(`Research progress is missing  ${research.name} ${research._id}`);    
    } else {
      if (isNaN(research.progress)) {
        logger.error(`Research ${research.name} ${research._id} progress is not a number ${research.progress}`);
      }    
    }

    if (!testPropertys.hasOwnProperty('type')) {
      logger.error(`Research type is missing  ${research.name} ${research._id}`);    
    } else {
      if (research.type === 'Knowledge') {
        if (research.status.completed) {
          if (!testPropertys.hasOwnProperty('credit')) {
            logger.error(`Credit Team Field missing for Knowledge Research ${research.name} ${research._id}`);
          }
          
          if (!research.populated("credit")) {  
            logger.error(`Credit Team link missing for Research ${research.name} ${research._id}`);
          }
        }
      }

      if (research.type === 'Analysis' || research.type === 'Technology') {
        if (!testPropertys.hasOwnProperty('team')) {
          logger.error(`Team Field missing for Research ${research.name} ${research._id}`);
        }
          
        if (!research.populated("team")) {  
          logger.error(`Team link missing for Research ${research.name} ${research._id}`);
        }        
      }
    }
  /*
    //has at least one system
    if (research.systems.length < 1) {
      logger.error(`No Systems Assigned to ${research.name} ${research._id}`);
    } 

    //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Systems ${research.systems.length}`);
    for (let i = 0; i < research.systems.length; ++i){
      //researchCheckDebugger(`Research ${research.name} ${research._id} about to find systems for ID ${research.systems[i]}`);
      let sFind = await System.findById(research.systems[i]);
      if (!sFind) {
        logger.error(`Research ${research.name} ${research._id} has an invalid systems reference ${i}: ${research.systems[i]}`);
      }
    }

    let { error } = validateResearch(research);
    if ( error)  {
      logger.error(`Research Validation Error For ${research.name} Error: ${error.details[0].message}`);
    }
*/

  }
  return true;
};

module.exports = chkResearch;