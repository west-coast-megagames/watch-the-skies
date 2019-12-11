const fs = require('fs')
const file = fs.readFileSync('./init-json/initAccounts.json', 'utf8');
const accountDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const accountLoadDebugger = require('debug')('app:accountLoad');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Account Model - Using Mongoose Model
const { Account, validateAccount } = require('../models/gov/account');
const { Team, validateTeam } = require('../models/team');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function runAccountLoad(runFlag){
  if (!runFlag) return;
  if (runFlag) initLoad(runFlag);
  else return;
};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  for (let i = 0; i < accountDataIn.length; ++i ) {
    
    accountLoadDebugger("Jeff in runAccountLoad loop", i, accountDataIn[i].loadType );    
    if (accountDataIn[i].loadType == "accounts") {     
      
      if (accountDataIn[i].parentCode1 != ""){
        let team = await Team.findOne({ teamCode: accountDataIn[i].parentCode1 });  
        if (!team) {
          accountLoadDebugger("Account Load Team Error:", accountDataIn[i].name, " Team: ", accountDataIn[i].parentCode1);
          continue;
        } else {
          found_team_id       = team._id;
          found_teamShortName = team.shortName;
        }  
      } else {
        accountLoadDebugger("Account Load Blank Team:", accountDataIn[i].name, " Team: ", accountDataIn[i].parentCode1);
        continue;
      }

      // delete old data
      await deleteAccount(found_team_id, accountDataIn[i]);

      if (accountDataIn[i].loadFlag == "true") {
        await loadAccount(found_team_id, found_teamShortName, accountDataIn[i]);
      }
    }
  }
};

async function loadAccount(t_id, tName, aData){
  try {   
    let account = await Account.findOne( { team_id: t_id }, { code: aData.code } );
    if (!account) {
       // New Account here
       let account = new Account({ 
           code: aData.code,
           name: aData.name,
           balance: aData.balance,
           deposits: aData.deposits,
           withdrawals: aData.withdrawals,
           owner: tName
        }); 

        let { error } = validateAccount(account); 
        if (error) {
          accountLoadDebugger("New Account Validate Error", account.code, error.message);
          return;
        }
        
        account.team_id  = t_id;

        account.save((err, account) => {
          if (err) return console.error(`New Account Save Error: ${err}`);
          accountLoadDebugger(account.owner + ", " + account.name + " add saved to accounts collection.");
        });
    } else {       
       // Existing Account here ... update
       let id = account._id;
      
       account.name          = aData.name;
       account.code          = aData.code;
       account.balance       = aData.balance;
       account.deposits      = aData.deposits;
       account.withdrawals   = aData.withdrawals;
       account.team_id       = t_id;
       account.owner         = tName;

       const { error } = validateAccount(account); 
       if (error) {
         accountLoadDebugger("Account Update Validate Error", aData.code, aData.name, aData.loadFlg, error.message);
         return
       }
   
       account.save((err, account) => {
       if (err) return console.error(`Account Update Save Error: ${err}`);
       accountLoadDebugger(account.owner + ", " + account.name + " update saved to accounts collection.");
       });
    }
  } catch (err) {
    accountLoadDebugger('Catch Account Error:', err.message);
    return;
}

};

async function deleteAccount(t_id, aData){
  try {
    let delErrorFlag = false;
    for await (let account of Account.find( { team_id: t_id , code: aData.code } )) {    
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
       accountLoadDebugger("All Accounts succesfully deleted for Code:", aData.code, t_id);
    } else {
       accountLoadDebugger("Some Error In Accounts delete for Code:", aData.code, t_id);
    }
  } catch (err) {
    accountLoadDebugger(`deleteAccount Error 2: ${err.message}`);
  }
};

module.exports = runAccountLoad;