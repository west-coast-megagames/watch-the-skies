const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

const nexusEvent = require('../../middleware/events/events');
const { clearArrayValue } = require('../../middleware/util/arrayCalls');

// Mongoose Models - Database models
const { Aircraft } = require('../../models/aircraft');
const { Account } = require('../../models/account');
const { Facility } = require('../../models/facility');
const { Team } = require('../../models/team');

const { loadTech, techSeed } = require('../../wts/research/techTree');
const { loadKnowledge, knowledgeSeed } = require('../../wts/research/knowledge');
const { Site } = require('../../models/site');

// @route   PATCH game/admin/resethull
// @desc    Update all aircrafts to max health
// @access  Public
router.patch('/resethull', async function (req, res) {
	for await (const aircraft of Aircraft.find()) {
		console.log(`${aircraft.name} has ${aircraft.stats.hull} hull points`);
		aircraft.stats.hull = aircraft.stats.hullMax;
		await clearArrayValue(aircraft.status, 'destroyed');
		console.log(`${aircraft.name} now has ${aircraft.stats.hull} hull points`);
		await aircraft.save();
	}
	res.send('Aircrafts succesfully reset!');
	nexusEvent.emit('updateAircrafts');
});

// @route   PATCH game/admin/resetLabs
// @desc    Update all labs to empty
// @access  Public
router.patch('/resetLabs', async function (req, res) {
	for await (const lab of Facility.find({ type: 'Lab' })) {
		logger.info(`${lab.name} has ${lab.research.length} projects`);
		lab.research = [];
		logger.info(`${lab.name} now has ${lab.research.length} projects`);
		await lab.save();
	}
	res.status(200).send('Labs succesfully reset!');
	nexusEvent.emit('updateFacilities');
});

// @route   PATCH game/admin/pr
// @desc    Update all teams to base PR
// @access  Public
router.patch('/pr', async function (req, res) {
	for await (const team of Team.find()) {
		const { prLevel, name } = team;
		console.log(`${name} | PR: ${prLevel}`);
		console.log(`Resetting ${name}s accounts...`);
		team.prLevel = 2;
		console.log(`PR Level set to ${prLevel}`);

		console.log(`${team.name} | PR: ${team.prLevel}`);

		await team.save();
		console.log(`${name}s accounts reset...`);
	}
	res.send('Accounts succesfully reset!');
});

// @route   PATCH game/admin/load/tech
// @Desc    Load all technology from JSON files
// @access  Public
router.patch('/load/tech', async function (req, res) {
	const response = await loadTech();
	nexusEvent.emit('updateResearch');
	return res.status(200).send(response);
});

// TODO John Review if balance, deposits and withdrawals need to be swithed to resources
// @route   PATCH game/admin/accounts/reset
// @desc    Update all teams to base income and PR
// @access  Public
router.patch('/accounts/reset', async function (req, res) {
	for await (const account of Account.find()) {

		account.resources = [];
		const resource = 'Megabucks';
		if (account.code === "TRE") {
	  	account.resources.push({ type: resource, balance: 1000 });
		}
		else {
			account.resources.push({ type: resource, balance: 0 });
		}

		await account.save();
		logger.info(`${account.owner}'s ${account.name} reset...`);
	}
	res.send('Accounts succesfully reset!');

	nexusEvent.emit('updateAccounts');
});

// @route   PATCH game/admin/load/knowledge
// @Desc    Load all knowledge fields from JSON files
// @access  Public
router.patch('/load/knowledge', async function (req, res) {
	const response = await loadKnowledge(); // Loads all knowledge into the server
	nexusEvent.emit('updateResearch');
	return res.status(200).send(response);
});

// @route   PATCH api/research/load/knowledge/seed
// @Desc    Load all knowledge fields from JSON files
// @access  Public
router.patch('/load/knowledge/seed', async function (req, res) {
	const response = await knowledgeSeed();
	nexusEvent.emit('updateResearch');
	return res.status(200).send(`We did it, such a knowledge seed!: ${response}`);
});

// @route   PATCH api/research/load/tech/seed
// @Desc    Load all technology from JSON files
// @access  Public
router.patch('/load/tech/seed', async function (req, res) {
	const response = await techSeed();
	nexusEvent.emit('updateResearch');
	return res.status(200).send(`We did it, we seeded Technology: ${response}`);
});

router.get('/test', async function (req, res) {
	let count = 0;
	for (const site of await Site.find({ 'status': 'warzone', 'hidden': false })) {
		console.log(site);
		count++;
		if (site.subType === 'Point of Interest') {
			site.hidden = true;
			console.log('Site hidden');
		}
		else {
			await clearArrayValue(site.status, 'warzone');
			
	  	console.log('Site De-Warzoned');
		}
		await site.save();
	}

	return res.status(200).send(`Number of Sites: ${count}`);
});


module.exports = router;
