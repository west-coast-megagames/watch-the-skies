const express = require('express');
const router = express.Router();
const { clearArrayValue } = require('../../middleware/util/arrayCalls');

const { Military } = require('../../models/military');
const { Site } = require('../../models/site');
const { Team } = require('../../models/team');

// Game Systems - Used to run Game functions
const nexusEvent = require('../../middleware/events/events');
// const { d6 } = require('../../../dataUtil/systems/dice');

// Report Classes - Used to log game interactions
const { runMilitary } = require('../../wts/military/military');

router.patch('/recall', async function (req, res) {
	for (const unit of await Military.find({ 'status.deployed': true })) {
		console.log(unit.name);
		await unit.recall();
	}
	nexusEvent.emit('updateMilitary');
	res.status(200).send('Military Units Recalled');
});

router.patch('/resethealth', async function (req, res) {
	for await (const unit of Military.find()) {
		console.log(`${unit.name} has ${unit.stats.health} health points`);
		unit.stats.health = unit.stats.healthMax;
		unit.status.destroyed = false;
		unit.stats.damaged = false;
		console.log(`${unit.name} now has ${unit.stats.health} health points`);
		await unit.save();
	}
	res.send('Military Health succesfully reset!');
	nexusEvent.emit('updateMilitary');
});

router.patch('/resetsites', async function (req, res) {
	for await (const site of Site.find()) {
		console.log(`Resetting ${site.name}`);
		await clearArrayValue(site.status, 'warzone');
		await clearArrayValue(site.status, 'occupied');
		site.occupier = await Team.findOne({ code: 'TCN' });
		await site.save();
	}
	console.log('All done');
	res.send('All sites succesfully reset!');
	nexusEvent.emit('updateSites');
});

router.patch('/resolve', async function (req, res) {
	await runMilitary();
	res.status(200).send('Battles resolved');
});


module.exports = router;