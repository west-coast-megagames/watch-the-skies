const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initCountry.json",
  "utf8"
);
const countryDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const countryLoadDebugger = require("debug")("app:countryLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Country Model - Using Mongoose Model
const { Country, validateCountry } = require("../models/country");
const { Team } = require("../models/team/team");

const app = express();

/*
Country.watch().on('change', data => {
  countryLoadDebugger(data);
});
*/

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runCountryLoad(runFlag) {
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for await (let data of countryDataIn) {
    if (data.loadType == "country") {
      // delete old data
      //await deleteCountry(data);   will cause previously loaded country record id's to change

      ++recReadCount;
      await loadCountry(data, recCounts);
    }
  }
  logger.info(
    `Country Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadCountry(cData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    //logger.debug("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);
    //console.log("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);

    let country = await Country.findOne({ code: cData.code });

    loadName = cData.name;

    if (!country) {
      // No New Country here ... should have been loaded by refData
      logger.error(
        `${cData.code} ${cData.name} does Not Exist for countryLoad.`
      );
      ++rCounts.loadErrCount;
      return;
    } else {
      // Existing Country here ... update
      let id = country._id;

      country.coastal = cData.coastal;
      if (!cData.type) {
        country.type = "T";
      } else {
        country.type = cData.type;
      }
      let borderedBy_Ids = [];
      for (let j = 0; j < cData.borderedBy.length; ++j) {
        let borderCountry = await Country.findOne({
          code: cData.borderedBy[j].code,
        });
        if (borderCountry) {
          borderedBy_Ids.push(borderCountry._id);
        } else {
          logger.info(
            cData.borderedBy[j].code +
              " BorderedBy Country Not Found for " +
              cData.code
          );
        }
      }
      country.borderedBy = borderedBy_Ids;
      country.stats = cData.stats;
      if (!cData.formalName || cData.formalName == "") {
        country.formalName = country.name;
      } else {
        country.formalName = cData.formalName;
      }
      country.milAlliance = [];
      country.sciAlliance = [];

      if (cData.teamCode != "") {
        let team = await Team.findOne({ teamCode: cData.teamCode });
        if (!team) {
          loadError = true;
          loadErrorMsg =
            "Team Not Found for Country: " +
            cData.code +
            " Team " +
            cData.teamCode;
        } else {
          country.team = team._id;
          country.loadTeamCode = team.teamCode;
          //countryInitDebugger("Country Load Team Found, Country:", cCode, " Team: ", tCode, "Team ID:", team._id);
        }
      }

      const { error } = validateCountry(country);
      if (error) {
        countryLoadDebugger(
          "Country Update Validate Error",
          cData.code,
          cData.name,
          error.message
        );
        loadError = true;
        loadErrorMsg = `Country ${cData.code} ${cData.name} Update Validation Error:  ${error.message}`;
      }

      if (!loadError) {
        try {
          await country.save();
          ++rCounts.updCount;
          logger.debug(`${loadName} update saved to country collection.`);
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`Country Update Save Error: ${err.message}`, {
            meta: err,
          });
          return;
        }
      } else {
        logger.error(
          `Country ${loadName} Update skipped due to errors: ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch Country Error: ${err.message}`, { meta: err });
    return;
  }
}

async function deleteCountry(cData) {
  if (cData.loadFlg === "true") return; // shouldn't be here if flagged for load

  try {
    let delErrorFlag = false;
    for await (let country of Country.find({ code: cData.code })) {
      try {
        let delId = country._id;
        let countryDel = await Country.findByIdAndRemove(delId);
        if ((countryDel = null)) {
          logger.error(
            `deleteCountry: Country with the ID ${delId} was not found!`
          );
          let delErrorFlag = true;
        }
      } catch (err) {
        logger.error(`Catch deleteCountry Error 1: ${err.message}`, {
          meta: err,
        });
        let delErrorFlag = true;
      }
    }
    if (!delErrorFlag) {
      //countryLoadDebugger("All Countrys succesfully deleted for Code:", cData.code);
    } else {
      logger.error("Some Error In Countrys delete for Code:", cData.code);
    }
  } catch (err) {
    logger.error(`Catch deleteCountry Error 2: ${err.message}`, { meta: err });
  }
}

module.exports = runCountryLoad;
