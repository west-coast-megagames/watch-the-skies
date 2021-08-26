const express = require('express');
const router = express.Router();
const nexusEvent = require('../middleware/events/events');
const routeDebugger = require('debug')('app:routes:debug');
const { logger } = require('../middleware/log/winston');

const { startResearch, assignKnowledgeCredit } = require('../wts/research/research');

const { Upgrade } = require('../models/upgrade');
const { Team } = require('../models/team');
const { Facility } = require('../models/facility');
const { Aircraft } = require('../models/aircraft');
const { Intel, generateIntel } = require('../models/intel');
const { upgradeValue, addUpgrade } = require('../wts/upgrades/upgrades');
const badwordsArray = require('../middleware/badWords');

const { rand } = require('../util/systems/dice');
const { resolveMissions } = require('../wts/intercept/missions');

// @route   PATCH debug/research
// @desc    Trigger the research system
// @access  Public
router.patch('/research', async function (req, res) {
	startResearch();
	res.status(200).send('We triggered the research system!');
});

// @route   PATCH debug/intel
// @desc    Trigger Intel
// @access  Public
router.post('/intel', async function (req, res) {
	const { model, _id, teamCode } = req.body;
	const team = await Team.findOne({ code: teamCode });
	let doc = {};
	let intelFile = await generateIntel(team._id, _id);
	switch(model) {
	case 'Aircraft':
		doc = await Aircraft.findById(_id);
		intelFile = await intelFile.reconIntel(doc.toObject(), 'DebugRoute');
		break;
	default:
		console.log(`No ${model} case`);
	}

	res.status(200).send({ intelFile, original: doc });
});

// @route   PATCH debug/knowledge
// @desc    Trigger the research knowledge credit system
// @access  Public
router.patch('/knowledge', async function (req, res) {
	assignKnowledgeCredit();
	res.status(200).send('We triggered the research credit system!');
});

router.patch('/fixFacilities', async function (req, res) {
	let count = 0;
	for await (const facility of Facility.find()) {
		const { research, airMission, storage, manufacturing, naval, ground } = facility.capability;
		if (research.capacity > 0) {
			research.status.damage = [];
			research.status.pending = [];
			research.funding = [];
			for (let i = 0; i < research.capacity; i++) {
				research.status.damage.set(i, false);
				research.funding.set(i, 0);
				research.status.pending.set(i, false);
			}
			research.active = true;
			research.sciRate = rand(25);
			research.sciBonus = 0;
		}
		if (airMission.capacity > 0) airMission.active = true;
		if (storage.capacity > 0) storage.active = true;
		if (manufacturing.capacity > 0) manufacturing.active = true;
		if (naval.capacity > 0) naval.active = true;
		if (ground.capacity > 0) ground.active = true;

		routeDebugger(facility.capability);

		logger.info(`${facility.name} - research: ${research.active}`);
		logger.info(`${facility.name} - airMission: ${airMission.active}`);
		logger.info(`${facility.name} - storage: ${storage.active}`);
		logger.info(`${facility.name} - manufacturing: ${manufacturing.active}`);
		logger.info(`${facility.name} - naval: ${naval.active}`);
		logger.info(`${facility.name} - ground: ${ground.active}`);

		await facility.save();
		count++;
	}
	return res.status(200).send(`We handled ${count} facilities...`);
});

// @route   PATCH debug/missions
// @desc    Trigger the air mission system
// @access  Public
router.patch('/missions', async function (req, res) {
	resolveMissions();
	res.status(200).send('Triggered air missions!');
});

// @route   PATCH debug/return/aliens
// @desc    Update all aircrafts to be not be deployed
// @access  Public
router.patch('/return/aliens', async function (req, res) {
	let count = 0;
	let aircrafts = await Aircraft.find().populate('team');
	aircrafts = aircrafts.filter((i) => i.team.type === 'Alien');
	for await (const aircraft of aircrafts) {
		if (aircraft.status.deployed === true) {
			count++;
			aircraft.status.deployed = false;
			await aircraft.save();
		}
	}
	if (count === 0) {
		res.status(200).send('No alien crafts available to return to base...');
	}
	else {
		res.status(200).send(`${count} alien crafts have returned to base...`);
	}
	nexusEvent.emit('updateAircrafts');
});

// @route   PATCH debug/return/aircraft
// @desc    Update all aircrafts to return to base
// @access  Public
router.patch('/return/aircrafts', async function (req, res) {
	routeDebugger('Returning all aircraft to base!');
	let count = 0;
	for await (const aircraft of await Aircraft.find()) {
		const response = await aircraft.recall();
		routeDebugger(response);
		count++;
	}
	res.status(200).send(`${count} aircrafts succesfully returned!`);
	nexusEvent.emit('updateAircrafts');
});

router.get('/badword', async function (req, res) {
	const { word } = req.body;
	if (badwordsArray.includes(word)) {
		res.send(`${word} is a bad word!`);
	}
	else {
		res.send(`''${word}'' might not be a bad word!`);
	}
});

module.exports = router;