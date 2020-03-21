const fs = require('fs')
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initResearch.json', 'utf8');
const researchDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const researchLoadDebugger = require('debug')('app:researchLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Research Model - Using Mongoose Model
const { Research, KnowledgeResearch, AnalysisResearch, TechResearch } = require('../../models/sci/research');
const { Team } = require('../../models/team/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

teamArray = [];

async function runResearchLoad(runFlag){
  try {  
    if (!runFlag) return false;
    if (runFlag) {
      await loadTeams();                         // get all teams once
      
      await deleteAllResearchs(runFlag);
      await initLoad(runFlag);

    }
    return true;
  } catch (err) {
    researchLoadDebugger('Catch runResearchLoad Error:', err.message);
    logger.error(`runResearchLoad Catch Error ${err.message}`, {meta: err});
    return false; 
  }
};

async function loadTeams() {
  for await (let teams of await Team.find({'teamType': 'N'})) {
    teamArray.push(teams._id);
  }
  researchLoadDebugger(`Number of National Teams Loaded: ${teamArray.length}`);
}

async function initLoad(doLoad) {
  
  //researchLoadDebugger("Jeff in initLoad", doLoad, researchDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < researchDataIn.length; ++i ) { 
    await loadResearch(researchDataIn[i]);
  }
};

async function loadResearch(iData){
  try {   
    let research = await Research.findOne( { name: iData.name } );
    if (!research) {    
      switch(iData.type){
        case "Technology":

          if (iData.teamCode === "All") {
            for (let j = 0; j < teamArray.length; ++j){
              createTechnology(iData, teamArray[j]);
            }
            
          } else {
            let team = Team.find({'teamCode': iData.teamCode});
            if (team) {
              createTechnology(iData, team._id);    
            }    
          }
          break;

        case "Knowledge":
          createKnowledge(iData);
          break;

        default:
          logger.error("Invalid Research Load Type:", iData.type, "name: ", iData.name );
      }
    } else {       
      // no updates here
    }
  } catch (err) {
    logger.error(`Research Catch Error ${err.message}`, {meta: err});
    return;
  }
};

async function deleteAllResearchs(doLoad) {
  
  //researchLoadDebugger("Jeff in deleteAllResearchs", doLoad);    
  if (!doLoad) return;

  try {
    for await (const research of Research.find()) {    
      let id = research._id;

      //researchLoadDebugger("Jeff in deleteAllResearchs loop", research.name); 
      try {
        let researchDel = await Research.findByIdAndRemove(id);
        if (researchDel = null) {
          logger.error(`The Research with the ID ${id} was not found!`);
        }
        //researchLoadDebugger("Jeff in deleteAllResearchs loop after remove", research.name); 
      } catch (err) {
        logger.error(`Research Delete Catch 1 Error ${err.message}`, {meta: err});
      }
    }        
    logger.info("All Researchs succesfully deleted!");
  } catch (err) {
    logger.error(`Research Delete Catch 2 Error ${err.message}`, {meta: err});
  }
};  

async function createTechnology(iData, teamId){
  // New Tech Research here
  let techResearch = new TechResearch({ 
    name: iData.name,
    code: iData.code,
    level: iData.level,
    field: iData.field,
    progress: iData.progress,
    desc: iData.desc,
    team: teamId
  }); 

  techResearch.prereq  = iData.prereq;
  techResearch.unlocks = iData.unlocks;
  techResearch.breakthrough = iData.breakthrough;
  techResearch.theoretical = iData.theoretical; 
  
  /*
  let { error } = validateResearch(techResearch); 
  if (error) {
    logger.error("New Research Validate Error", techResearch.name, error.message);
    return; 
  }
  */

  await techResearch.save((err, techResearch) => {
    if (err) {
      logger.error(`New Tech Research Save Error ${err.message}`, {meta: err});
      return;
    }
    logger.info(`${techResearch.name} add saved to research collection for team id ${teamId}`);
  });
}

async function createKnowledge(iData){
  // New Knowledge Research here
  let knowledgeResearch = new KnowledgeResearch({ 
    name: iData.name,
    code: iData.code,
    level: iData.level,
    field: iData.field,
    progress: iData.progress,
    desc: iData.desc
  }); 

  knowledgeResearch.prereq  = iData.prereq;
  knowledgeResearch.unlocks = iData.unlocks;
  knowledgeResearch.breakthrough = iData.breakthrough;
  
  if (iData.credit != ""){
    let team = await Team.findOne({ teamCode: iData.credit });  
   if (!team) {
     logger.error(`Knowledge Research Load Credit Team Error, New Research: ${iData.name}, Credit Team: ${iData.credit}`);
   } else {
     knowledgeResearch.credit = team._id;
     logger.info(`Knowledge Research Load Credit Team Found, New Research: ${iData.name}, Credit Team: ${iData.credit}`);
   }
  }      

  knowledgeResearch.teamProgress = [];
  //set teamProgress for each national team
  for (let j = 0; j < teamArray.length; ++j) {
    rand = Math.floor(Math.random() * 2);
    rand = Math.max(rand, 0);   // don't go negative
    knowledgeResearch.teamProgress.push({'team': teamArray[j], 'progress': rand});
  }

  /*
  let { error } = validateResearch(corps); 
  if (error) {
    logger.error("New Research Validate Error", corps.name, error.message);
    return; 
  }
  */

  await knowledgeResearch.save((err, knowledgeResearch) => {
    if (err) {
      logger.error(`New Knowledge Research Save Error ${err.message}`, {meta: err});
      return;
    }
    logger.info(`${knowledgeResearch.name} add saved to research collection`);
  });
}

module.exports = runResearchLoad;