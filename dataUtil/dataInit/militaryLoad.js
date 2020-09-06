const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initMilitary.json",
  "utf8"
);
const militaryDataIn = JSON.parse(file);
const { delGear } = require("../wts/util/construction/deleteGear");
//const mongoose = require('mongoose');
const militaryLoadDebugger = require("debug")("app:militaryLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Military Model - Using Mongoose Model
const {
  Military,
  validateMilitary,
  Fleet,
  Corps,
} = require("../models/ops/military/military");
const { Zone } = require("../models/zone");
const { Country } = require("../models/country");
const { Team } = require("../models/team/team");
const { Upgrade } = require("../models/gov/upgrade/upgrade");
const {
  loadMilGears,
  gears,
  validUnitType,
} = require("../wts/construction/upgrade/milGear");
const { Site } = require("../models/sites/site");
const { Facility } = require("../models/gov/facility/facility");
const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runMilitaryLoad(runFlag) {
  try {
    //militaryLoadDebugger("Jeff in runMilitaryLoad", runFlag);
    if (!runFlag) return false;
    if (runFlag) {
      await loadMilGears(); // load wts/json/upgrade/milGear.json data into array

      await deleteAllMilitarys(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    militaryLoadDebugger("Catch runMilitaryLoad Error:", err.message);
    logger.error(`Catch runMilitaryLoad Error: ${err.message}`, { meta: err });
    return false;
  }
}

async function initLoad(doLoad) {
  //militaryLoadDebugger("Jeff in initLoad", doLoad, militaryDataIn.length);
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for (let data of militaryDataIn) {
    ++recReadCount;
    await loadMilitary(data, recCounts);
  }

  logger.info(
    `Military Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

async function loadMilitary(iData, rCounts) {
  try {
    let military = await Military.findOne({ name: iData.name });
    if (!military) {
      //logger.info("Jeff 0a in loadMilitary %O", iData.name, iData.type);
      switch (iData.type) {
        case "Fleet":
          await createFleet(iData, rCounts);
          break;

        case "Corps":
          await createCorps(iData, rCounts);
          break;

        default:
          ++rCounts.loadErrCount;
          logger.error(
            "Invalid Military Load Type:",
            iData.type,
            "name: ",
            iData.name
          );
      }
    } else {
      // Existing Military here ... update
      //logger.info("Jeff 0b in loadMilitary %O", iData.name, iData.type);
      switch (iData.type) {
        case "Fleet":
          await updateFleet(iData, rCounts);
          break;

        case "Corps":
          await updateCorps(iData, rCounts);
          break;

        default:
          ++rCounts.loadErrCount;
          logger.error(
            "Invalid Military Load Type:",
            iData.type,
            "name: ",
            iData.name
          );
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch Military Error: ${err.message}`, { meta: err });
    return;
  }
}

async function deleteAllMilitarys(doLoad) {
  //militaryLoadDebugger("Jeff in deleteAllMilitarys", doLoad);
  if (!doLoad) return;

  try {
    for await (const military of Military.find()) {
      let id = military._id;

      //militaryLoadDebugger("Jeff in deleteAllMilitarys loop", military.name);
      try {
        // remove associated gears records
        for (let j = 0; j < military.gear.length; ++j) {
          gerId = military.gear[j];
          let gearDel = await Upgrade.findByIdAndRemove(gerId);
          if ((gearDel = null)) {
            militaryLoadDebugger(
              `The Military Gear with the ID ${gerId} was not found!`
            );
          }
        }

        let militaryDel = await Military.findByIdAndRemove(id);
        if ((militaryDel = null)) {
          logger.error(`The Military with the ID ${id} was not found!`);
        }
        //militaryLoadDebugger("Jeff in deleteAllMilitarys loop after remove", military.name);
      } catch (err) {
        logger.error(`Military Delete All Error: ${err.message}`, {
          meta: err,
        });
      }
    }
    logger.info("All Militarys succesfully deleted!");
  } catch (err) {
    logger.error(`Delete All Militarys Catch Error: ${err.message}`, {
      meta: err,
    });
  }
}

async function createFleet(iData, rCounts) {
  //logger.info("Jeff 1 in loadMilitary %O", iData.name, iData.type);
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = iData.name;

  // New Fleet/Military here
  let fleet = new Fleet({
    name: iData.name,
    type: iData.type,
    code: iData.code,
  });

  fleet.serviceRecord = [];
  fleet.gameState = [];

  if (iData.team != "") {
    let team = await Team.findOne({ teamCode: iData.team });
    if (!team) {
      loadError = true;
      loadErrorMsg = `Team Not Found: ${iData.team}`;
      //militaryLoadDebugger("Military Load Team Error, New Military:", iData.name, " Team: ", iData.team);
    } else {
      fleet.team = team._id;
      //militaryLoadDebugger("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
    }
  }

  if (iData.country != "") {
    let country = await Country.findOne({ code: iData.country });
    if (!country) {
      loadError = true;
      loadErrorMsg = `Country Not Found: ${iData.country}`;
      //militaryLoadDebugger("Military Load Country Error, New Military:", iData.name, " Country: ", iData.country);
    } else {
      fleet.country = country._id;
      fleet.zone = country.zone;
      //militaryLoadDebugger("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }

  fleetSite = undefined;
  if (iData.origin != "") {
    let facility = await Facility.findOne({ code: iData.origin });
    if (!facility) {
      loadError = true;
      loadErrorMsg = `origin Not Found: ${iData.origin}`;
      //militaryLoadDebugger("Military Load Home Base Error, New Military:", iData.name, " origin: ", iData.origin);
    } else {
      if (facility.capability.naval.capacity > 0) {
        fleet.origin = facility._id;
        fleetSite = facility.site;
        //militaryLoadDebugger("Military Load Home Base Found, Military:", iData.name, " origin: ", iData.origin, "Facility ID:", facility._id);
      } else {
        loadError = true;
        loadErrorMsg = `origin ${iData.origin} does not have positive naval capacity`;
      }
    }
  }

  if (
    iData.site != "" &&
    iData.site != "undefined" &&
    iData.site != undefined
  ) {
    let site = await Site.findOne({ siteCode: iData.site });
    if (!site) {
      loadError = true;
      loadErrorMsg = "Site Not Found: " + iData.site;
    } else {
      fleet.site = site._id;
    }
  } else {
    fleet.site = fleetSite;
  }

  fleet.upgrade = [];
  if (!loadError) {
    // create gears records for military and store ID in military.system
    //console.log("jeff military gears  iData.gear", iData.gear);
    for (let ger of iData.gear) {
      let gearError = true;

      let gerRef = gears[gears.findIndex((gear) => gear.code === ger)];
      //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
      if (gerRef) {
        if (validUnitType(gerRef.unitType, fleet.type)) {
          gearError = false;
          newGear = await new Upgrade(gerRef);
          newGear.team = fleet.team;
          newGear.manufacturer = fleet.team;
          newGear.status.building = false;
          newGear.unitType = fleet.type;
          try {
            await newGear.save();
            //militaryLoadDebugger(fleet.name, "Gear", ger, " add saved to Upgrade collection.");
          } catch (err) {
            gearError = true;
            logger.error(`New Military Gear Save Error: ${err}`);
            //return console.error(`New Military Gear Save Error: ${err}`);
          }

          if (!gearError) {
            fleet.gear.push(newGear._id);
          }
        } else {
          logger.error(
            `Error in creation of gear - invalid unitType ${ger} for ${fleet.name}`
          );
        }
      } else {
        logger.error(`Error in creation of gear ${ger} for ${fleet.name}`);
      }
    }
  }

  let { error } = validateMilitary(fleet);
  if (error) {
    loadError = true;
    loadErrorMsg = `Validation Error: ${error.message}`;
    //logger.error("New Military Validate Error", fleet.name, error.message);
    //return;
  }

  if (loadError) {
    logger.error(`Fleet skipped due to errors: ${loadName} ${loadErrorMsg}`);
    delGear(fleet.gear);
    ++rCounts.loadErrCount;
    return;
  } else {
    try {
      let fleetSave = await fleet.save();

      ++rCounts.loadCount;
      logger.debug(`${fleetSave.name} add saved to military collection.`);
    } catch (err) {
      delGear(fleet.gear);
      ++rCounts.loadErrCount;
      logger.error(`New Fleet Save Error: ${err}`, { meta: err });
      return;
    }
  }
}

async function createCorps(iData, rCounts) {
  // New Corps/Military here
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = iData.name;

  let corps = new Corps({
    name: iData.name,
    type: iData.type,
    code: iData.code,
  });

  corps.serviceRecord = [];
  corps.gameState = [];

  if (iData.team != "") {
    let team = await Team.findOne({ teamCode: iData.team });
    if (!team) {
      loadError = true;
      loadErrorMsg = `Team Not Found: ${iData.team}`;
      //logger.info("Military Load Team Error, New Military:", iData.name, " Team: ", iData.team);
    } else {
      corps.team = team._id;
      //logger.info("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
    }
  }

  if (iData.country != "") {
    let country = await Country.findOne({ code: iData.country });
    if (!country) {
      loadError = true;
      loadErrorMsg = `Country Not Found: ${iData.country}`;
      //logger.info("Military Load Country Error, New Military:", iData.name, " Country: ", iData.country);
    } else {
      corps.country = country._id;
      corps.zone = country.zone;
      //logger.info("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }

  corpsSite = undefined;
  if (iData.origin != "") {
    let facility = await Facility.findOne({ code: iData.origin });
    if (!facility) {
      loadError = true;
      loadErrorMsg = `origin Not Found: ${iData.origin}`;
      //logger.info("Military Load Home Base Error, New Military:", iData.name, " origin: ", iData.origin);
    } else {
      if (facility.capability.ground.capacity > 0) {
        corps.origin = facility._id;
        corpsSite = facility.site;
        //logger.info("Military Load Home Base Found, Military:", iData.name, " origin: ", iData.origin, "Site ID:", site._id);
      } else {
        loadError = true;
        loadErrorMsg = `origin ${iData.origin} does not have positive ground capacity`;
      }
    }
  }

  if (
    iData.site != "" &&
    iData.site != "undefined" &&
    iData.site != undefined
  ) {
    let site = await Site.findOne({ siteCode: iData.site });
    if (!site) {
      loadError = true;
      loadErrorMsg = "Site Not Found: " + iData.site;
    } else {
      corps.site = site._id;
    }
  } else {
    corps.site = corpsSite;
  }

  corps.upgrade = [];
  if (!loadError) {
    // create gears records for military and store ID in military.system
    //console.log("jeff military gears  iData.gear", iData.gear);

    for (let ger of iData.gear) {
      let gearError = true;
      let gerRef = gears[gears.findIndex((gear) => gear.code === ger)];
      //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
      if (gerRef) {
        if (validUnitType(gerRef.unitType, corps.type)) {
          gearError = false;
          newGear = await new Upgrade(gerRef);
          newGear.team = corps.team;
          newGear.manufacturer = corps.team;
          newGear.status.building = false;
          newGear.unitType = corps.type;
          try {
            await newGear.save();
            //logger.info(corps.name, "Gear", ger, " add saved to upgrade collection.");
          } catch (err) {
            logger.error(`New Military Gear Save Error: ${err}`);
            gearError = true;
            //return console.error(`New Military Gear Save Error: ${err}`);
          }

          if (!gearError) {
            corps.gear.push(newGear._id);
          }
        } else {
          logger.error(
            `Error in creation of gear - invalid Unittype ${ger} for ${corps.name}`
          );
        }
      } else {
        logger.error(`Error in creation of gear ${ger} for ${corps.name}`);
      }
    }
  }

  let { error } = validateMilitary(corps);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Military Validate Error ${corps.name} ${error.message}`;
  }

  if (loadError) {
    logger.error(`Corps skipped due to errors: ${loadName} ${loadErrorMsg}`);
    delGear(corps.gear);
    ++rCounts.loadErrCount;
    return;
  } else {
    try {
      let corpsSave = await corps.save();

      ++rCounts.loadCount;
      logger.debug(`${corpsSave.name} add saved to military collection.`);
    } catch (err) {
      delGear(corps.gear);
      ++rCounts.loadErrCount;
      logger.error(`New Military Save Error: ${err}`, { meta: err });
      return;
    }
  }
}

async function updateFleet(iData, rCounts) {
  // Update Fleet/Military here
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = iData.name;

  let fleet = await Fleet.findOne({ name: iData.name });
  if (!fleet) {
    ++rCounts.loadErrCount;
    logger.error(`${iData.name} skipped in updateFleet ... not found.`);
    return;
  }

  let id = fleet._id;
  fleet.name = iData.name;

  if (iData.team != "") {
    let team = await Team.findOne({ teamCode: iData.team });
    if (!team) {
      loadError = true;
      loadErrorMsg = `Team Not Found: ${iData.team}`;
      //militaryLoadDebugger("Military Load Team Error, Update Military:", iData.name, " Team: ", iData.team);
    } else {
      fleet.team = team._id;
      //militaryLoadDebugger("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
    }
  }

  if (iData.country != "") {
    let country = await Country.findOne({ code: iData.country });
    if (!country) {
      loadError = true;
      loadErrorMsg = `Country Not Found: ${iData.country}`;
      //militaryLoadDebugger("Military Load Country Error, Update Military:", iData.name, " Country: ", iData.country);
    } else {
      fleet.country = country._id;
      fleet.zone = country.zone;
      //militaryLoadDebugger("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }

  fleetSite = undefined;
  if (iData.origin != "") {
    let facility = await Facility.findOne({ code: iData.origin });
    if (!facility) {
      loadError = true;
      loadErrorMsg = `origin Not Found: ${iData.origin}`;
      //militaryLoadDebugger("Military Load Home Base Error, Update Military:", iData.name, " origin: ", iData.origin);
    } else {
      if (facility.capability.naval.capacity > 0) {
        fleet.origin = facility._id;
        fleetSite = facility.site;
        //militaryLoadDebugger("Military Load Home Base Found, Military:", iData.name, " origin: ", iData.origin, "Facility ID:", facility._id);
      } else {
        loadError = true;
        loadErrorMsg = `origin ${iData.origin} does not have positive naval capacity`;
      }
    }
  }

  if (
    iData.site != "" &&
    iData.site != "undefined" &&
    iData.site != undefined
  ) {
    let site = await Site.findOne({ siteCode: iData.site });
    if (!site) {
      loadError = true;
      loadErrorMsg = "Site Not Found: " + iData.site;
    } else {
      fleet.site = site._id;
    }
  } else {
    fleet.site = fleetSite;
  }

  // create gears records for military and store ID in military.system
  //console.log("jeff military gears  iData.gear", iData.gear);
  fleet.upgrade = [];
  if (!loadErrorMsg) {
    for (let ger of iData.gear) {
      let gearError = true;
      let gerRef = gears[gears.findIndex((gear) => gear.code === ger)];
      //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
      if (gerRef) {
        if (validUnitType(gerRef.unitType, fleet.type)) {
          gearError = false;
          newGear = await new Upgrade(gerRef);
          newGear.team = fleet.team;
          newGear.manufacturer = fleet.team;
          newGear.status.building = false;
          newGear.unitType = fleet.type;
          try {
            await newGear.save();

            //militaryLoadDebugger(fleet.name, "Gear", ger, " add saved to upgrade collection.");
          } catch (err) {
            logger.error(`New Military Gear Save Error: ${err}`);
            gearError = true;
            //return console.error(`New Military Gear Save Error: ${err}`);
          }

          if (!gearError) {
            fleet.gear.push(newGear._id);
          }
        } else {
          logger.error(
            `Error in creation of gear - Invalid UnitType ${ger} for ${fleet.name}`
          );
        }
      } else {
        logger.error(`Error in creation of gear ${ger} for ${fleet.name}`);
      }
    }
  }

  let { error } = validateMilitary(fleet);
  if (error) {
    loadError = true;
    loadErrorMsg = "Validation Error: " + error.message;
    //return;
  }

  if (loadError) {
    logger.error(
      `Fleet Update skipped due to errors: ${loadName} ${loadErrorMsg}`
    );
    delGear(fleet.gear);
    ++rCounts.loadErrCount;
    return;
  } else {
    try {
      let fleetSave = await fleet.save();
      ++rCounts.updCount;
      logger.debug(`${fleetSave.name} add saved to military collection.`);
      return;
    } catch (err) {
      delGear(fleet.gear);
      ++rCounts.loadErrCount;
      logger.error(`Update Military Save Error: ${err}`);
      return;
    }
  }
}

async function updateCorps(iData, rCounts) {
  // Update Corps/Military here
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = iData.name;

  let corps = await Corps.findOne({ name: iData.name });
  if (!corps) {
    logger.error(`${iData.name} skipped in updateCorps ... not found.`);
    ++rCounts.loadErrCount;
    logger.error();
    return;
  }

  let id = corps._id;
  corps.name = iData.name;

  if (iData.team != "") {
    let team = await Team.findOne({ teamCode: iData.team });
    if (!team) {
      loadError = true;
      loadErrorMsg = `Team Not Found: ${iData.team}`;
      //militaryLoadDebugger("Military Load Team Error, Update Military:", iData.name, " Team: ", iData.team);
    } else {
      corps.team = team._id;
      //militaryLoadDebugger("Military Load Team Found, Military:", iData.name, " Team: ", iData.team, "Team ID:", team._id);
    }
  }

  if (iData.country != "") {
    let country = await Country.findOne({ code: iData.country });
    if (!country) {
      loadError = true;
      loadErrorMsg = `Country Not Found: ${iData.country}`;
      //militaryLoadDebugger("Military Load Country Error, Update Military:", iData.name, " Country: ", iData.country);
    } else {
      corps.country = country._id;
      corps.zone = country.zone;
      //militaryLoadDebugger("Military Load Country Found, Military:", iData.name, " Country: ", iData.country, "Country ID:", country._id);
    }
  }

  corpsSite = undefined;
  if (iData.origin != "") {
    let facility = await Facility.findOne({ code: iData.origin });
    if (!facility) {
      loadError = true;
      loadErrorMsg = `origin Not Found: ${iData.origin}`;
      //militaryLoadDebugger("Military Load Home Base Error, Update Military:", iData.name, " origin: ", iData.origin);
    } else {
      if (facility.capability.ground.capacity > 0) {
        corps.origin = facility._id;
        corpsSite = facility.site;
        //militaryLoadDebugger("Military Load Home Base Found, Military:", iData.name, " origin: ", iData.origin, "Facility ID:", facility._id);
      } else {
        loadError = true;
        loadErrorMsg = `origin ${iData.origin} does not have positive naval capacity`;
      }
    }
  }

  if (
    iData.site != "" &&
    iData.site != "undefined" &&
    iData.site != undefined
  ) {
    let site = await Site.findOne({ siteCode: iData.site });
    if (!site) {
      loadError = true;
      loadErrorMsg = "Site Not Found: " + iData.site;
    } else {
      corps.site = site._id;
    }
  } else {
    corps.site = corpsSite;
  }

  // create gears records for military and store ID in military.system
  //console.log("jeff military gears  iData.gear", iData.gear);
  corps.upgrade = [];
  if (!loadErrorMsg) {
    for (let ger of iData.gear) {
      let gearError = true;
      let gerRef = gears[gears.findIndex((gear) => gear.code === ger)];
      //console.log("jeff in military gears ", sys, "gerRef:", gerRef);
      if (gerRef) {
        if (validUnitType(gerRef.unitType, corps.type)) {
          gearError = false;
          newGear = await new Upgrade(gerRef);
          newGear.team = corps.team;
          newGear.manufacturer = corps.team;
          newGear.status.building = false;
          newGear.unitType = corps.type;
          try {
            await newGear.save();
            //militaryLoadDebugger(corps.name, "Gear", ger, " add saved to upgrade collection.");
          } catch (err) {
            logger.error(`New Military Gear Save Error: ${err}`);
            gearError = true;
            //return console.error(`New Military Gear Save Error: ${err}`);
          }

          if (!gearError) {
            corps.gear.push(newGear._id);
          }
        } else {
          logger.debug(
            `Error in creation of gear - Invalid UnitType ${ger} for ${corps.name}`
          );
        }
      } else {
        logger.debug(`Error in creation of gear ${ger} for  ${corps.name}`);
      }
    }
  }

  let { error } = validateMilitary(corps);
  if (error) {
    loadError = true;
    loadErrorMsg = "Validation Error: " + error.message;
    //militaryLoadDebugger("Update Military Validate Error", corps.name, error.message);
  }

  if (loadError) {
    logger.error(`Corps skipped due to errors: ${loadName} ${loadErrorMsg}`);
    delGear(corps.gear);
    ++rCounts.loadErrCount;
    return;
  } else {
    try {
      let corpsSave = await corps.save();

      ++rCounts.updCount;
      logger.debug(`${corpsSave.name} add saved to military collection.`);
    } catch (err) {
      delGear(corps.gear);
      ++rCounts.loadErrCount;
      logger.error(`Update Military Save Error: ${err}`);
      return;
    }
  }
}

module.exports = runMilitaryLoad;
