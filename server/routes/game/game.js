const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');
const routeDebugger = require('debug')('app:routes:game');

// Mongoose Models - Used to save and validate objects into MongoDB
const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');
const { Team } = require('../../models/team/team');
const { Military } = require('../../models/ops/military/military')
const { Site } = require('../../models/sites/site');
const { Account } = require('../../models/gov/account');

// Game Systems - Used to run Game functions
const banking = require('../../wts/banking/banking');


// Report Classes - Used to log game interactions
const { DeploymentReport } = require('../../wts/reports/reportClasses');

// @route   PUT game/military/deploy
// @Desc    Deploy a group of units for a country
// @access  Public
router.put('/military/deploy', async function (req, res) {
  let { units, cost, destination, team } = req.body;
  console.log(req.body)
  let teamObj = await Team.findOne({name: team});
  let account = await Account.findOne({ name: 'Operations', team: teamObj._id })
  routeDebugger(`${teamObj.name} is attempting to deploy.`)
  routeDebugger(`Deployment cost: $M${cost} | Account Balance: $M${account.balance}`)
  if (account.balance < cost) {
    routeDebugger('Not enough funding to deploy units...')
    res.status(402).send(`Not enough funding! Assign ${cost - account.balance} more money teams operations account to deploy these units.`)
  } else {
    console.log(destination)
    let siteObj = await Site.findById(destination).populate('country').populate('zone');
    let unitArray = []

    for await (let unit of units) {
      let update = await Military.findById(unit)
      update.site = siteObj._id;
      update.country = siteObj.country._id;
      update.zone = siteObj.zone._id;
      unitArray.push(update._id);
      await update.save();
    }
 
    account = await banking.withdrawal(account, cost, `Unit deployment to ${siteObj.name} in ${siteObj.country.name}, ${unitArray.length} units deployed.`);
    await account.save();
    routeDebugger(account)

    let report = new DeploymentReport;
    
    report.team = teamObj._id
    report.site = siteObj._id;
    report.country = siteObj.country._id;
    report.zone = siteObj.zone._id;
    report.units = unitArray;
    report.cost = cost;

    report = await report.saveReport();

    // for await (let unit of units) {
    //   let update = await Military.findById(unit)
    //   unit.serviceRecord.push(report);
    //   await update.save();
    // }

    nexusEvent.emit('updateMilitary');    
    res.status(200).send(`Unit deployment to ${siteObj.name} in ${siteObj.country.name} succesful, ${unitArray.length} units deployed.`);
  }
})

// @route   PUT game/repairAircraft
// @desc    Update aircraft to max health
// @access  Public
router.put('/repairAircraft', async function (req, res) {
    let aircraft = await Aircraft.findById(req.body._id);
    console.log(req.body);
    console.log(aircraft);
    let account = await Account.findOne({ name: 'Operations', 'team': aircraft.team });
    if (account.balance < 2) {
      routeDebugger('Not enough funding...')
      res.status(402).send(`No Funding! Assign more money to your operations account to repair ${aircraft.name}.`)
    } else {
      account = await banking.withdrawal(account, 2, `Repairs for ${aircraft.name}`);
      await account.save();
      routeDebugger(account)
  
      aircraft.status.repair = true;
      aircraft.status.ready = false;
      await aircraft.save();

      routeDebugger(`${aircraft.name} put in for repairs...`)
  
      res.status(200).send(`${aircraft.name} put in for repairs...`);
      nexusEvent.emit('updateAircrafts');
    }
  });

  module.exports = router