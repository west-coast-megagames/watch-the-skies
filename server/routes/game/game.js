const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');
const routeDebugger = require('debug')('app:routes:interceptor');

const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');
const { Account } = require('../../models/gov/account');

const banking = require('../../wts/banking/banking')

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