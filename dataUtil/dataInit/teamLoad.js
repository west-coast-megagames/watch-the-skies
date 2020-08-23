const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initTeams.json",
  "utf8"
);
const teamDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const teamLoadDebugger = require("debug")("app:teamLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Team Model - Using Mongoose Model
const {
  Team,
  validateTeam,
  National,
  validateNational,
  Alien,
  validateAlien,
  Control,
  validateControl,
  Npc,
  validateNpc,
  Media,
  validateMedia,
} = require("../models/team/team");
const { Country } = require("../models/country");

const app = express();

/*
Team.watch().on('change', data => {
  teamLoadDebugger(data);
});
*/

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runTeamLoad(runFlag) {
  try {
    if (!runFlag) return false;
    if (runFlag) await initLoad(runFlag);
    return true;
  } catch (err) {
    logger.error(`Catch runTeamLoad Error: ${err.message}`, { meta: err });
    return false;
  }
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for await (let data of teamDataIn) {
    if (data.loadType == "team") {
      // delete old data
      //await deleteTeam(data);   will cause previously loaded team record id's to change

      if (data.loadFlag == "true") {
        ++recReadCount;
        await loadTeam(data, recCounts);
      }
    }
  }

  logger.info(
    `Team Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );

  return;
}

async function loadTeam(tData, rCounts) {
  try {
    let team = await Team.findOne({ teamCode: tData.code });

    if (!team) {
      switch (tData.teamType) {
        case "N":
          await newNational(tData, rCounts);
          break;
        case "A":
          await newAlien(tData, rCounts);
          break;
        case "C":
          await newControl(tData, rCounts);
          break;
        case "P":
          await newNPC(tData, rCounts);
          break;
        case "M":
          await newMedia(tData, rCounts);
          break;
        default:
          logger.error(`Invalid Team Type In : ${tData.teamType}`);
          ++rCounts.loadErrCount;
      }
    } else {
      switch (tData.teamType) {
        case "N":
          await updNational(tData, team._id, rCounts);
          break;
        case "A":
          await updAlien(tData, team._id, rCounts);
          break;
        case "C":
          await updControl(tData, team._id, rCounts);
          break;
        case "P":
          await updNPC(tData, team._id, rCounts);
          break;
        case "M":
          await updMedia(tData, team._id, rCounts);
          break;
        default:
          logger.error(`Invalid Team Type In : ${tData.teamType}`);
          ++rCounts.loadErrCount;
      }
    }
  } catch (err) {
    logger.error(`Catch Team Error: ${err.message}`, { meta: err });
    ++rCounts.loadErrCount;
    return;
  }
}

async function deleteTeam(tData) {
  if (tData.loadFlg === "true") return; // shouldn't be here if flagged for load

  try {
    let delErrorFlag = false;
    for await (let team of Team.find({ teamCode: tData.code })) {
      try {
        let delId = team._id;
        let teamDel = await Team.findByIdAndRemove(delId);
        if ((teamDel = null)) {
          logger.error(`deleteTeam: Team with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        logger.error(`deleteTeam Error 1: ${err.message}`, { meta: err });
        let delErrorFlag = true;
      }
    }
    if (!delErrorFlag) {
      //teamLoadDebugger("All Teams succesfully deleted for Code:", tData.code);
    } else {
      logger.error("Some Error In Teams delete for Code:", tData.code);
    }
  } catch (err) {
    logger.error(`deleteTeam Error 2: ${err.message}`, { meta: err });
  }
}

