// Research Model - Using Mongoose Model
const { Research } = require('../../models/sci/research');
const { Team } = require('../../models/team/team');
const { Equipment, Gear, Kit, System } = require('../../models/gov/equipment/equipment');
const { Site } = require('../../models/sites/site');
const { Facility } = require('../../models/gov/facility/facility');

const researchCheckDebugger = require('debug')('app:researchCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science', 'Physics', 'Psychology', 'Social Science', 'Quantum Mechanics']
const outcomes = ['Destroy', 'Damage', 'Kill', 'Perserve'];
const techFields = ['Military', 'Infrastructure', 'Biomedical', 'Agriculture', 'Analysis'];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkResearch(runFlag) {
  
  for (const research of await Research.find()
                               .populate("team", "name teamType")
                               .populate("credit", "name teamType")) { 
    
    let testPropertys = research.toObject();
    
    if (!testPropertys.hasOwnProperty('name')) {
      logger.error(`Research name is missing ${research._id}`);
    } else {    
      if (research.name == undefined || research.name === "" || research.name === null) {
        logger.error(`Research name has length of zero ${research.name} ${research._id}`);
      }
    }

    if (!testPropertys.hasOwnProperty('code')) {
      logger.error(`Research code is missing  ${research.name} ${research._id}`);    
    } else {
      if (research.code == undefined || research.code === "" || research.code === null) {
        logger.error(`Research code has length of zero ${research.name} ${research._id}`);
      }
    }

    if (!testPropertys.hasOwnProperty('desc')) {
      logger.error(`Research desc is missing  ${research.name} ${research._id}`);    
    } else {
      if (research.desc == undefined || research.desc === "" || research.desc === null) {
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
            logger.error(`Credit Team link missing for Knowledge Research ${research.name} ${research._id}`);
          }
        }
        if (!testPropertys.hasOwnProperty('field')) {
          logger.error(`Field missing for Knowledge Research ${research.name} ${research._id}`);
        } else {
          if (!inArray(fields, research.field)) {
            logger.error(`Invalid field ${research.field} for Knowledge Research ${research.name} ${research._id}`);
          }
        }

        if (!testPropertys.hasOwnProperty('status')) {
          logger.error(`Knowledge Research status is missing  ${research.name} ${research._id}`);    
        } else {
          if (research.status.available === undefined || research.status.available === null) {
            logger.error(`Knowledge Research status.available is not set ${research.name} ${research._id}`);
          }     
          if (research.status.completed === undefined || research.status.completed === null) {
            logger.error(`Knowledge Research status.completed is not set ${research.name} ${research._id}`);
          }                    
          if (research.status.published === undefined || research.status.published === null) {
            logger.error(`Knowledge Research status.published is not set ${research.name} ${research._id}`);
          }     
        }

        if (!testPropertys.hasOwnProperty('teamProgress')) {
          logger.error(`Knowledge Research teamProgress is missing  ${research.name} ${research._id}`);  
        } else {
          let team = null;
          for (let i = 0; i < research.teamProgress.length; ++i){
            
            if (research.teamProgress[i].progress === undefined || research.teamProgress[i].progress === null) {
              logger.error(`Knowledge Research teamProgress.progress is not set ${research.name} ${research._id}`);
            } else {
              if (isNaN(research.teamProgress[i].progress)) {
                logger.error(`Knowledge Research ${research.name} ${research._id} teamProgress ${i} progress is not a number ${research.teamProgress[i].progress}`);
              } 
            }

            if (research.teamProgress[i].team === undefined || research.teamProgress[i].team === null) {
              logger.error(`Knowledge Research teamProgress.team is not set ${research.name} ${research._id}`);
            } else {
              team = await Team.findById(research.teamProgress[i].team);
              if (!team) {
                logger.error(`Knowledge Research teamProgress ${i} has invalid Team Ref ${research.name} ${research._id}`);
              }
            }
          }
        }
      }

      if (research.type === 'Analysis' || research.type === 'Technology') {
        if (!testPropertys.hasOwnProperty('team')) {
          logger.error(`Team Field missing for ${research.type} Research ${research.name} ${research._id}`);
        }
          
        if (!research.populated("team")) {  
          logger.error(`Team link missing for Research ${research.name} ${research._id}`);
        }        

        if (!testPropertys.hasOwnProperty('status')) {
          logger.error(`${research.type} Research status is missing  ${research.name} ${research._id}`);    
        } else {
          if (research.status.available === undefined || research.status.available === null) {
            logger.error(`${research.type} Research status.available is not set ${research.name} ${research._id}`);
          }     
          if (research.status.completed === undefined || research.status.completed === null) {
            logger.error(`${research.type} Research status.completed is not set ${research.name} ${research._id}`);
          }                  
          
          if (research.type === 'Technology') {
            if (research.status.visible === undefined || research.status.visible === null) {
              logger.error(`${research.type} Research status.visible is not set ${research.name} ${research._id}`);
            }                 
          }
        }

        if (research.type === 'Analysis') {
          if (!testPropertys.hasOwnProperty('salvage')) {
            logger.error(`Analysis Research salvage is missing  ${research.name} ${research._id}`);    
          } else {
            let equipment = null;
            let facility = null;
            let site = null;
            for (let i = 0; i < research.salvage.length; ++i){
              
              if (!inArray(outcomes, research.salvage[i].outcome)) {
                logger.error(`Invalid salvage outcome ${i} ${research.salvage[i].outcome} for Analysis Research ${research.name} ${research._id}`);
              }    
              equipment = await Equipment.findById(research.salvage[i].gear);
              if (!equipment) {
                logger.error(`Analysis Research salvage ${i} has invalid gear Ref ${research.name} ${research._id}`);
              }
              equipment = await Equipment.findById(research.salvage[i].system);
              if (!equipment) {
                logger.error(`Analysis Research salvage ${i} has invalid system Ref ${research.name} ${research._id}`);
              }
              equipment = await Equipment.findById(research.salvage[i].infrastructure);
              if (!equipment) {
                logger.error(`Analysis Research salvage ${i} has invalid infrastructure Ref ${research.name} ${research._id}`);
              }
              facility = await Facility.findById(research.salvage[i].facility);
              if (!facility) {
                logger.error(`Analysis Research salvage ${i} has invalid facility Ref ${research.name} ${research._id}`);
              }
              site = await Site.findById(research.salvage[i].site);
              if (!site) {
                logger.error(`Analysis Research salvage ${i} has invalid site Ref ${research.name} ${research._id}`);
              }
            }
          }
        }
        if (research.type === 'Technology') {
          if (!testPropertys.hasOwnProperty('field')) {
            logger.error(`Field missing for Technology Research ${research.name} ${research._id}`);
          } else {
            if (!inArray(techFields, research.field)) {
              logger.error(`Invalid field ${research.field} for Technology Research ${research.name} ${research._id}`);
            }
          }

          if (!testPropertys.hasOwnProperty('theoretical')) {
            logger.error(`theoretical missing for Technology Research ${research.name} ${research._id}`);
          } else {
            for (let i = 0; i < research.theoretical.length; ++i){
              if (research.theoretical[i].name == undefined || research.theoretical[i].name === "" || research.theoretical[i].name === null) {
                logger.error(`Technology Research theoretical name ${i} has length of zero ${research.name} ${research._id}`);
              }
              if (research.theoretical[i].level == undefined || research.theoretical[i].level === undefined || research.theoretical[i].level === null) {
                logger.error(`Technology Research theoretical level ${i} has length of zero ${research.name} ${research._id}`);
              }
              if (research.theoretical[i].type == undefined || research.theoretical[i].type === "" || research.theoretical[i].type === null) {
                logger.error(`Technology Research theoretical type ${i} has length of zero ${research.name} ${research._id}`);
              }
              if (research.theoretical[i].code == undefined || research.theoretical[i].code === "" || research.theoretical[i].code === null) {
                logger.error(`Technology Research theoretical code ${i} has length of zero ${research.name} ${research._id}`);
              }
              if (research.theoretical[i].desc == undefined || research.theoretical[i].desc === "" || research.theoretical[i].desc === null) {
                logger.error(`Technology Research theoretical desc ${i} has length of zero ${research.name} ${research._id}`);
              }
              if (research.theoretical[i].field == undefined || research.theoretical[i].field === "" || research.theoretical[i].field === null) {
                logger.error(`Technology Research theoretical field ${i} has length of zero ${research.name} ${research._id}`);
              }
              
              for (let j = 0; j < research.theoretical[i].prereq[j].length; ++j){
                if (research.theoretical[i].prereq[j].code == undefined || research.theoretical[i].prereq[j].code === "" 
                    || research.theoretical[i].prereq[j].code === null) {
                  logger.error(`Technology Research Theoretical ${i} prereq code ${j} is not set ${research.name} ${research._id}`);
                }
                if (research.theoretical[i].prereq[j].type == undefined || research.theoretical[i].prereq[j].type === "" 
                    || research.theoretical[i].prereq[j].type === null) {
                  logger.error(`Technology Research Theoretical ${i} prereq type ${j} is not set ${research.name} ${research._id}`);
                }
              }
            }      
          }  
        }  
      }
    }

    if (!testPropertys.hasOwnProperty('prereq')) {
      logger.error(`Research prereq is missing  ${research.name} ${research._id}`);  
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Prereq ${research.prereq.length}`);
      for (let i = 0; i < research.prereq.length; ++i){
        if (research.prereq[i].code == undefined || research.prereq[i].code === "" || research.prereq[i].code === null) {
          logger.error(`Research prereq code ${i} has length of zero ${research.name} ${research._id}`);
        }
        if (research.prereq[i].type == undefined || research.prereq[i].type === "" || research.prereq[i].type === null) {
          logger.error(`Research prereq type ${i} has length of zero ${research.name} ${research._id}`);
        }
      }
    }

    if (!testPropertys.hasOwnProperty('unlocks')) {
      logger.error(`Research unlocks is missing  ${research.name} ${research._id}`);  
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.unlocks.length}`);
      for (let i = 0; i < research.unlocks.length; ++i){
        if (research.unlocks[i].code == undefined || research.unlocks[i].code === "" || research.unlocks[i].code === null) {
          logger.error(`Research unlocks code ${i} has length of zero ${research.name} ${research._id}`);
        }
        if (research.unlocks[i].type == undefined || research.unlocks[i].type === "" || research.unlocks[i].type === null) {
          logger.error(`Research unlocks type ${i} has length of zero ${research.name} ${research._id}`);
        }
      }
    }

    if (!testPropertys.hasOwnProperty('breakthrough')) {
      logger.error(`Research breakthrough is missing  ${research.name} ${research._id}`);  
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.breakthrough.length}`);
      for (let i = 0; i < research.breakthrough.length; ++i){
        if (research.breakthrough[i].code = undefined || research.breakthrough[i].code === "" || research.breakthrough[i].code === null) {
          logger.error(`Research breakthrough code ${i} has length of zero ${research.name} ${research._id}`);
        }
        if (research.breakthrough[i].type == undefined || research.breakthrough[i].type === "" || research.breakthrough[i].type === null) {
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