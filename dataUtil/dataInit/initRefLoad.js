const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/refdata.json",
  "utf8"
);
const refDataIn = JSON.parse(file);
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const zoneInitDebugger = require("debug")("app:zoneInit");
const teamInitDebugger = require("debug")("app:teamInit");
const countryInitDebugger = require("debug")("app:countryInit");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Country Model - Using Mongoose Model
const { Zone, validateZone } = require("../models/zone");
const { Country, validateCountry } = require("../models/country");
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
const { Research } = require("../models/sci/research");
const { Log } = require("../models/logs/log");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runLoad(runFlag) {
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  // drop team-related tables
  await Research.deleteMany();
  await Log.deleteMany();

  let zoneRecReadCount = 0;
  let zoneRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  let countryRecReadCount = 0;
  let countryRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  let teamRecReadCount = 0;
  let teamRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  for await (let data of refDataIn) {
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
          data.refNumber1,
          zoneRecCounts
        );
      }
    }

    if (data.loadType == "team") {
      // Delete now regardless of loadFlag
      await deleteTeam(data.name, data.code, data.loadFlag);

      if (data.loadFlag == "true") {
        ++teamRecReadCount;
        await loadTeam(
          data.name,
          data.code,
          data.loadFlag,
          data.parentCode1,
          teamRecCounts
        );
      }
    }

    if (data.loadType == "country") {
      //Delete now regardless of loadFlag
      await deleteCountry(data.name, data.code, data.loadFlag);

      if (data.loadFlag === "true") {
        ++countryRecReadCount;
        await loadCountry(
          data.name,
          data.code,
          data.loadFlag,
          data.parentCode1,
          data.parentCode2,
          data.refNumber1,
          data.refBoolean1,
          countryRecCounts
        );
      }
    }
  }

  logger.info(
    `Zone Load Counts Read: ${zoneRecReadCount} Errors: ${zoneRecCounts.loadErrCount} Saved: ${zoneRecCounts.loadCount} Updated: ${zoneRecCounts.updCount}`
  );

  logger.info(
    `Team Load Counts Read: ${teamRecReadCount} Errors: ${teamRecCounts.loadErrCount} Saved: ${teamRecCounts.loadCount} Updated: ${teamRecCounts.updCount}`
  );

  logger.info(
    `Country Load Counts Read: ${countryRecReadCount} Errors: ${countryRecCounts.loadErrCount} Saved: ${countryRecCounts.loadCount} Updated: ${countryRecCounts.updCount}`
  );

  return;
}