async function newNational(tData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New National Team here
  let national = new National({
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType,
  });
  national.gameState = [];
  national.serviceRecord = [];
  national.trades = [];
  national.treaties = [];

  loadName = tData.name;
  let { error } = validateNational(national);
  if (error) {
    loadError = true;
    loadErrorMsg = `New National Team Validate Error, ${tData.code}  ${error.message}`;
  }

  national.prTrack = tData.prTrack;
  national.roles = tData.roles;
  national.prLevel = tData.prLevel;
  national.agents = tData.agents;

  if (tData.homeCountry != "") {
    let country = await Country.findOne({ code: tData.homeCountry });
    if (!country) {
      loadError = true;
      loadErrorMsg = `New National Team has invalid homeCountry, ${tData.code} tData.homeCountry`;
    } else {
      national.homeCountry = country._id;
      //teamLoadDebugger("Team Load Country Found, New Team:", tData.name, " Country: ", tData.homeCountry, "Country ID:", country._id);
    }
  } else {
    loadError = true;
    loadErrorMsg = `New National Team has blank homeCountry, ${tData.code}`;
  }

  if (!loadError) {
    try {
      let nationalSave = await national.save();
      ++rCounts.loadCount;
      logger.debug(
        `${nationalSave.name} add saved to teams collection. type: ${nationalSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New National Team Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `National Team skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function newAlien(tData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New Alien Team here
  let alien = new Alien({
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType,
  });
  alien.gameState = [];
  alien.serviceRecord = [];
  alien.trades = [];
  alien.treaties = [];

  loadName = tData.name;
  let { error } = validateAlien(alien);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Alien Team Validate Error, ${tData.code}  ${error.message}`;
  }

  alien.roles = tData.roles;
  alien.agents = tData.agents;

  if (!loadError) {
    try {
      let alienSave = await alien.save();
      ++rCounts.loadCount;
      logger.debug(
        `${alienSave.name} add saved to teams collection. type: ${alienSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New Alien Team Save Error: ${err.message}`, { meta: err });
      return;
    }
  } else {
    logger.error(
      `Alien Team skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function newMedia(tData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New Media Team here
  let media = new Media({
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType,
  });
  media.gameState = [];
  media.serviceRecord = [];
  media.trades = [];
  media.treaties = [];
  media.agents = tData.agents;
  loadName = tData.name;

  let { error } = validateMedia(media);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Media Team Validate Error, ${tData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let mediaSave = await media.save();
      ++rCounts.loadCount;
      logger.debug(
        `${mediaSave.name} add saved to teams collection. type: ${mediaSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New Media Team Save Error: ${err.message}`, { meta: err });
      return;
    }
  } else {
    logger.error(
      `Media Team skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function newControl(tData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New Control Team here
  let control = new Control({
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType,
  });
  control.gameState = [];
  control.serviceRecord = [];
  control.trades = [];
  control.treaties = [];

  loadName = tData.name;

  let { error } = validateControl(control);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Control Team Validate Error, ${tData.code}  ${error.message}`;
  }

  control.roles = tData.roles;

  if (!loadError) {
    try {
      let controlSave = await control.save();
      ++rCounts.loadCount;
      logger.debug(
        `${controlSave.name} add saved to teams collection. type: ${controlSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New Control Team Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Control Team skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function newNPC(tData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New NPC Team here
  let npc = new Npc({
    teamCode: tData.code,
    name: tData.name,
    shortName: tData.shortName,
    teamType: tData.teamType,
  });
  npc.gameState = [];
  npc.serviceRecord = [];
  npc.trades = [];
  npc.treaties = [];

  loadName = tData.name;

  let { error } = validateNpc(npc);
  if (error) {
    loadError = true;
    loadErrorMsg = `New NPC Team Validate Error, ${tData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let npcSave = await npc.save();
      ++rCounts.loadCount;
      logger.debug(
        `${npcSave.name} add saved to teams collection. type: ${npcSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New NPC Team Save Error: ${err.message}`, { meta: err });
      return;
    }
  } else {
    logger.error(`NPC Team skipped due to errors: ${loadName} ${loadErrorMsg}`);
    ++rCounts.loadErrCount;
    return;
  }
}

async function updNational(tData, tId, rCounts) {
  // Existing National Team here ... update
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";
  let oldHomeCountry = null;

  let national = await National.findById(tId);
  if (!national) {
    ++rCounts.loadErrCount;
    logger.error(
      `National Team ${tData.name} not available for team collection update`
    );
    return;
  }

  loadName = tData.name;
  oldHomeCountry = national.homeCountry;

  national.name = tData.name;
  national.shortName = tData.shortName;
  national.teamType = tData.teamType;
  national.teamCode = tData.code;
  national.prTrack = tData.prTrack;
  national.roles = tData.roles;
  national.prLevel = tData.prLevel;
  national.agents = tData.agents;
  //national.sciRate   = tData.sciRate;

  if (tData.homeCountry != "") {
    let country = await Country.findOne({ code: tData.homeCountry });
    if (!country) {
      loadError = true;
      loadErrorMsg = `Update National Team has invalid homeCountry, ${tData.code} tData.homeCountry`;
    } else {
      national.homeCountry = country._id;
      //teamLoadDebugger("Team Load Country Found, New Team:", tData.name, " Country: ", tData.homeCountry, "Country ID:", country._id);
    }
  } else {
    national.homeCountry = oldHomeCountry;
  }

  const { error } = validateNational(national);
  if (error) {
    loadError = true;
    loadErrorMsg = `National Team Update Validate Error, ${tData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let nationalSave = await national.save();
      ++rCounts.updCount;
      logger.debug(
        `${nationalSave.name} update saved to teams collection. type: ${nationalSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`National Team Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `National Team Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function updAlien(tData, tId, rCounts) {
  // Existing Alien Team here ... update

  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  let alien = await Team.findById(tId);
  if (!alien) {
    ++rCounts.loadErrCount;
    logger.error(
      `Alien Team ${tData.name} not available for team collection update`
    );
    return;
  }

  loadName = tData.name;

  alien.name = tData.name;
  alien.shortName = tData.shortName;
  alien.teamType = tData.teamType;
  alien.teamCode = tData.code;
  alien.roles = tData.roles;
  alien.agents = tData.agents;

  const { error } = validateAlien(alien);
  if (error) {
    loadError = true;
    loadErrorMsg = `Alien Team Update Validate Error, ${tData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let alienSave = await alien.save();
      ++rCounts.updCount;
      logger.debug(
        `${alienSave.name} update saved to teams collection. type: ${alienSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Alien Team Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Alien Team Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function updMedia(tData, tId, rCounts) {
  // Existing Media Team here ... update

  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  let media = await Team.findById(tId);
  if (!media) {
    ++rCounts.loadErrCount;
    logger.error(
      `Media Team ${tData.name} not available for team collection update`
    );
    return;
  }

  loadName = tData.name;

  media.name = tData.name;
  media.shortName = tData.shortName;
  media.teamType = tData.teamType;
  media.teamCode = tData.code;
  media.agents = tData.agents;

  const { error } = validateMedia(media);
  if (error) {
    loadError = true;
    loadErrorMsg = `Media Team Update Validate Error, ${tData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let mediaSave = await media.save();
      ++rCounts.updCount;
      logger.debug(
        `${mediaSave.name} update saved to teams collection. type: ${mediaSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Media Team Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Media Team Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function updControl(tData, tId, rCounts) {
  // Existing Control Team here ... update

  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  let control = await Team.findById(tId);
  if (!control) {
    ++rCounts.loadErrCount;
    logger.error(
      `Control Team ${tData.name} not available for team collection update`
    );
    return;
  }

  loadName = tData.name;

  control.name = tData.name;
  control.shortName = tData.shortName;
  control.teamType = tData.teamType;
  control.teamCode = tData.code;
  control.roles = tData.roles;

  const { error } = validateControl(control);
  if (error) {
    loadError = true;
    loadErrorMsg = `Control Team Update Validate Error, ${tData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let controlSave = await control.save();
      ++rCounts.updCount;
      logger.debug(
        `${controlSave.name} update saved to teams collection. type: ${controlSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Control Team Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Control Team Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function updNPC(tData, tId, rCounts) {
  // Existing NPC Team here ... update

  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  let npc = await Team.findById(tId);
  if (!npc) {
    ++rCounts.loadErrCount;
    logger.error(
      `NPC Team ${tData.name} not available for team collection update`
    );
    return;
  }

  loadName = tData.name;

  npc.name = tData.name;
  npc.shortName = tData.shortName;
  npc.teamType = tData.teamType;
  npc.teamCode = tData.code;
  npc.prTrack = tData.prTrack;
  npc.roles = tData.roles;
  npc.prLevel = tData.prLevel;
  npc.agents = tData.agents;

  const { error } = validateNpc(npc);
  if (error) {
    loadError = true;
    loadErrorMsg = `NPC Team Update Validate Error, ${tData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let npcSave = await npc.save();
      ++rCounts.updCount;
      logger.debug(
        `${npcSave.name} update saved to teams collection. type: ${npcSave.teamType}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`NPC Team Update Save Error: ${err.message}`, { meta: err });
      return;
    }
  } else {
    logger.error(
      `NPC Team Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

module.exports = runTeamLoad;
