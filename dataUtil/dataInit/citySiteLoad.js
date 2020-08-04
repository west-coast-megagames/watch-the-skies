const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initCitySite.json",
  "utf8"
);
const cityDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const citySiteLoadDebugger = require("debug")("app:citySiteLoad");
const { convertToDms } = require("../systems/geo");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// City Model - Using Mongoose Model
const { CitySite, validateCity } = require("../models/sites/site");
const { Country } = require("../models/country");
const { Team } = require("../models/team/team");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runcitySiteLoad(runFlag) {
  try {
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllCitys(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    logger.error(`Catch runcitySiteLoad Error: ${err.message}`, { meta: err });

    return false;
  }
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for (let data of cityDataIn) {
    ++recReadCount;
    await loadCity(data, recCounts);
  }

  logger.info(
    `City Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadCity(iData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";
  let loadCode = "";
  try {
    let citySite = await CitySite.findOne({ siteCode: iData.code });

    loadName = iData.name;
    loadCode = iData.code;

    if (!citySite) {
      // New City here
      let newLatDMS = convertToDms(iData.latDecimal, false);
      let newLongDMS = convertToDms(iData.longDecimal, true);
      let citySite = new CitySite({
        name: iData.name,
        siteCode: iData.code,
        geoDMS: {
          latDMS: newLatDMS,
          longDMS: newLongDMS,
        },
        geoDecimal: {
          latDecimal: iData.latDecimal,
          longDecimal: iData.longDecimal,
        },
        dateline: iData.dateline,
        coastal: iData.coastal,
      });
      citySite.serviceRecord = [];
      citySite.gameState = [];

      let { error } = validateCity(citySite);
      if (error) {
        //citySiteLoadDebugger("New CitySite Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return;
      }

      if (iData.countryCode != "") {
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //citySiteLoadDebugger("CitySite Load Country Error, New City:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.countryCode;
        } else {
          citySite.country = country._id;
          citySite.zone = country.zone;
          logger.debug(
            `CitySite Load Country Found, New City: ${iData.name} Country: ${iData.countryCode} Country ID: ${country._id}`
          );
        }
      }

      if (iData.teamCode != "") {
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //citySiteLoadDebugger("CitySite Load Team Error, New City:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          citySite.team = team._id;
          //citySiteLoadDebugger("CitySite Load Update Team Found, City:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }
      if (loadError) {
        ++rCounts.loadErrCount;
        logger.error(
          `City Site skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
        );
        return;
      } else {
        try {
          let citySiteSave = await citySite.save();
          ++rCounts.loadCount;
          //citySiteLoadDebugger(citySiteSave.name + " add saved to citySite collection.");
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(
            `New CitySite Save Error: ${loadCode} ${loadName} ${err.message}`,
            { meta: err }
          );
          return;
        }
      }
    } else {
      // Existing City here ... update
      let id = citySite._id;

      let newLatDMS = convertToDms(iData.latDecimal, false);
      let newLongDMS = convertToDms(iData.longDecimal, true);
      citySite.name = iData.name;
      citySite.siteCode = iData.code;
      citySite.geoDMS.latDMS = newLatDMS;
      citySite.geoDMS.longDMS = newLongDMS;
      citySite.geoDecimal.latDecimal = iData.latDecimal;
      citySite.geoDecimal.longDecimal = iData.longDecimal;
      citySite.dateline = iData.dateline;
      citySite.coastal = iData.coastal;

      if (iData.teamCode != "") {
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //citySiteLoadDebugger("CitySite Load Team Error, Update City:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team not found: " + iData.teamCode;
        } else {
          citySite.team = team._id;
          //citySiteLoadDebugger("CitySite Load Update Team Found, City:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }

      if (iData.countryCode != "") {
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //citySiteLoadDebugger("CitySite Load Country Error, Update City:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country not found: " + iData.countryCode;
        } else {
          citySite.country = country._id;
          citySite.zone = country.zone;
          logger.debug(
            `CitySite Load Country Found, Update City: ${iData.name} Country: ${iData.countryCode} Country ID: ${country._id}`
          );
        }
      }

      const { error } = validateCity(citySite);
      if (error) {
        //citySiteLoadDebugger("CitySite Update Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return
      }

      if (loadError) {
        ++rCounts.loadErrCount;
        logger.error(
          `City Site skipped due to errors: ${loadCode} ${loadName} ${cittySite.sitecode} ${citySite.name}`
        );
        return;
      } else {
        try {
          let citySiteSave = await citySite.save();
          ++rCounts.updCount;
          logger.debug(`${citySiteSave.name} update saved to city collection.`);
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(
            `New CitySite Save Error: ${loadCode} ${loadName} ${err.message}`,
            { meta: err }
          );

          return;
        }
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch City Error: ${err.message}`, { meta: err });

    return;
  }
}

async function deleteAllCitys(doLoad) {
  if (!doLoad) return;

  try {
    for await (const citySite of CitySite.find()) {
      let id = citySite._id;
      try {
        let cityDel = await CitySite.findByIdAndRemove(id);
        if ((cityDel = null)) {
          citySiteLoadDebugger(`The CitySite with the ID ${id} was not found!`);
        }
      } catch (err) {
        citySiteLoadDebugger("CitySite Delete All Error:", err.message);
      }
    }
    citySiteLoadDebugger("All CitySites succesfully deleted!");
  } catch (err) {
    citySiteLoadDebugger(`Delete All CitySites Catch Error: ${err.message}`);
    logger.error(`Delete All CitySites Catch Error: ${err.message}`, {
      meta: err,
    });
  }
}

module.exports = runcitySiteLoad;
