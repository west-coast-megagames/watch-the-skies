const fs = require("fs");
const config = require("config");
const file = fs.readFileSync(
  config.get("initPath") + "init-json/initAccounts.json",
  "utf8"
);
const accountDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const accountLoadDebugger = require("debug")("app:accountLoad");
const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const express = require("express");
const bodyParser = require("body-parser");

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Account Model - Using Mongoose Model
const { Account, validateAccount } = require("../models/gov/account");
const { Team } = require("../models/team/team");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runAccountLoad(runFlag) {
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
}

const accounts = [];

// Account Constructor Function
function Acc(acct) {
  this.name = acct.name;
  this.code = acct.code;
  this.balance = acct.balance;
  this.deposits = acct.deposits;
  this.withdrawals = acct.withdrawals;

  this.build = async function () {
    let newAccount = new Account(this);

    await newAccount.save();

    logger.info(`${newAccount.name} has been built...`);

    return newAccount;
  };
}

async function loadAccounts() {
  let count = 0;

  await accountDataIn.forEach((acct) => {
    accounts[count] = new Acc(acct);
    count++;
  });

  logger.info(`${count} generic accounts available for loading`);
}

async function initLoad(doLoad) {
  if (!doLoad) return;

  //load generic accounts json records into internal array
  await loadAccounts();

  // delete ALL old data
  await deleteAccount();

  let totRecReadCount = 0;
  let totRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

  //create accounts for each team
  for await (let team of Team.find()) {
    found_team_id = team._id;
    found_owner = team.shortName;

    let recReadCount = 0;
    let recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

    for (let i = 0; i < accounts.length; ++i) {
      ++recReadCount;
      await loadAccount(found_team_id, found_owner, accounts[i], recCounts);
    }
    totRecReadCount += recReadCount;
    totRecCounts.loadCount += recCounts.loadCount;
    totRecCounts.loadErrCount += recCounts.loadErrCount;
    totRecCounts.updCount += recCounts.updCount;

    logger.info(
      `Account Load Counts For Team ${found_owner} Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
    );
  }
  logger.info(
    `Total Account Load Counts Read: ${totRecReadCount} Errors: ${totRecCounts.loadErrCount} Saved: ${totRecCounts.loadCount} Updated: ${totRecCounts.updCount}`
  );
}

async function loadAccount(t_id, tName, aData, rCounts) {
  let loadError = false;
  let loadErrorMsg = "";
  let loadName = "";

  try {
    let bigCode = aData.code.toUpperCase();
    let account = await Account.findOne({ team: t_id, code: bigCode });
    loadName = aData.name + " " + tName;

    //accountLoadDebugger("Account Load function ... code", aData.code, bigCode, "t_id", t_id, (!account));

    if (!account) {
      // New Account here
      let account = new Account({
        code: bigCode,
        name: aData.name,
        balance: aData.balance,
        deposits: aData.deposits,
        withdrawals: aData.withdrawals,
        owner: tName,
        team: t_id,
        gameState: [],
      });

      let { error } = validateAccount(account);
      if (error) {
        loadError = true;
        loadErrorMsg = `New Account Validate Error ${account.code} ${error.message}`;
      }

      if (loadError) {
        logger.error(
          `Account skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let accountSave = await account.save();
          ++rCounts.loadCount;
          logger.debug(
            `${accountSave.owner} ${accountSave.name} New add saved to accounts collection.`
          );
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`New Account Save Error: ${err.message}`, { meta: err });
          return;
        }
      }
    } else {
      // Existing Account here ... update
      let id = account._id;

      account.name = aData.name;
      account.code = bigCode;
      account.balance = aData.balance;
      account.deposits = aData.deposits;
      account.withdrawals = aData.withdrawals;
      account.owner = tName;
      account.team = t_id;

      const { error } = validateAccount(account);
      if (error) {
        loadError = true;
        loadErrorMsg = `Update Account Validate Error ${account.code} ${error.message}`;
      }

      if (loadError) {
        logger.error(
          `Account skipped due to errors: ${loadName} ${loadErrorMsg}`
        );
        ++rCounts.loadErrCount;
        return;
      } else {
        try {
          let accountSave = await account.save();

          ++rCounts.updCount;
          logger.debug(
            `${accountSave.owner} ${accountSave.name} Update saved to accounts collection.`
          );
        } catch (err) {
          ++rCounts.loadErrCount;
          logger.error(`Update Account Save Error: ${err.message}`, {
            meta: err,
          });
          return;
        }
      }
    }
  } catch (err) {
    ++rCounts.loadErrCount;
    logger.error(`Catch Account Error: ${err.message}`, { meta: err });
    return;
  }
}

async function deleteAccount() {
  try {
    let delErrorFlag = false;
    for await (let account of Account.find()) {
      try {
        let delId = account._id;
        let accountDel = await Account.findByIdAndRemove(delId);
        if ((accountDel = null)) {
          logger.error(
            `deleteAccount: Account with the ID ${delId} was not found deleteAccount!`
          );
          let delErrorFlag = true;
        }
      } catch (err) {
        logger.error(`deleteAccount Error 1: ${err.message}`, {
          meta: err,
        });
        let delErrorFlag = true;
      }
    }
    if (!delErrorFlag) {
      logger.debug("All Accounts succesfully deleted:");
    } else {
      logger.debug("Some Error In Accounts delete");
    }
  } catch (err) {
    logger.error(`deleteAccount Error 2: ${err.message}`, {
      meta: err,
    });
  }
}

module.exports = runAccountLoad;
