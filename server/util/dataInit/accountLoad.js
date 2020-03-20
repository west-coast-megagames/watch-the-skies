const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initAccounts.json', 'utf8');
const accountDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const accountLoadDebugger = require('debug')('app:accountLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Account Model - Using Mongoose Model
const { Account, validateAccount } = require('../../models/gov/account');
const { Team } = require('../../models/team/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runAccountLoad(runFlag){
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
};

const accounts = []

// Account Constructor Function
function Acc(acct) {
  this.name = acct.name;
  this.code = acct.code;
  this.balance = acct.balance;
  this.deposits = acct.deposits;
  this.withdrawals = acct.withdrawals;
  
  this.build = async function() {
    let newAccount = new Account(this)

    await newAccount.save();

    logger.info(`${newAccount.name} has been built...`)

    return newAccount;
  }
}

async function loadAccounts () {
  let count = 0;

  await accountDataIn.forEach(acct => {
    accounts[count] = new Acc(acct);
    count++;
  });

  logger.info(`${count} generic accounts available for loading`);

};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  //load generic accounts json records into internal array 
  await loadAccounts();
  
  // delete ALL old data
  await deleteAccount();

  //create accounts for each team
  for await (let team of Team.find()) {    

    found_team_id = team._id;
    found_owner   = team.shortName;
    
    for (let i = 0; i < accounts.length; ++i ) {
      await loadAccount(found_team_id, found_owner, accounts[i]);
    }      
  }
};

async function loadAccount(t_id, tName, aData){
  try {   
    let bigCode = aData.code.toUpperCase();
    let account = await Account.findOne({ team: t_id, code: bigCode });

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
          team: t_id
      }); 

      let { error } = validateAccount(account); 
      if (error) {
        logger.error(`New Account Validate Error ${account.code} ${error.message}`);
        return;
      }
        
      await account.save((err, account) => {
        if (err) {
          logger.error(`New Account Save Error: ${err.message}`,{meta: err});
          return;
        }
        logger.info(`${account.owner} ${account.name} New add saved to accounts collection.`);
      });    
    } else {       
      // Existing Account here ... update
      let id = account._id;
      
      account.name          = aData.name;
      account.code          = bigCode;
      account.balance       = aData.balance;
      account.deposits      = aData.deposits;
      account.withdrawals   = aData.withdrawals;
      account.owner         = tName;
      account.team          = t_id;

      const { error } = validateAccount(account); 
      if (error) {
        logger.error(`Update Account Validate Error ${account.code} ${error.message}`);
        return
      }
      
      await account.save((err, account) => {
        if (err) {
          logger.error(`Update Account Save Error: ${err.message}`,{meta: err});  
          return;
        }
        logger.info(`${account.owner} ${account.name} Update saved to accounts collection.`);
      });
    }
  } catch (err) {
    logger.error(`Catch Account Error: ${err.message}`,{meta: err});  
    return;
}

};

async function deleteAccount(){
  try {
    let delErrorFlag = false;
    for await (let account of Account.find(  )) {    
      try {
        let delId = account._id;
        let accountDel = await Account.findByIdAndRemove(delId);
        if (accountDel = null) {
          accountLoadDebugger(`deleteAccount: Account with the ID ${delId} was not found!`);
          let delErrorFlag = true;
        }
      } catch (err) {
        accountLoadDebugger('deleteAccount Error 1:', err.message);
        let delErrorFlag = true;
      }
    }        
    if (!delErrorFlag) {
       accountLoadDebugger("All Accounts succesfully deleted:");
    } else {
       accountLoadDebugger("Some Error In Accounts delete");
    }
  } catch (err) {
    accountLoadDebugger(`deleteAccount Error 2: ${err.message}`);
  }
};

module.exports = runAccountLoad;