async function loadZone(zName, zCode, zLoadFlg, zTerror, rCounts) {
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
      let zone = new Zone({
        code: zCode,
        name: zName,
        terror: randomTerror, //zTerror
      });
      zone.serviceRecord = [];
      zone.gameState = [];

      zone.satellite = [];
      let { error } = validateZone(zone);
      if (error) {
        loadError = true;
        loadErrorMsg = `New Zone Validate Error: ${zone.code} ${error.message}`;
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
        logger.error(`Zone skipped due to errors: ${loadName} ${loadErrorMsg}`);
        ++rCounts.loadErrCount;
        return;
      }
    } else {
      // Existing Zone here ... update
      let id = zone._id;

      zone.name = zName;
      zone.code = zCode;
      zone.terror = randomTerror; //zTerror;

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

async function loadTeam(tName, tCode, tLoadFlg, tType, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    let team = await Team.findOne({ teamCode: tCode });
    loadName = tName;
    if (!team) {
      // New Team here
      if (tLoadFlg === "false") return; // don't load if not true

      switch (tType) {
        case "N":
          await newNational(tName, tCode, rCounts);
          break;

        case "A":
          await newAlien(tName, tCode, rCounts);
          break;

        case "C":
          await newControl(tName, tCode, rCounts);
          break;

        case "P":
          await newNpc(tName, tCode, rCounts);
          break;

        case "M":
          await newMedia(tName, tCode, rCounts);
          break;

        default:
          let team = new Team({
            teamCode: tCode,
            name: tName,
            countryID: tName,
          });
          team.gameState = [];
          team.serviceRecord = [];
          team.trades = [];
          team.treaties = [];
          let { error } = validateTeam(team);
          if (error) {
            loadError = true;
            loadErrorMsg = `New Team Validate Error: ${team.teamCode} ${error.message}`;
          }

          if (!loadError) {
            try {
              let teamSave = await team.save();
              ++rCounts.loadCount;
              logger.debug(`${teamSave.name} add saved to teams collection.`);
              return;
            } catch (err) {
              ++rCounts.loadErrCount;
              logger.error(`New Team Save Error: ${err.message}`, {
                meta: err,
              });
              return;
            }
          } else {
            logger.error(
              `Team save skipped due to errors: ${loadName} ${loadErrorMsg}`
            );
            ++rCounts.loadErrCount;
            return;
          }
      }
    } else {
      // Existing Team here ... update
      let id = team._id;

      team.name = tName;
      team.teamCode = tCode;
      team.countryID = tCode;

      const { error } = validateTeam(team);
      if (error) {
        loadError = true;
        loadErrorMsg = `Team Update Validate Error: ${team.teamCode} ${error.message}`;
      }

      if (!loadError) {
        try {
          let teamSave = await team.save();
          ++rCounts.updCount;
          logger.debug(`${teamSave.name} update saved to teams collection.`);
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`Team Update Save Error: ${err.message}`, { meta: err });
          return;
        }
      } else {
        logger.error(
          `Team Update save skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      }
    }
  } catch (err) {
    logger.error(`Catch Team Error: ${err.message}`, { meta: err });
    ++rCounts.loadErrCount;
    return;
  }
}

async function deleteTeam(tName, tCode, tLoadFlg) {
  try {
    let delErrorFlag = false;
    for await (let team of Team.find({ teamCode: tCode })) {
      try {
        let delId = team._id;
        let teamDel = await Team.findByIdAndRemove(delId);
        if ((teamDel = null)) {
          logger.error(`deleteTeam: Team with the ID ${delId} was not found!`);
          delErrorFlag = true;
        }
      } catch (err) {
        logger.error(`Catch deleteTeam Error1: ${err.message}`, { meta: err });
        delErrorFlag = true;
      }
    }
    if (!delErrorFlag) {
      logger.debug(`All Teams succesfully deleted for Code: ${tCode}`);
    } else {
      logger.error(`Some Error(s) with team delete for code: ${tCode}`);
    }
  } catch (err) {
    logger.error(`Catch deleteTeam Error 2: ${err.message}`, { meta: err });
  }
}

async function loadCountry(
  cName,
  cCode,
  cLoadFlg,
  zCode,
  tCode,
  cUnrest,
  cCoastal,
  rCounts
) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    //logger.debug("Jeff here in loadCountry for refData ... Code", cCode, "name ", cName);
    //console.log("Jeff here in loadCountry for refData ... Code", cCode, "name ", cName);
    let country = await Country.findOne({ code: cCode });
    loadName = cName;
    if (!country) {
      // New Country here
      if (cLoadFlg === "false") return; // don't load if flag is not true

      let country = new Country({
        code: cCode,
        name: cName,
        unrest: cUnrest,
        loadTeamCode: tCode,
        loadZoneCode: zCode,
        coastal: cCoastal,
      });
      country.gameState = [];
      country.serviceRecord = [];

      let zone = await Zone.findOne({ code: zCode });
      if (!zone) {
        loadError = true;
        loadErrorMsg =
          "Zone Not Found for Country: " + cCode + " Zone " + zCode;
      } else {
        country.zone = zone._id;
      }

      if (tCode != "") {
        let team = await Team.findOne({ teamCode: tCode });
        if (!team) {
          loadError = true;
          loadErrorMsg =
            "Team Not Found for Country: " + cCode + " Team " + tCode;
        } else {
          country.team = team._id;
          //countryInitDebugger("Country Load Team Found, Country:", cCode, " Team: ", tCode, "Team ID:", team._id);
        }
      }

      let { error } = validateCountry(country);
      if (error) {
        loadError = true;
        loadErrorMsg = "Country: " + cCode + " Validate Error " + error.message;
      }

      if (!loadError) {
        try {
          let countrySave = await country.save();
          ++rCounts.loadCount;
          logger.debug(`${countrySave.name} saved to country collection.`);

          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`Country Save Error: ${err.message}`, { meta: err });
          return;
        }
      } else {
        logger.error(
          `Country skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      }
    } else {
      // Existing Country here ... update
      let id = country._id;

      country.name = cName;
      country.code = cCode;
      country.unrest = cUnrest;
      country.loadTeamCode = tCode;
      country.loadZoneCode = zCode;
      country.coastal = cCoastal;

      let zone = await Zone.findOne({ code: zCode });
      if (!zone) {
        loadError = true;
        loadErrorMsg =
          "Zone Not Found for Country: " + cCode + " Zone " + zCode;
      } else {
        country.zone = zone._id;
        //countryInitDebugger("Country Load Zone Found, Update Country:", cCode, " Zone: ", zCode, "Zone ID:",zone._id);
      }

      if (tCode != "") {
        let team = await Team.findOne({ teamCode: tCode });
        if (!team) {
          loadError = true;
          loadErrorMsg =
            "Team Not Found for Country: " + cCode + " Team " + tCode;
        } else {
          country.team = team._id;
          //countryInitDebugger("Country Load Team Found, Update Country:", cCode, " Team: ", tCode, "Team ID:", team._id);
        }
      }

      const { error } = validateCountry(country);
      if (error) {
        loadError = true;
        loadErrorMsg = "Country: " + cCode + " Validate Error " + error.message;
      }

      if (!loadError) {
        try {
          let countrySave = await country.save();
          ++rCounts.updCount;
          logger.debug(`${countrySave.name} saved to country collection.`);
          return;
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`Country Save Error: ${err.message}`, { meta: err });
          return;
        }
      } else {
        logger.error(
          `Country skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
      }
    }
  } catch (err) {
    logger.error(`Catch Country Error: ${err.message}`, { meta: err });
    ++rCounts.loadErrCount;
    return;
  }
}

async function deleteCountry(cName, cCode, cLoadFlg) {
  try {
    let delErrorFlag = false;
    for await (let country of Country.find({ code: cCode })) {
      try {
        let delId = country._id;
        let countryDel = await Country.findByIdAndRemove(delId);
        if ((countryDel = null)) {
          logger.error(
            `deleteCountry: Country with the ID ${delId} was not found!`
          );
          delErrorFlag = true;
        }
      } catch (err) {
        logger.error(`deleteCountry Error 1: err.message`, { meta: err });
        delErrorFlag = true;
      }
    }
    if (!delErrorFlag) {
      logger.debug(`All Country succesfully deleted for Code: ${cCode}`);
    } else {
      logger.error(`Some Error In Country delete for Code: ${cCode}`);
    }
  } catch (err) {
    logger.error(`deleteCountry Error 2: ${err.message}`, { meta: err });
  }
}

async function newNational(tName, tCode, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = tName;

  let national = new National({
    teamCode: tCode,
    name: tName,
    countryID: tName,
    teamType: "N",
  });
  national.gameState = [];
  national.serviceRecord = [];
  national.trades = [];
  national.treaties = [];

  let { error } = validateNational(national);
  if (error) {
    loadError = true;
    loadErrorMsg = `New National Team ${national.teamCode} Validation Error: ${error.message}`;
  }

  if (!loadError) {
    try {
      let nationalSave = await national.save();
      ++rCounts.loadCount;
      logger.debug(
        `National Team ${nationalSave.name} saved to teams collection.`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`National Team Save Error: ${err.message}`, { meta: err });
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

async function newAlien(tName, tCode, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = tName;

  let alien = new Alien({
    teamCode: tCode,
    name: tName,
    countryID: tName,
    teamType: "A",
  });
  alien.gameState = [];
  alien.serviceRecord = [];
  alien.trades = [];
  alien.treaties = [];

  let { error } = validateAlien(alien);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Alien Team ${alien.teamCode} Validation Error: ${error.message}`;
  }

  if (!loadError) {
    try {
      let alienSave = await alien.save();
      ++rCounts.loadCount;
      logger.debug(`Alien Team ${alienSave.name} saved to teams collection.`);
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Alien Team Save Error: ${err.message}`, { meta: err });
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

async function newControl(tName, tCode, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";

  let control = new Control({
    teamCode: tCode,
    name: tName,
    countryID: tName,
    teamType: "C",
  });
  control.gameState = [];
  control.serviceRecord = [];
  control.trades = [];
  control.treaties = [];

  let { error } = validateControl(control);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Control Team ${control.teamCode} Validation Error: ${error.message}`;
  }

  if (!loadError) {
    try {
      let controlSave = await control.save();
      ++rCounts.loadCount;
      logger.debug(
        `Control Team ${controlSave.name} saved to teams collection.`
      );
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Control Team Save Error: ${err.message}`, { meta: err });
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

async function newMedia(tName, tCode, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = tName;

  let media = new Media({
    teamCode: tCode,
    name: tName,
    countryID: tName,
    teamType: "M",
  });
  media.gameState = [];
  media.serviceRecord = [];
  media.trades = [];
  media.treaties = [];

  let { error } = validateMedia(media);
  if (error) {
    loadError = true;
    loadErrorMsg = `New Media Team ${media.teamCode} Validation Error: ${error.message}`;
  }

  if (!loadError) {
    try {
      let mediaSave = await media.save();
      ++rCounts.loadCount;
      logger.debug(`Media Team ${mediaSave.name} saved to teams collection.`);
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`Media Team Save Error: ${err.message}`, { meta: err });
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

async function newNpc(tName, tCode, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = tName;

  let npc = new Npc({
    teamCode: tCode,
    name: tName,
    countryID: tName,
    teamType: "P",
  });
  npc.gameState = [];
  npc.serviceRecord = [];
  npc.trades = [];
  npc.treaties = [];

  let { error } = validateNpc(npc);
  if (error) {
    loadError = true;
    loadErrorMsg = `New NPC Team ${npc.teamCode} Validation Error: ${error.message}`;
  }

  if (!loadError) {
    try {
      let npcSave = await npc.save();
      ++rCounts.loadCount;
      logger.debug(`NPC Team ${npcSave.name} saved to teams collection.`);
      return;
    } catch (err) {
      ++rCounts.loadErrCount;
      logger.error(`NPC Team Save Error: ${err.message}`, { meta: err });
      return;
    }
  } else {
    logger.error(`NPC Team skipped due to errors: ${loadName} ${loadErrorMsg}`);
    ++rCounts.loadErrCount;
    return;
  }
}

module.exports = runLoad;
