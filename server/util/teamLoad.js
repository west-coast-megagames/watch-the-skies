const fs = require('fs')
const file = fs.readFileSync('./init-json/initTeams.json', 'utf8');
const teamDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const teamLoadDebugger = require('debug')('app:teamLoad');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Team Model - Using Mongoose Model
const { Team, validateTeam } = require('../models/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function runTeamLoad(runFlag){
  if (!runFlag) return;
  if (runFlag) initLoad(runFlag);
  else return;
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
       // New Team here
       let team = new Team({ 
           teamCode: tData.code,
           name: tData.name,
           shortName: tData.shortName
        }); 


        let { error } = validateTeam(team); 
        if (error) {
          teamLoadDebugger("New Team Validate Error", team.teamCode, error.message);
          return;
        }
        
        team.prTrack  = tData.prTrack;
        team.roles    = tData.roles;
        team.prLevel  = tData.prLevel;

        //team.accounts = tData.accounts;   ... moved to it's own load

        team.save((err, team) => {
          if (err) return console.error(`New Team Save Error: ${err}`);
          teamLoadDebugger(team.name + " add saved to teams collection.");
        });
    } else {       
       // Existing Team here ... update
       let id = team._id;
      
       team.name      = tData.name;
       team.shortName = tDate.shortName;
       team.teamCode  = tData.code;
       team.prTrack   = tData.prTrack;
       team.roles     = tData.roles;
       team.prLevel   = tData.prLevel;

       //team.accounts  = tData.accounts;  ... moved to it's own load

       const { error } = validateTeam(team); 
       if (error) {
         teamLoadDebugger("Team Update Validate Error", tData.code, tData.name, tData.loadFlg, error.message);
         return
       }
   
       team.save((err, team) => {
       if (err) return console.error(`Team Update Save Error: ${err}`);
       teamLoadDebugger(team.name + " update saved to teams collection.");
       });
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

module.exports = runTeamLoad;