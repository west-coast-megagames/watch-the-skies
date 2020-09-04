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
const {
  Country,
  validateCountry,
  GroundCountry,
  validateGroundCountry,
  SpaceCountry,
  validateSpaceCountry,
} = require("../models/country");
const { Team } = require("../models/team/team");
const { Zone } = require("../models/zone");

const app = express();

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
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0, skipCount: 0 };

  for await (let data of countryDataIn) {
    if (data.loadType === "country") {
      // delete old data
      await deleteCountry(data);

      ++recReadCount;
      await loadCountry(data, recCounts);
    }
  }
  logger.info(
    `Country Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Skipped: ${recCounts.skipCount}
                         Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );

  //cannot set borderedBy until all country records are loaded to get the ID
  let brecReadCount = 0;
  let brecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0, skipCount: 0 };
  for await (let bData of countryDataIn) {
    /*
    logger.debug(
      `jeff in 2nd loop ... country code ${bData.code} ... borderedBy ${bData.borderedBy}`);
    */
    ++brecReadCount;
    await setBorderedBy(bData, brecCounts);
  }
  logger.info(
    `Country Load BorderedBy Counts Read: ${brecReadCount} Errors: ${brecCounts.loadErrCount} Skipped: ${brecCounts.skipCount}
                         Saved: ${brecCounts.loadCount} Updated: ${brecCounts.updCount}`
  );
}

async function loadCountry(cData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    //logger.debug("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);
    //console.log("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);

    if (cData.loadFlag === "false") {
      ++rCounts.skipCount;
      logger.info(
        `Country Skipped due to loadFlag false ${cData.code} ${cData.name}`
      );
      return; // don't load if flag is not true
    }

    let country = await Country.findOne({ code: cData.code });

    loadName = cData.name;

    if (!country) {
      // New Country here
      switch (cData.type) {
        case "Ground":
          await newGround(cData, rCounts);
          break;

        case "Space":
          await newSpace(cData, rCounts);
          break;

        default:
          logger.error(
            `Country save skipped due to invalid type: ${loadName} ${cData.type}`
          );
          ++rCounts.loadErrCount;
          break;
      }

      return;
    } else {
      // Existing Country here ... update
      let id = country._id;

      country.coastal = cData.coastal;
      if (!cData.type) {
        country.type = "Ground";
      } else {
        country.type = cData.type;
      }

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
          /* team record may not exist yet ... will set in countryTeamSet.js
          loadError = true;
          loadErrorMsg =
            "Team Not Found for Country: " +
            cData.code +
            " Team " +
            cData.teamCode;
          */
          country.loadTeamCode = cData.teamCode;
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
          //logger.debug(`${loadName} update saved to country collection.`);
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
  if (cData.loadFlag === "true") return; // shouldn't be here if flagged for load

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

async function newGround(cData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = cData.name;

  let country = new GroundCountry({
    code: cData.code,
    name: cData.name,
    unrest: cData.unrest,
    loadTeamCode: cData.teamCode,
    loadZoneCode: cData.zone,
    coastal: cData.coastal,
    formalName: cData.formalName,
    stats: cData.stats,
  });
  country.gameState = [];
  country.serviceRecord = [];
  if (cData.formalName == "") {
    country.formalName = country.name;
  }

  let zone = await Zone.findOne({ code: cData.zone });
  if (!zone) {
    loadError = true;
    loadErrorMsg =
      "Zone Not Found for Ground Country: " +
      cData.code +
      " Zone " +
      cData.zone;
  } else {
    if (zone.type === "Ground") {
      country.zone = zone._id;
    } else {
      loadError = true;
      loadErrorMsg =
        "Zone Type Mis-match For Ground Country: " +
        cData.code +
        " Zone " +
        cData.zone;
    }
  }

  cCode = cData.code;
  tCode = cData.teamCode;
  if (tCode != "") {
    let team = await Team.findOne({ teamCode: tCode });
    if (!team) {
      /* team may not exist yet ... will set in countryTeamSet.js
      loadError = true;
      loadErrorMsg =
        "Team Not Found for Ground Country: " + cCode + " Team " + tCode;
      */
      country.loadTeamCode = tCode;
    } else {
      country.team = team._id;
      //countryInitDebugger("Country Load Team Found, Country:", cCode, " Team: ", tCode, "Team ID:", team._id);
    }
  }

  let { error } = validateGroundCountry(country);
  if (error) {
    loadError = true;
    loadErrorMsg =
      "Ground Country: " + cCode + " Validate Error " + error.message;
  }

  if (!loadError) {
    try {
      let countrySave = await country.save();
      ++rCounts.loadCount;
      //logger.debug(`$Ground Country ${loadName} saved to country collection.`);

      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Ground Country Save Error: ${err.message}`, { meta: err });
      return;
    }
  } else {
    logger.error(
      `Ground Country skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function newSpace(cData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = cData.name;

  let country = new SpaceCountry({
    code: cData.code,
    name: cData.name,
    unrest: cData.unrest,
    loadTeamCode: cData.teamCode,
    loadZoneCode: cData.zone,
    formalName: cData.formalName,
    stats: cData.stats,
  });
  country.gameState = [];
  country.serviceRecord = [];

  let zone = await Zone.findOne({ code: cData.zone });
  if (!zone) {
    loadError = true;
    loadErrorMsg =
      "Zone Not Found for Space Country: " + cData.code + " Zone " + cData.zone;
  } else {
    if (zone.type === "Space") {
      country.zone = zone._id;
    } else {
      loadError = true;
      loadErrorMsg =
        "Zone Type Mis-match For Space Country: " +
        cData.code +
        " Zone " +
        cData.zone;
    }
  }

  cCode = cData.code;
  tCode = cData.teamCode;
  if (tCode != "") {
    let team = await Team.findOne({ teamCode: tCode });
    if (!team) {
      /* team may not exist yet ... will set in countryTeamSet.js
      loadError = true;
      loadErrorMsg =
        "Team Not Found for Space Country: " + cCode + " Team " + tCode;
      */
      country.loadTeamCode = tCode;
    } else {
      country.team = team._id;
      //countryInitDebugger("Space Country Load Team Found, Country:", cCode, " Team: ", tCode, "Team ID:", team._id);
    }
  }

  let { error } = validateSpaceCountry(country);
  if (error) {
    loadError = true;
    loadErrorMsg =
      "Space Country: " + cCode + " Validate Error " + error.message;
  }

  if (!loadError) {
    try {
      let countrySave = await country.save();
      ++rCounts.loadCount;
      //logger.debug(`Space Country ${loadName} saved to country collection.`);

      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Space Country Save Error: ${err.message}`, { meta: err });
      return;
    }
  } else {
    logger.error(
      `Space Country skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function setBorderedBy(cData, rCounts) {
  // don't load if flag is not true
  if (cData.loadFlag === "false") return;

  let loadName = "";

  /*
  logger.debug(
    `jeff 1 in setBorderedBy ... country code ${cData.code} ... borderedBy ${cData.borderedBy}`
  );
  */

  try {
    let country = await Country.findOne({ code: cData.code });

    loadName = cData.name;

    if (!country) {
      ++rCounts.skipCount;
      logger.info(`Country Skipped not found ${cData.code}`);
      return;
    }

    if (country.type === "Space") {
      logger.info(`Space Country Skipped in borderedBy set ${country.code}`);
      ++rCounts.skipCount;
      return;
    }

    let borderedBy_Ids = [];
    for (let j = 0; j < cData.borderedBy.length; ++j) {
      /*
      logger.debug(
        `jeff 2 in setBorderedBy ... country code ${cData.code} ... j ${j} borderedBy ${cData.borderedBy[j].code}`
      );
      */
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
    /*
    logger.debug(
      `jeff 3 in setBorderedBy ... country code ${cData.code} ... length in borderedBy ${cData.borderedBy.length} ... 
      length of _Ids ${borderedBy_Ids.length}  ... length of record ${country.borderedBy.length}`
    ); 
    */
    try {
      await country.save();
      ++rCounts.updCount;
      //logger.debug(`${loadName} update saved to country collection.`);
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Country Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch setBorderedBy Error 1: ${err.message}`, {
      meta: err,
    });
  }
}

module.exports = runCountryLoad;
