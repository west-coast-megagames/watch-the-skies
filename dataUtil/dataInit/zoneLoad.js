const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initZone.json",
  "utf8"
);
const zoneDataIn = JSON.parse(file);
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const zoneInitDebugger = require("debug")("app:zoneInit");
const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Zone Model - Using Mongoose Model
const {
  Zone,
  validateZone,
  GroundZone,
  validateGroundZone,
  SpaceZone,
  validateSpaceZone,
} = require("../models/zone");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runZoneLoad(runFlag) {
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  let zoneRecReadCount = 0;
  let zoneRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for await (let data of zoneDataIn) {
    //for (let i = 0; i < refDataIn.length; ++i ) {

    if (data.loadType == "zone") {
      //Delete now regardless of loadFlag
      await deleteZone(data.name, data.code, data.loadFlag);

      if (data.loadFlag === "true") {
        ++zoneRecReadCount;
        await loadZone(
          data.name,
          data.code,
          data.loadFlag,
          data.terror,
          data.type,
          zoneRecCounts
        );
      }
    }
  }

  logger.info(
    `Zone Load Counts Read: ${zoneRecReadCount} Errors: ${zoneRecCounts.loadErrCount} Saved: ${zoneRecCounts.loadCount} Updated: ${zoneRecCounts.updCount}`
  );

  return;
}

async function loadZone(zName, zCode, zLoadFlg, zTerror, zType, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    randomTerror = Math.floor(Math.random() * 251);
    let zone = await Zone.findOne({ code: zCode });

    loadName = zName;

    if (!zone) {
      // New Zone here
      if (zLoadFlg === "false") return; // don't load if not true

      if (zType === "Space") {
        let zone = new SpaceZone({
          code: zCode,
          name: zName,
        });

        zone.serviceRecord = [];
        zone.gameState = [];
        let { error } = validateSpaceZone(zone);
        if (error) {
          loadError = true;
          loadErrorMsg = `New Space Zone Validate Error: ${zone.code} ${error.message}`;
        }

        if (!loadError) {
          try {
            let zoneSave = await zone.save();
            ++rCounts.loadCount;
            logger.debug(`${zoneSave.name} add saved to zones collection.`);
            return;
          } catch (err) {
            ++rCounts.loadErrCount;
            logger.error(`New Zone Save Error: ${err.message}`, { meta: err });
            return;
          }
        } else {
          logger.error(
            `Zone skipped due to errors: ${loadName} ${loadErrorMsg}`
          );
          ++rCounts.loadErrCount;
          return;
        }
      } else {
        let zone = new GroundZone({
          code: zCode,
          name: zName,
          terror: randomTerror, //zTerror
        });
        zone.serviceRecord = [];
        zone.gameState = [];
        let { error } = validateGroundZone(zone);
        if (error) {
          loadError = true;
          loadErrorMsg = `New Ground Zone Validate Error: ${zone.code} ${error.message}`;
        }

        if (!loadError) {
          try {
            let zoneSave = await zone.save();
            ++rCounts.loadCount;
            logger.debug(`${zoneSave.name} add saved to zones collection.`);
            return;
          } catch (err) {
            ++rCounts.loadErrCount;
            logger.error(`New Zone Save Error: ${err.message}`, { meta: err });
            return;
          }
        } else {
          logger.error(
            `Zone skipped due to errors: ${loadName} ${loadErrorMsg}`
          );
          ++rCounts.loadErrCount;
          return;
        }
      }
    } else {
      // Existing Zone here ... update
      let id = zone._id;

      zone.name = zName;
      zone.code = zCode;
      if (zone.type === "Space") {
        const { error } = validateSpaceZone(zone);
        if (error) {
          loadError = true;
          loadErrorMsg = `Zone Update Validate Error: ${zCode} ${zName} ${error.message}`;
        }
      } else {
        zone.terror = randomTerror; //zTerror;
        const { error } = validateGroundZone(zone);
        if (error) {
          loadError = true;
          loadErrorMsg = `Zone Update Validate Error: ${zCode} ${zName} ${error.message}`;
        }
      }

      const { error } = validateZone(zone);
      if (error) {
        loadError = true;
        loadErrorMsg = `Zone Update Validate Error: ${zCode} ${zName} ${error.message}`;
      }

      if (!loadError) {
        try {
          let zoneSave = await zone.save();
          ++rCounts.updCount;
          logger.debug(`${zoneSave.name} update saved to zones collection.`);
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`Zone Update Save Error: ${err.message}`, { meta: err });
          return;
        }
      } else {
        logger.error(
          `Zone update skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      }
    }
  } catch (err) {
    logger.error(`Catch Zone Error: ${err.message}`, { meta: err });
    ++rCounts.loadErrCount;
    return;
  }
}

async function deleteZone(zName, zCode, zLoadFlg) {
  try {
    let delErrorFlag = false;
    for await (let zone of Zone.find({ code: zCode })) {
      try {
        let delId = zone._id;
        let zoneDel = await Zone.findByIdAndRemove(delId);
        if ((zoneDel = null)) {
          logger.error(`deleteZone: Zone with the ID ${delId} was not found!`);
          delErrorFlag = true;
        }
      } catch (err) {
        logger.error(`Catch deleteZone Error 1: ${err.message}`, { meta: err });
        delErrorFlag = true;
      }
    }
    if (!delErrorFlag) {
      logger.debug(`All Zones succesfully deleted for Code: ${zCode}`);
    } else {
      logger.error(`Some Error In Zones delete for Code: ${zCode}`);
    }
  } catch (err) {
    logger.error(`Catch deleteZone Error 2: ${err.message}`, { meta: err });
  }
}

module.exports = runZoneLoad;
