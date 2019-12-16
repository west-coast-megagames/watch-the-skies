const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initAccounts.json', 'utf8');
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

async function runAccountLoad(runFlag){
  if (!runFlag) return false;
  if (runFlag) await initLoad(runFlag);
  return true;
};

async function initLoad(doLoad) {
  
  if (!doLoad) return;

  // delete ALL old data
  //accountLoadDebugger("Jeff before delete ");
  //await countAccount();   // how many records
  await deleteAccount();
  //accountLoadDebugger("Jeff after delete ");
  //await countAccount();   // how many records

  for (let i = 0; i < accountDataIn.length; ++i ) {
    
    //accountLoadDebugger("Jeff in runAccountLoad loop", i, accountDataIn[i].parentCode1, accountDataIn[i].name);    
    //await countAccount();   // how many records

    if (accountDataIn[i].loadType == "accounts") {     
      
      if (accountDataIn[i].parentCode1 != ""){
        let team = await Team.findOne({ teamCode: accountDataIn[i].parentCode1 });  
        if (!team) {
          accountLoadDebugger("Account Load Team Error:", accountDataIn[i].name, " Team: ", accountDataIn[i].parentCode1);
          continue;
        } else {
          found_team_id       = team._id;
          found_teamShortName = team.shortName;
          found_teamCode      = team.teamCode;
        }  
      } else {
        accountLoadDebugger("Account Load Blank Team:", accountDataIn[i].name, " Team: ", accountDataIn[i].parentCode1);
        continue;
      }

      if (accountDataIn[i].loadFlag == "true") {
        await loadAccount(found_team_id, found_teamShortName, found_teamCode, accountDataIn[i]);
      }
    }
  }
};

async function loadAccount(t_id, tName, tCode, aData){
  try {   
    let bigCode = aData.code.toUpperCase();
    let account = await Account.findOne({ team_id: t_id, code: bigCode });

    //accountLoadDebugger("Account Load function ... code", aData.code, bigCode, "t_id", t_id, (!account));

    if (!account) {
       // New Account here
       let account = new Account({ 
           code: bigCode,
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
        
        account.team.team_id  = t_id;
        account.team.teamCode = tCode;

        //accountLoadDebugger("Account before new save ... code", account.code, "t_id", t_id);
        //account.markModified('code');
      
        await account.save((err, account) => {
          if (err) return console.error(`New Account Save Error: ${err}`);
          accountLoadDebugger(account.owner + ", " + account.name + " New add saved to accounts collection.");
        });
        
        //accountLoadDebugger("Account after new save ... code", account.code, "t_id", account.team_id);
        //await countAccount();   // how many records

    } else {       
       // Existing Account here ... update
       let id = account._id;
      
       account.name          = aData.name;
       account.code          = bigCode;
       account.balance       = aData.balance;
       account.deposits      = aData.deposits;
       account.withdrawals   = aData.withdrawals;
       account.owner         = tName;
       account.team.team_id  = t_id;
       account.team.teamCode = tCode;

       const { error } = validateAccount(account); 
       if (error) {
         accountLoadDebugger("Account Update Validate Error", aData.code, aData.name, aData.loadFlg, error.message);
         return
       }
       //account.markModified('code');
       //accountLoadDebugger("Account before Update save ... code", account.code, "t_id", t_id);

       await account.save((err, account) => {
       if (err) return console.error(`Account Update Save Error: ${err}`);
       accountLoadDebugger(account.owner + ", " + account.name + " update saved to accounts collection. ");
       });

       //accountLoadDebugger("Account After Update save ... code", account.code, "t_id", account.team_id);
       //await countAccount();   // how many records

    }
  } catch (err) {
    accountLoadDebugger('Catch Account Error:', err.message);
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

async function countAccount(){
  try {
    let account = await Account.find();
    
    let countRec = account.length;
      
    accountLoadDebugger("Accounts collection Record Count:", countRec);
    
  } catch (err) {
    accountLoadDebugger(`countAccount Error 2: ${err.message}`);
  }
};

module.exports = runAccountLoad;