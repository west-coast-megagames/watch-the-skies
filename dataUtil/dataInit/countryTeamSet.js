const fs = require("fs");

//const mongoose = require('mongoose');
const countryTeamSetDebugger = require("debug")("app:countryLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

// Country Model - Using Mongoose Model
const { Country } = require("../models/country");
const { Team } = require("../models/team");

const app = express();

async function countryTeamSet(runFlag) {
  if (!runFlag) return false;
  if (runFlag) await teamSet(runFlag);
  return true;
}

async function teamSet(doLoad) {
  if (!doLoad) return;

  let recReadCount = 0;
  let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0, skipCount: 0 };

  for await (let country of Country.find()) {
    ++recReadCount;

    try {
      let team = await Team.findOne({ teamCode: country.loadTeamCode });

      if (!team) {
        logger.error(
          `Team not found for Country ${country.code} Team ${country.loadTeamCode}`
        );
        ++recCounts.loadErrCount;
      } else {
        country.team = team._id;

        try {
          await country.save();
          ++recCounts.updCount;
          //logger.debug(`${loadName} update saved to country collection.`);
        } catch (err) {
          ++recCounts.loadErrCount;
          logger.error(`Country Team Set Update Save Error: ${err.message}`, {
            meta: err,
          });
        }
      }
    } catch (err) {
      ++recCounts.loadErrCount;
      logger.error(`Catch Country Team Set Error: ${err.message}`, {
        meta: err,
      });
    }
  }
  logger.info(
    `Country Team Set Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Skipped: ${recCounts.skipCount}
                         Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
  );
}

module.exports = countryTeamSet;
