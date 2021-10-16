const express = require('express');
const router = express.Router();
const { clearArrayValue, addArrayValue } = require('../../middleware/util/arrayCalls');

const { Military } = require('../../models/military');
const { Site } = require('../../models/site');
const { Team } = require('../../models/team');

// Game Systems - Used to run Game functions
const nexusEvent = require('../../middleware/events/events');
const { d6 } = require('../../../dataUtil/systems/dice');

// Report Classes - Used to log game interactions
const { runMilitary } = require('../../wts/military/military');

router.patch('/battleSim', async function (req, res) {
	let attackerTotal = 0;
	let defenderTotal = 0;
	let attackerResult = 0;
	let defenderResult = 0;
	let report = '';
	const { attackers, defenders } = req.body;
	for (let unit of attackers) {
		unit = await Military.findById(unit).populate('upgrades');
		attackerTotal = attackerTotal + unit.stats.attack;
	}
	// 2) calculate total defense value of attackers
	for (let unit of defenders) {
		unit = await Military.findById(unit).populate('upgrades');
		defenderTotal = defenderTotal + unit.stats.defense;
	}
	// 3) roll both sides and save results
	for (let i = 0; i < attackerTotal; i++) {
		const result = d6();
		if (result > 2) {
			attackerResult++;
		}
	}
	for (let i = 0; i < defenderTotal; i++) {
		const result = d6();
		if (result > 2) {
			defenderResult++;
		}
	}
	report += `Attacker hit ${attackerResult} out of ${attackerTotal} rolls!\nDefender hit ${defenderResult} out of ${defenderTotal}!\n`;
	res.status(200).send(report);
});

router.patch('/resolve', async function (req, res) {
	await runMilitary();
	res.status(200).send('Battles resolved');
});

router.patch('/recall', async function (req, res) {
	let mil = await Military.find();
	for (const unit of await mil.filter(el => el.status.some(el2 => el2 === 'deployed'))) {
		await unit.recall(true);
		await unit.endTurn();
	}
	res.status(200).send('Military Units Recalled');
});

router.patch('/resethealth', async function (req, res) {
	for await (const unit of Military.find()) {
		console.log(`${unit.name} has ${unit.stats.health} health points`);
		unit.stats.health = unit.stats.healthMax;
		await clearArrayValue(unit.status, 'destroyed');
		await clearArrayValue(unit.status, 'damaged');
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