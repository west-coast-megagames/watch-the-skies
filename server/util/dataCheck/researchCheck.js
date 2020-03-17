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

    if (!testPropertys.hasOwnProperty('prereq')) {
      logger.error(`Research prereq is missing  ${research.name} ${research._id}`);  
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Prereq ${research.prereq.length}`);
      for (let i = 0; i < research.prereq.length; ++i){
        if (!research.prereq[i].code || research.prereq[i].code === "" || research.prereq[i].code === null) {
          logger.error(`Research prereq code ${i} has length of zero ${research.name} ${research._id}`);
        }
        if (!research.prereq[i].type || research.prereq[i].type === "" || research.prereq[i].type === null) {
          logger.error(`Research prereq type ${i} has length of zero ${research.name} ${research._id}`);
        }
      }
    }

    if (!testPropertys.hasOwnProperty('unlocks')) {
      logger.error(`Research unlocks is missing  ${research.name} ${research._id}`);  
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.unlocks.length}`);
      for (let i = 0; i < research.unlocks.length; ++i){
        if (!research.unlocks[i].code || research.unlocks[i].code === "" || research.unlocks[i].code === null) {
          logger.error(`Research unlocks code ${i} has length of zero ${research.name} ${research._id}`);
        }
        if (!research.unlocks[i].type || research.unlocks[i].type === "" || research.unlocks[i].type === null) {
          logger.error(`Research unlocks type ${i} has length of zero ${research.name} ${research._id}`);
        }
      }
    }

    if (!testPropertys.hasOwnProperty('breakthrough')) {
      logger.error(`Research breakthrough is missing  ${research.name} ${research._id}`);  
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.breakthrough.length}`);
      for (let i = 0; i < research.breakthrough.length; ++i){
        if (!research.breakthrough[i].code || research.breakthrough[i].code === "" || research.breakthrough[i].code === null) {
          logger.error(`Research breakthrough code ${i} has length of zero ${research.name} ${research._id}`);
        }
        if (!research.breakthrough[i].type || research.breakthrough[i].type === "" || research.breakthrough[i].type === null) {
          logger.error(`Research breakthrough type ${i} has length of zero ${research.name} ${research._id}`);
        }
      }
    }

    /*
    let { error } = validateResearch(research);
    if ( error)  {
      logger.error(`Research Validation Error For ${research.name} Error: ${error.details[0].message}`);
    }
    */

  }
  return true;
};

module.exports = chkResearch;