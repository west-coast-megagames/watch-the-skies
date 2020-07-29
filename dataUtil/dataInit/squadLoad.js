const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initSquad.json",
  "utf8"
);
const squadDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const squadLoadDebugger = require("debug")("app:squadLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Squad Model - Using Mongoose Model
const { Squad, validateSquad } = require("../models/ops/squad");
const { Country } = require("../models/country");
const { Team } = require("../models/team/team");
const { Site } = require("../models/sites/site");
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runSquadLoad(runFlag) {
  try {
    //squadLoadDebugger("Jeff in runSquadLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllSquads(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    squadLoadDebugger("Catch runSquadLoad Error:", err.message);
    logger.error(`Catch runSquadLoad Error: ${err.message}`, { meta: err });
    return false;
  }
}

async function initLoad(doLoad) {
  //squadLoadDebugger("Jeff in initLoad", doLoad, squadDataIn.length);
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for (let data of squadDataIn) {
    ++recReadCount;
    await loadSquad(data, recCounts);
  }

  logger.info(
    `Squad Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadSquad(iData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    let squad = await Squad.findOne({ name: iData.name });

    loadName = iData.name;

    if (!squad) {
      // New Squad/Squad here
      let squad = new Squad({
        name: iData.name,
        type: iData.type,
      });
      squad.gameState = [];
      squad.serviceRecord = [];

      if (iData.team != "") {
        let team = await Team.findOne({ teamCode: iData.team });
        if (!team) {
          loadError = true;
          loadErrorMsg = `Team Not Found: ${iData.team}`;
          //squadLoadDebugger("Squad Load Team Error, New Squad:", iData.name, " Team: ", iData.team);
        } else {
          squad.team = team._id;
          //squadLoadDebugger("Squad Load Team Found, Squad:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
        }
      }

      if (iData.country != "") {
        let country = await Country.findOne({ code: iData.country });
        if (!country) {
          loadError = true;
          loadErrorMsg = `Country Not Found: ${iData.country}`;
          //squadLoadDebugger("Squad Load Country Error, New Squad:", iData.name, " Country: ", iData.country);
        } else {
          squad.country = country._id;
          squad.zone = country.zone;
          //squadLoadDebugger("Squad Load Country Found, Squad:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
        }
      }

      if (iData.site != "") {
        let site = await Site.findOne({ siteCode: iData.site });
        if (!site) {
          // not an error ... just set to homeBase
          //loadError = true;
          //loadErrorMsg = `Site Not Found: ${iData.site}`;
          //squadLoadDebugger("Squad Load Site Error, New Squad:", iData.name, " homeBase: ", iData.site);
        } else {
          squad.site = site._id;
          //squadLoadDebugger("Squad Load Site Found, Squad:", iData.name, " Site: ", iData.site, "Site ID:", site._id);
        }
      }

      if (iData.homeBase != "") {
        let site = await Site.findOne({ siteCode: iData.homeBase });
        if (!site) {
          loadError = true;
          loadErrorMsg = `homeBase Not Found: ${iData.homeBase}`;
          //squadLoadDebugger("Squad Load Home Base Error, New Squad:", iData.name, " homeBase: ", iData.homeBase);
        } else {
          squad.homeBase = site._id;
          if (!squad.site) {
            squad.site = site._id;
          }
          //squadLoadDebugger("Squad Load Home Base Found, Squad:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
        }
      }

      let { error } = validateSquad(squad);
      if (error) {
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //logger.error(`New Squad Validate Error ${squad.name} ${error.message}`);
        //return console.error(`New Squad validate Error: ${err}`);
      }

      if (loadError) {
        logger.error(
          `Squad skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let squadSave = await squad.save();

          ++rCounts.loadCount;
          logger.debug(`${squadSave.name} add saved to squad collection.`);
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`New Squad Save Error: ${err}`, { meta: err });
          return;
        }
      }
    } else {
      let id = squad._id;

      if (iData.team != "") {
        let team = await Team.findOne({ teamCode: iData.team });
        if (!team) {
          //squadLoadDebugger("Squad Load Team Error, Update Squad:", iData.name, " Team: ", iData.team);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.team;
        } else {
          squad.team = team._id;
          //squadLoadDebugger("Squad Load Team Found, Squad:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
        }
      }

      if (iData.country != "") {
        let country = await Country.findOne({ code: iData.country });
        if (!country) {
          //squadLoadDebugger("Squad Load Country Error, Update Squad:", iData.name, " Country: ", iData.country);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.country;
        } else {
          squad.country = country._id;
          squad.zone = country.zone;
          //squadLoadDebugger("Squad Load Country Found, Squad:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
        }
      }

      if (iData.homeBase != "") {
        let site = await Site.findOne({ siteCode: iData.homeBase });
        if (!site) {
          loadError = true;
          loadErrorMsg = "homeBase Not Found: " + iData.homeBase;
          //squadLoadDebugger("Squad Load Home Base Error, Update Squad:", iData.name, " homeBase: ", iData.homeBase);
        } else {
          squad.homeBase = site._id;
          //squadLoadDebugger("Squad Load Home Base Found, Squad:", iData.name, " homeBase: ", iData.homeBase, "Site ID:", site._id);
        }
      }

      let { error } = validateSquad(squad);
      if (error) {
        //squadLoadDebugger("Update Squad Validate Error", squad.name, error.message);
        //return;
        loadError = true;
        loadErrorMsg = "Squad Update Validation Error: " + error.message;
      }

      if (loadError) {
        logger.error(
          `Squad skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let squadSave = await squad.save();

          ++rCounts.updCount;
          logger.debug(`${squad.name} add saved to squad collection.`);
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`Update Squad Save Error: ${err}`, { meta: err });
          return;
        }
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch Squad Error: ${err.message}`, { meta: err });
    return;
  }
}

async function deleteAllSquads(doLoad) {
  if (!doLoad) return;

  try {
    for await (const squad of Squad.find()) {
      let id = squad._id;

      //squadLoadDebugger("Jeff in deleteAllSquads loop", squad.name);
      try {
        let squadDel = await Squad.findByIdAndRemove(id);
        if ((squadDel = null)) {
          logger.error(`The Squad with the ID ${id} was not found!`);
        }
        //squadLoadDebugger("Jeff in deleteAllSquads loop after remove", squad.name);
      } catch (err) {
        logger.error(`Squad Delete All Error: ${err.message}`, { meta: err });
      }
    }
    logger.info("All Squads succesfully deleted!");
  } catch (err) {
    logger.error(`Delete All Squads Catch Error: ${err.message}`, {
      meta: err,
    });
  }
}

module.exports = runSquadLoad;
