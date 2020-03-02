// Team Model - Using Mongoose Model
//const { Team, validateTeam } = require('../../models/team/team');
const { Team, validateTeam, National, validateNational, Alien, validateAlien, Control, validateControl, Npc, validateNpc, Media, validateMedia } = require('../../models/team/team');

const { Account } = require('../../models/gov/account');

const teamCheckDebugger = require('debug')('app:teamCheck');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

async function chkTeam(runFlag) {
  
  // get accounts once
  let aFinds = await Account.find();   

  for (const team of await Team.find()
                               .populate("homeCountry", "name")) { 
  
    //should be 6 accounts for each team
    let accountCount = 0;
    let teamId = team._id.toHexString();
    accountLoop:
    for (let j = 0; j < aFinds.length; ++j){
      let aTeamId = aFinds[j].team.toHexString();
      if (aTeamId === teamId) {
        ++accountCount;
      }
    }

    //teamCheckDebugger("jeff 1 ... accountCount", accountCount, team.teamCode);
    if (accountCount != 6){
      logger.error(`Not 6 Accounts for team ${team.code} ${team.name}`);
    }
  
    if (team.type === "National") {

      //should have homeCountry link
      if (!team.populated("homeCountry")) {  
        logger.error(`homeCountry link missing for Team ${team.name} ${team._id}`);
      }

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

    if (team.type === "Alien") {

      if (team.roles.length < 1) {
        logger.error(`No roles assigned for Alien Team ${team.name} ${team._id}`);
      }

      if (isNaN(team.sciRate)) {
        logger.error(`Alien Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`);
      }

      if (isNaN(team.actionPts)) {
        logger.error(`Alien Team ${team.name} ${team._id} actionPts is not a number ${team.agents}`);
      }

      let { error } = validateAlien(team);
      if ( error)  {
        logger.error(`Alien Team Validation Error For ${team.name} Error: ${error.details[0].message}`);
      }
    }

    if (team.type === "Control") {

      if (team.roles.length < 1) {
        logger.error(`No roles assigned for Control Team ${team.name} ${team._id}`);
      }

      if (isNaN(team.sciRate)) {
        logger.error(`Control Team ${team.name} ${team._id} sciRate is not a number ${team.sciRate}`);
      }

      let { error } = validateControl(team);
      if ( error)  {
        logger.error(`Control Team Validation Error For ${team.name} Error: ${error.details[0].message}`);
      }
    }

    if (team.type === "Media") {

      /*
      if (!team.roles) {
        logger.error(`No roles defined for Media Team ${team.name} ${team._id}`);
      } else if (team.roles.length < 1) {
        logger.error(`No roles assigned for Media Team ${team.name} ${team._id}`);
      }
      */

      let { error } = validateMedia(team);
      if ( error)  {
        logger.error(`Media Team Validation Error For ${team.name} Error: ${error.details[0].message}`);
      }
    }

    if (team.type === "Npc") {
      /*
      if (team.roles.length < 1) {
        logger.error(`No roles assigned for Media Team ${team.name} ${team._id}`);
      }
      */

      let { error } = validateNpc(team);
      if ( error)  {
        logger.error(`NPC Team Validation Error For ${team.name} Error: ${error.details[0].message}`);
      }
    }

    let { error } = validateTeam(team);
    if ( error)  {
      logger.error(`Team Validation Error For ${team.name} Error: ${error.details[0].message}`);
    }

  }
  return true;
};

module.exports = chkTeam;