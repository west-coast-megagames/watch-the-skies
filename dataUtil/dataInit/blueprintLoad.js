const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initBlueprint.json",
  "utf8"
);
const blueprintDataIn = JSON.parse(file);
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const blueprintInitDebugger = require("debug")("app:blueprintInit");
const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

// Blueprint Model - Using Mongoose Model
const {
  Blueprint,
  validateBlueprint,
  FacilityBlueprint,
  validateFacilityBlueprint,
  AircraftBlueprint,
  validateAircraftBlueprint,
  SquadBlueprint,
  validateSquadBlueprint,
  UpgradeBlueprint,
  validateUpgradeBlueprint,
} = require("../models/gov/blueprint");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runBlueprintLoad(runFlag) {
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  let blueprintRecReadCount = 0;
  let blueprintRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for await (let data of blueprintDataIn) {
    if (data.loadType == "blueprint") {
      //Delete now regardless of loadFlag
      await deleteBlueprint(data.name, data.code, data.loadFlag);

      if (data.loadFlag === "true") {
        ++blueprintRecReadCount;
        await loadBlueprint(data, blueprintRecCounts);
      }
    }
  }

  logger.info(
    `Blueprint Load Counts Read: ${blueprintRecReadCount} Errors: ${blueprintRecCounts.loadErrCount} Saved: ${blueprintRecCounts.loadCount} Updated: ${blueprintRecCounts.updCount}`
  );

  return;
}

async function loadBlueprint(bpData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    if (bpData.loadFlag === "false") return; // don't load if not true

    let blueprint = await Blueprint.findOne({ code: bpData.code });

    loadName = bpData.name;

    if (!blueprint) {
      // New Blueprint here

      switch (bpData.buildModel) {
        case "facility":
          await newFaclity(bpData, rCounts);
          break;
        case "aircraft":
          await newAircraft(bpData, rCounts);
          break;
        case "squad":
          await newSquad(bpData, rCounts);
          break;
        case "upgrade":
          await newUpgrade(bpData, rCounts);
          break;

        default:
          logger.error(
            `Invalid New Blueprint BuildModel: ${bpData.buildModel}`
          );
          ++rCounts.loadErrCount;
      }
    } else {
      // Existing Blueprint here ... update
      let bpId = blueprint._id;

      switch (bpData.buildModel) {
        case "facility":
          await updFacility(bpData, bpId, rCounts);
          break;
        case "aircraft":
          await updAircraft(bpData, bpId, rCounts);
          break;
        case "squad":
          await updSquad(bpData, bpId, rCounts);
          break;
        case "upgrade":
          await updUpgrade(bpData, bpId, rCounts);
          break;

        default:
          logger.error(
            `Invalid Update Blueprint BuildModel: ${bpData.buildModel}`
          );
          ++rCounts.loadErrCount;
      }
    }
  } catch (err) {
    logger.error(`Catch Blueprint Error: ${err.message}`, { meta: err });
    ++rCounts.loadErrCount;
    return;
  }
}

async function deleteBlueprint(bpName, bpCode, bpLoadFlg) {
  try {
    let delErrorFlag = false;
    for await (let blueprint of Blueprint.find({ code: bpCode })) {
      try {
        let delId = blueprint._id;
        let blueprintDel = await Blueprint.findByIdAndRemove(delId);
        if ((blueprintDel = null)) {
          logger.error(
            `deleteBlueprint: Blueprint with the ID ${delId} was not found!`
          );
          delErrorFlag = true;
        }
      } catch (err) {
        logger.error(`Catch deleteBlueprint Error 1: ${err.message}`, {
          meta: err,
        });
        delErrorFlag = true;
      }
    }
    if (!delErrorFlag) {
      logger.debug(`All Blueprints succesfully deleted for Code: ${bpCode}`);
    } else {
      logger.error(`Some Error In Blueprints delete for Code: ${bpCode}`);
    }
  } catch (err) {
    logger.error(`Catch deleteBlueprint Error 2: ${err.message}`, {
      meta: err,
    });
  }
}

