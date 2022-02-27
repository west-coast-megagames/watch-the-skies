const express = require('express');
const router = express.Router();
const nexusEvent = require('../middleware/events/events');
const routeDebugger = require('debug')('app:routes:debug');
const { logger } = require('../middleware/log/winston');
const { clearArrayValue, inArray } = require('../middleware/util/arrayCalls');

const { startResearch, assignKnowledgeCredit } = require('../wts/research/research');

const { Upgrade } = require('../models/upgrade');
const { Team } = require('../models/team');
const { Facility } = require('../models/facility');
const { Aircraft } = require('../models/aircraft');
const { Military } = require('../models/military');
const { Intel } = require('../models/intel');
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

// @route   PATCH debug/mobilize
// @desc    Trigger mobilize sequence
// @access  Public
router.patch('/mobilize', async function (req, res) {
	let count = 0;
	const military = await Military.findOne();
	military.mobilize();
	res.status(200).send(`${military.name} mobilized.`);
});

// @route   PATCH debug/endTurn
// @desc    Trigger endTurn sequence
// @access  Public
router.patch('/endTurn', async function (req, res) {
	let count = 0;
	const military = await Military.find();
	for (let unit of military) {
		try{
			await unit.endTurn();
			count++;
		} catch (err) {
			logger.error(`${err.message}`, {
				meta: err.stack
			});
		}
	}
	res.status(200).send(`${count} objects iterated over for endTurn`);
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
		// old code: const { research, airMission, storage, manufacturing, naval, ground } = facility.capabilities;
		if (await inArray(facility.capabilities, 'research')) {
			// TODO John ... need to reset stats on building with research type???
			/*
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
			*/
		}
		// TODO John .. reset what?
		/*
		if (await inArray(facility.capabilities, 'hanger')) airMission.active = true;
		if (await inArray(facility.capabilities, 'storage') storage.active = true;
		if (await inArray(facility.capabilities, 'manufacturing') manufacturing.active = true;
		if (await inArray(facility.capabilities, 'port') naval.active = true;
		if (await inArray(facility.capabilities, 'garrison') ground.active = true;
		*/

		routeDebugger(facility.capabilities);

		/* TODO John
		logger.info(`${facility.name} - research: ${research.active}`);
		logger.info(`${facility.name} - airMission: ${airMission.active}`);
		logger.info(`${facility.name} - storage: ${storage.active}`);
		logger.info(`${facility.name} - manufacturing: ${manufacturing.active}`);
		logger.info(`${facility.name} - naval: ${naval.active}`);
		logger.info(`${facility.name} - ground: ${ground.active}`);
		*/

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
		if (aircraft.status.some(el => el === 'deployed')) {
			count++;
			await clearArrayValue(aircraft.status, 'deployed');

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
	for await (const aircraft of await Aircraft.find().where('status').in(['deployed'])) {
		const response = await aircraft.recall();
		routeDebugger(response);
		count++;
	}
	res.status(200).send(`${count} aircrafts succesfully returned!`);
	nexusEvent.emit('updateAircrafts');
});

// @route   PATCH debug/return/military
// @desc    Update all aircrafts to return to base
// @access  Public
router.patch('/return/military', async function (req, res) {
	routeDebugger('Returning all military base!');
	let count = 0;
	for await (const military of await Military.find()) {
		const response = await military.recall(true);
		count++;
	}
	res.status(200).send(`${count} military succesfully returned!`);
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