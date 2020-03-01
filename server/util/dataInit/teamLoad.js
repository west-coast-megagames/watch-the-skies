const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initTeams.json', 'utf8');
const teamDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const teamLoadDebugger = require('debug')('app:teamLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Team Model - Using Mongoose Model
const { Team, validateTeam } = require('../../models/team/team');
const { Alien, validateAlien } = require('../../models/team/alien');
const { Control, validateControl } = require('../../models/team/control');
const { Media, validateMedia } = require('../../models/team/media');
const { National, validateNational } = require('../../models/team/national');
const { Npc, validateNpc } = require('../../models/team/npc');

const { Country } = require('../../models/country');

const app = express();

/*
Team.watch().on('change', data => {
  teamLoadDebugger(data);
});
*/

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runTeamLoad(runFlag){
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  for (let i = 0; i < teamDataIn.length; ++i ) {
    
    if (teamDataIn[i].loadType == "team") {     
      
      // delete old data
      //await deleteTeam(teamDataIn[i]);   will cause previously loaded team record id's to change

      if (teamDataIn[i].loadFlag == "true") {
        await loadTeam(teamDataIn[i]);
      }
    }
  }
};

async function loadTeam(tData){
  try {   
    let team = await Team.findOne( { teamCode: tData.code } );

    if (!team) {
      
      switch(tData.teamType){
        case "N":
          newNational(tData);
          break;
        case "A":
          newAlien(tData);
          break;
        case "C":
          newControl(tData);
          break;
        case "P":
          newNPC(tData);
          break;
        case "M":
          newMedia(tData);
          break;
        default:
          logger.error(`Invalid Team Type In : ${tData.teamType}`);
      } 
    } else {         
      switch(team.teamType){
        case "N":
          updNational(tData, team._id);
          break;
        case "A":
          updAlien(tData, team._id);
          break;
        case "C":
          updControl(tData, team._id);
          break;
        case "P":
          updNPC(tData, team._id);
          break;
        case "M":
          updMedia(tData, team._id);
          break;
        default:
          logger.error(`Invalid Team Type In : ${tData.teamType}`);
      } 
    }
  } catch (err) {
    teamLoadDebugger('Catch Team Error:', err.message);
    return;
  }
};

async function deleteTeam(tData){

  if (tData.loadFlg === "true") return;   // shouldn't be here if flagged for load

  try {
    let delErrorFlag = false;
    for await (let team of Team.find( { teamCode: tData.code } )) {    
      try {
        let delId = team._id;
        let teamDel = await Team.findByIdAndRemove(delId);
        if (teamDel = null) {
          teamLoadDebugger(`deleteTeam: Team with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        teamLoadDebugger('deleteTeam Error 1:', err.message);
        let delErrorFlag = true;
      }
    }        
    if (!delErrorFlag) {
       teamLoadDebugger("All Teams succesfully deleted for Code:", tData.code);
    } else {
       teamLoadDebugger("Some Error In Teams delete for Code:", tData.code);
    }
  } catch (err) {
    teamLoadDebugger(`deleteTeam Error 2: ${err.message}`);
  }
};

async function newNational(tData){
  // New National Team here
  let national = new National({ 
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType
  }); 

  let { error } = validateNational(national); 
  if (error) {
    teamLoadDebugger(`New National Team Validate Error, ${tData.teamCode}  ${error.message}`);
    return;
  }

  national.prTrack  = tData.prTrack;
  national.roles    = tData.roles;
  national.prLevel  = tData.prLevel;
  national.agents   = tData.agents;

  if (tData.homeCountry != ""){
    let country = await Country.findOne({ code: tData.homeCountry });  
    if (!country) {
      teamLoadDebugger("Team Load Country Error, New Team:", tData.name, " Country: ", tData.homeCountry);
    } else {
      national.homeCountry = country._id;
      teamLoadDebugger("Team Load Country Found, New Team:", tData.name, " Country: ", tData.homeCountry, "Country ID:", country._id);
    }      
  }
  //national.sciRate  = tData.sciRate;

  await national.save((err, national) => {
    if (err) return logger.error(`New Team Save Error: ${err}`);
    teamLoadDebugger(`${national.name} add saved to teams collection. type: ${national.teamType}`);
  });
};

async function newAlien(tData){
  // New Alien Team here
  let alien = new Alien({ 
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType
  }); 

  let { error } = validateAlien(alien); 
  if (error) {
    teamLoadDebugger(`New Alien Team Validate Error, ${tData.teamCode}  ${error.message}`);
    return;
  }

  alien.roles    = tData.roles;
  alien.agents   = tData.agents;

  await alien.save((err, alien) => {
    if (err) return logger.error(`New Team Save Error: ${err}`);
    teamLoadDebugger(`${alien.name} add saved to teams collection. type: ${alien.teamType}`);
  });
};

async function newMedia(tData){
  // New Media Team here
  let media = new Media({ 
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType
  }); 

  let { error } = validateMedia(media); 
  if (error) {
    teamLoadDebugger(`New Media Team Validate Error, ${tData.teamCode}  ${error.message}`);
    return;
  }

  await media.save((err, media) => {
    if (err) return logger.error(`New Team Save Error: ${err}`);
    teamLoadDebugger(`${media.name} add saved to teams collection. type: ${media.teamType}`);
  });
};

async function newControl(tData){
  // New Control Team here
  let control = new Control({ 
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType
  }); 

  let { error } = validateControl(control); 
  if (error) {
    teamLoadDebugger(`New Control Team Validate Error, ${tData.teamCode}  ${error.message}`);
    return;
  }

  control.roles    = tData.roles;

  await control.save((err, control) => {
    if (err) return logger.error(`New Team Save Error: ${err}`);
    teamLoadDebugger(`${control.name} add saved to teams collection. type: ${control.teamType}`);
  });
};

async function newNPC(tData){
  // New NPC Team here
  let npc = new Npc({ 
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType
  }); 

  let { error } = validateNpc(npc); 
  if (error) {
    teamLoadDebugger(`New NPC Team Validate Error, ${tData.teamCode}  ${error.message}`);
    return;
  }
  
  //npc.sciRate  = tData.sciRate;
  
  await npc.save((err, npc) => {
    if (err) return logger.error(`New Team Save Error: ${err}`);
    teamLoadDebugger(`${npc.name} add saved to teams collection. type: ${npc.teamType}`);
  });
};

async function updNational(tData, tId){
  // Existing National Team here ... update
  
  let national = await National.findById( tId );
  if (!national) {
    teamLoadDebugger(`${tData.name} not available for National team collection update`);
    return;
  }
  national.name      = tData.name;
  national.shortName = tData.shortName;
  national.teamType  = tData.teamType;
  national.teamCode  = tData.code;
  national.prTrack   = tData.prTrack;
  national.roles     = tData.roles;
  national.prLevel   = tData.prLevel;
  national.agents    = tData.agents;
  //national.sciRate   = tData.sciRate;

  const { error } = validateNational(national); 
  if (error) {
    teamLoadDebugger(`National Team Update Validate Error ${tData.code} ${tData.name} ${error.message}`);
    return
  }
   
  await national.save((err, national) => {
  if (err) return logger.error(`National Team Update Save Error: ${err}`);
    teamLoadDebugger(`${national.name} update saved to National teams collection.`);
  });
}

async function updAlien(tData, tId){
  // Existing Alien Team here ... update
      
  let alien = await Team.findById( tId );
  if (!alien) {
    teamLoadDebugger(`${tData.name} not available for Alien team collection update`);
    return;
  }
  alien.name      = tData.name;
  alien.shortName = tData.shortName;
  alien.teamType  = tData.teamType;
  alien.teamCode  = tData.code;
  alien.roles     = tData.roles;
  alien.agents    = tData.agents;

  const { error } = validateAlien(alien); 
  if (error) {
    teamLoadDebugger(`Alien Team Update Validate Error ${tData.code} ${tData.name} ${error.message}`);
    return
  }
   
  await alien.save((err, alien) => {
  if (err) return logger.error(`Alien Team Update Save Error: ${err}`);
    teamLoadDebugger(`${alien.name} update saved to Alien teams collection.`);
  });
}


async function updMedia(tData, tId){
  // Existing Media Team here ... update
      
  let media = await Team.findById( tId );
  if (!media) {
    teamLoadDebugger(`${tData.name} not available for Media team collection update`);
    return;
  }
  media.name      = tData.name;
  media.shortName = tData.shortName;
  media.teamType  = tData.teamType;
  media.teamCode  = tData.code;
  
  const { error } = validateMedia(media); 
  if (error) {
    teamLoadDebugger(`Media Team Update Validate Error ${tData.code} ${tData.name} ${error.message}`);
    return
  }
   
  await media.save((err, media) => {
  if (err) return logger.error(`Media Team Update Save Error: ${err}`);
    teamLoadDebugger(`${media.name} update saved to Media teams collection.`);
  });
}

async function updControl(tData, tId){
  // Existing Control Team here ... update
      
  let control = await Team.findById( tId );
  if (!control) {
    teamLoadDebugger(`${tData.name} not available for Control team collection update`);
    return;
  }
  control.name      = tData.name;
  control.shortName = tData.shortName;
  control.teamType  = tData.teamType;
  control.teamCode  = tData.code;
  control.roles     = tData.roles;
 
  const { error } = validateControl(control); 
  if (error) {
    teamLoadDebugger(`Control Team Update Validate Error ${tData.code} ${tData.name} ${error.message}`);
    return
  }
   
  await control.save((err, control) => {
  if (err) return logger.error(`Control Team Update Save Error: ${err}`);
    teamLoadDebugger(`${control.name} update saved to Control teams collection.`);
  });
}

async function updNPC(tData, tId){
  // Existing NPC Team here ... update
      
  let npc = await Team.findById( tId );
  if (!npc) {
    teamLoadDebugger(`${tData.name} not available for NPC team collection update`);
    return;
  }
  npc.name      = tData.name;
  npc.shortName = tData.shortName;
  npc.teamType  = tData.teamType;
  npc.teamCode  = tData.code;
  npc.prTrack   = tData.prTrack;
  npc.roles     = tData.roles;
  npc.prLevel   = tData.prLevel;
  npc.agents    = tData.agents;
  //npc.sciRate   = tData.sciRate;

  const { error } = validateNpc(npc); 
  if (error) {
    teamLoadDebugger(`NPC Team Update Validate Error ${tData.code} ${tData.name} ${error.message}`);
    return
  }
   
  await npc.save((err, npc) => {
  if (err) return logger.error(`NPC Team Update Save Error: ${err}`);
    teamLoadDebugger(`${npc.name} update saved to NPC teams collection.`);
  });
}

module.exports = runTeamLoad;