async function newAircraft(bpData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New Aircraft Blueprint here
  let bpAircraft = await new AircraftBlueprint(bpData);
  loadName = bpData.name;
  let { error } = validateAircraftBlueprint(bpAircraft);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Aircraft Bluepritn Validate Error, ${bpData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let bpAircraftSave = await bpAircraft.save();
      ++rCounts.loadCount;
      logger.debug(
        `${bpAircraftSave.name} add saved to blueprint collection. code: ${bpAircraftSave.code}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New Aircraft Blueprint Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Aircraft Blueprint skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function updAircraft(bpData, bpId, rCounts) {
  // Existing Aircraft Team here ... update
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  let aircraftBlueprint = await AircraftBlueprint.findById(bpId);
  if (!aircraftBlueprint) {
    ++rCounts.loadErrCount;
    logger.error(
      `Aircraft Blueprint ${bpData.name} not available for Aircraft Blueprint collection update`
    );
    return;
  }

  loadName = bpData.name;
  aircraftBlueprint = bpData;

  const { error } = validateAircraftBlueprint(aircraftBlueprint);
  if (error) {
    loadError = true;
    loadErrorMsg = `Aircraft Blueprint Update Validate Error, ${bpData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let aircraftBlueprintSave = await aircraftBlueprint.save();
      ++rCounts.updCount;
      logger.debug(
        `${aircraftBlueprintSave.name} update saved to Blueprint collection Aircraft Buildtype`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Aircraft Blueprint Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Aircraft Blueprint Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function newFaclity(bpData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New Facility Blueprint here
  let bpFacility = await new FacilityBlueprint(bpData);
  loadName = bpData.name;
  let { error } = validateFacilityBlueprint(bpFacility);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Facility Bluepritn Validate Error, ${bpData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let bpFacilitySave = await bpFacility.save();
      ++rCounts.loadCount;
      logger.debug(
        `${bpFacilitySave.name} add saved to blueprint collection. code: ${bpFacilitySave.code}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New Facility Blueprint Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Facility Blueprint skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function updFacility(bpData, bpId, rCounts) {
  // Existing Facility Team here ... update
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  let facilityBlueprint = await FacilityBlueprint.findById(bpId);
  if (!facilityBlueprint) {
    ++rCounts.loadErrCount;
    logger.error(
      `Facility Blueprint ${bpData.name} not available for Facility Blueprint collection update`
    );
    return;
  }

  loadName = bpData.name;

  facilityBlueprint = bpData;

  const { error } = validateFacilityBlueprint(facilityBlueprint);
  if (error) {
    loadError = true;
    loadErrorMsg = `Facility Blueprint Update Validate Error, ${bpData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let facilityBlueprintSave = await facilityBlueprint.save();
      ++rCounts.updCount;
      logger.debug(
        `${facilityBlueprintSave.name} update saved to Blueprint collection Facility Buildtype`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Facility Blueprint Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Facility Blueprint Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function newUpgrade(bpData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  // New Upgrade Blueprint here
  let bpUpgrade = await new UpgradeBlueprint(bpData);
  loadName = bpData.name;
  let { error } = validateUpgradeBlueprint(bpUpgrade);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Upgrade Bluepritn Validate Error, ${bpData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let bpUpgradeSave = await bpUpgrade.save();
      ++rCounts.loadCount;
      logger.debug(
        `${bpUpgradeSave.name} add saved to blueprint collection. code: ${bpUpgradeSave.code}`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`New Upgrade Blueprint Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Upgrade Blueprint skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

async function updUpgrade(bpData, bpId, rCounts) {
  // Existing Upgrade Team here ... update
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  let facilityBlueprint = await UpgradeBlueprint.findById(bpId);
  if (!facilityBlueprint) {
    ++rCounts.loadErrCount;
    logger.error(
      `Upgrade Blueprint ${bpData.name} not available for Upgrade Blueprint collection update`
    );
    return;
  }

  loadName = bpData.name;

  facilityBlueprint = bpData;

  const { error } = validateUpgradeBlueprint(facilityBlueprint);
  if (error) {
    loadError = true;
    loadErrorMsg = `Upgrade Blueprint Update Validate Error, ${bpData.code}  ${error.message}`;
  }

  if (!loadError) {
    try {
      let facilityBlueprintSave = await facilityBlueprint.save();
      ++rCounts.updCount;
      logger.debug(
        `${facilityBlueprintSave.name} update saved to Blueprint collection Upgrade Buildtype`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Upgrade Blueprint Update Save Error: ${err.message}`, {
        meta: err,
      });
      return;
    }
  } else {
    logger.error(
      `Upgrade Blueprint Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    ++rCounts.loadErrCount;
    return;
  }
}

module.exports = runBlueprintLoad;
