const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initBaseFacility.json",
  "utf8"
);
const baseDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const facilityLoadDebugger = require("debug")("app:baseLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");
const { convertToDms } = require("../systems/geo");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

// Base Facility Model - Using Mongoose Model
const {
  Facility,
  validateFacility,
} = require("../models/gov/facility/facility");
const { Country } = require("../models/country");
const { Team } = require("../models/team/team");
const { Site } = require("../models/sites/site");
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runfacilityLoad(runFlag) {
  try {
    //facilityLoadDebugger("Jeff in runfacilityLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllBases(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    logger.error(`Catch runfacilityLoad Error: ${err.message}`, {
      meta: err,
    });

    return false;
  }
}

async function initLoad(doLoad) {
  if (!doLoad) return;
  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for (let data of baseDataIn) {
    ++recReadCount;

    await loadBase(data, recCounts);
  }

  logger.info(
    `facility Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadBase(iData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";
  let loadCode = "";

  try {
    let facility = await Facility.findOne({ code: iData.code });

    loadName = iData.name;
    loadCode = iData.code;

    if (!facility) {
      // New Base here
      let facility = new Facility({
        name: iData.name,
        code: iData.code,
        siteCode: iData.siteCode,
        coastal: iData.coastal,
        type: iData.type,
      });

      facility.serviceRecord = [];
      facility.gameState = [];

      let { error } = validateFacility(facility);
      if (error) {
        //facilityLoadDebugger("New Facility Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return;
      }
      facility.baseDefenses = iData.baseDefenses;
      facility.public = iData.public;

      if (iData.teamCode != "") {
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //facilityLoadDebugger("Facility Load Team Error, New Base:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          facility.team = team._id;
          //facilityLoadDebugger("Facility Load Team Found, Base:", iData.name, " Team: ", iData.countryCode, "Team ID:", team._id);
        }
      }

      if (iData.countryCode != "") {
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //facilityLoadDebugger("Facility Load Country Error, New Base:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.countryCode;
        } else {
          facility.country = country._id;
          facility.zone = country.zone;
          //facilityLoadDebugger("Facility Load Country Found, New Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }
      }

      if (iData.siteCode != "") {
        let site = await Site.findOne({ siteCode: iData.siteCode });
        if (!site) {
          //facilityLoadDebugger("Spacecraft Load Site Error, New Spacecraft:", iData.name, " Site: ", iData.siteCode);
          loadError = true;
          loadErrorMsg = "Site Not Found: " + iData.siteCode;
        } else {
          facility.site = site._id;
          facility.zone = site.zone;
          //facilityLoadDebugger("Spacecraft Load Site Found, New Spacecraft:", iData.name, " Site: ", iData.siteCode, "Site ID:", site._id);
        }
      }

      facility.capability = {};
      facility.capability = iData.capability;
      if (loadError) {
        logger.error(
          `Base skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let facilitySave = await facility.save();
          ++rCounts.loadCount;
          facilityLoadDebugger(
            `${facilitySave.name} add saved to facility collection.`
          );
          return;
        } catch (err) {
          logger.error(`New Facility Save Error: ${err.message}`, {
            meta: err,
          });

          ++rCounts.loadErrCount;
          return;
        }
      }
    } else {
      // Existing Base here ... update
      let id = facility._id;

      facility.name = iData.name;
      facility.code = iData.code;
      facility.siteCode = iData.siteCode;
      facility.baseDefenses = iData.baseDefenses;
      facility.public = iData.public;
      facility.coastal = iData.coastal;
      facility.type = iData.type;

      if (iData.teamCode != "") {
        let team = await Team.findOne({ teamCode: iData.teamCode });
        if (!team) {
          //facilityLoadDebugger("Facility Load Team Error, Update Base:", iData.name, " Team: ", iData.teamCode);
          loadError = true;
          loadErrorMsg = "Team Not Found: " + iData.teamCode;
        } else {
          facility.team = team._id;
          //facilityLoadDebugger("Facility Load Update Team Found, Base:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
        }
      }

      if (iData.countryCode != "") {
        let country = await Country.findOne({ code: iData.countryCode });
        if (!country) {
          //facilityLoadDebugger("Facility Load Country Error, Update Base:", iData.name, " Country: ", iData.countryCode);
          loadError = true;
          loadErrorMsg = "Country Not Found: " + iData.countryCode;
        } else {
          facility.country = country._id;
          facility.zone = country.zone;
          //facilityLoadDebugger("Facility Load Country Found, Update Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
        }
      }

      if (iData.siteCode != "") {
        let site = await Site.findOne({ siteCode: iData.siteCode });
        if (!site) {
          //facilityLoadDebugger("Spacecraft Load Site Error, New Spacecraft:", iData.name, " Site: ", iData.siteCode);
          loadError = true;
          loadErrorMsg = "Site Not Found: " + iData.siteCode;
        } else {
          facility.site = site._id;
          facility.zone = site.zone;
          //facilityLoadDebugger("Spacecraft Load Site Found, New Spacecraft:", iData.name, " Site: ", iData.siteCode, "Site ID:", site._id);
        }
      }

      const { error } = validateFacility(facility);
      if (error) {
        //facilityLoadDebugger("Facility Update Validate Error", iData.name, error.message);
        loadError = true;
        loadErrorMsg = "Validation Error: " + error.message;
        //return
      }

      facility.capability = {};

      if (loadError) {
        logger.error(
          `Base Site skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let facilitySave = await facility.save();
          ++rCounts.updCount;
          facilityLoadDebugger(
            `${facilitySave.name} update saved to facility collection.`
          );
          return;
        } catch (err) {
          logger.error(`Update Facility Save Error: ${err.message}`, {
            meta: err,
          });
          ++rCounts.loadErrCount;
          return;
        }
      }
    }
  } catch (err) {
    logger.error(`Catch Base Error: ${err.message}`, { meta: err });

    ++rCounts.loadErrCount;
    return;
  }
}

async function deleteAllBases(doLoad) {
  //facilityLoadDebugger("Jeff in deleteAllFacilitys", doLoad);
  if (!doLoad) return;

  try {
    for await (const facility of Facility.find()) {
      let id = facility._id;
      try {
        let baseDel = await Facility.findByIdAndRemove(id);
        if ((baseDel = null)) {
          facilityLoadDebugger(`The Facility with the ID ${id} was not found!`);
        }
      } catch (err) {
        facilityLoadDebugger("Facility Delete All Error:", err.message);
        logger.error(`Facility Delete All Catch Error: ${err.message}`, {
          meta: err,
        });
      }
    }
    facilityLoadDebugger("All Facilitys succesfully deleted!");
  } catch (err) {
    facilityLoadDebugger(`Delete All Facilitys Catch Error: ${err.message}`);
    logger.error(`Catch Delete All Error: ${err.message}`, { meta: err });
  }
}

module.exports = runfacilityLoad;
