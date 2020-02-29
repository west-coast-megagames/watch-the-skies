// Team Model - Using Mongoose Model
const { Team, validateTeam } = require('../../models/team/team');
const { National, validateNational } = require('../../models/team/national');
const { Alien, validateAlien } = require('../../models/team/alien');
const { Control, validateControl } = require('../../models/team/control');
const { Media, validateMedia } = require('../../models/team/media');
const { Npc, validateNpc } = require('../../models/team/npc');

const teamCheckDebugger = require('debug')('app:teamCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkTeam(runFlag) {
  
  for (const team of await Team.find()) { 
    
    if (team.type === "National") {
      if (team.prTrack.length < 1) {
        logger.error(`No prTrack assigned for National Team ${team.name} ${team._id}`);
      }

      if (team.roles.length < 1) {
        logger.error(`No roles assigned for National Team ${team.name} ${team._id}`);
      }

      if (isNaN(team.sciRate)) {
        logger.error(`National Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`);
      }

      if (isNaN(team.agents)) {
        logger.error(`National Team ${team.name} ${team._id} agents is not a number ${team.agents}`);
      }

      if (isNaN(team.prLevel)) {
        logger.error(`National Team ${team.name} ${team._id} prLevel is not a number ${team.prLevel}`);
      }

      let { error } = validateNational(team);
      if ( error)  {
        logger.error(`National Team Validation Error For ${team.name} Error: ${error.details[0].message}`);
      }
    }


/*
    //teamCheckDebugger(`Team ${team.name} ${team._id} Check of Gear ${team.gear.length}`);
    for (let i = 0; i < team.gear.length; ++i){
      //teamCheckDebugger(`Team ${team.name} ${team._id} about to find gear for ID ${team.gear[i]}`);
      let gFind = await Gear.findById(team.gear[i]);
      if (!gFind) {
        logger.error(`Team ${team.name} ${team._id} has an invalid gear reference ${i}: ${team.gear[i]}`);
      }
    }
*/

    let { error } = validateTeam(team);
    if ( error)  {
      logger.error(`Team Validation Error For ${team.name} Error: ${error.details[0].message}`);
    }

  }
  return true;
};

module.exports = chkTeam;