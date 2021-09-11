const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');
const airMission = require('../../wts/intercept/missions');
const nexusEvent = require('../../middleware/events/events');
const nexusError = require('../../middleware/util/throwError');
const { clearArrayValue, addArrayValue } = require('../../middleware/util/arrayCalls');

const { Account } = require('../../models/account');
const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { Site } = require('../../models/site');

const { newUnit } = require('../../wts/construction/construction');
const randomCords = require('../../util/systems/lz');
const terror = require('../../wts/terror/terror');

// @route   PUT game/aircrafts   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async (req, res) => {
	let result = '';
	let { aircraft, target } = req.body;
	const { mission } = req.body;
	routeDebugger(req.body);

	aircraft = await Aircraft.findById(aircraft).populate('upgrades').populate('site').populate('origin').populate('team');

	if (mission === 'Interception' || mission === 'Escort' || mission === 'Recon Aircraft') {
		target = await Aircraft.findById(target).populate('upgrades').populate('site');
		aircraft.site = target.site._id;
		aircraft.location = randomCords(target.site.geoDecimal.lat, target.site.geoDecimal.lng);
	}
	else if (mission === 'Diversion' || mission === 'Transport' || mission === 'Recon Site' || mission === 'Patrol') {
		target = await Site.findById(target);
		aircraft.site = target._id;
		aircraft.location = randomCords(target.geoDecimal.lat, target.geoDecimal.lng);
	}

	if (aircraft.team.type === 'Alien') terror.alienActivity(aircraft.site, 'Air');

	result = `${aircraft.name} launching...`;
	aircraft.organization = target.organization;
	aircraft.zone = target.zone;
	aircraft.mission = mission;

	aircraft = await aircraft.launch(mission); // Changes attacker status
	result = `${result} ${aircraft.name} en route to attempt ${mission.toLowerCase()}.`;

	await airMission.start(aircraft, target, mission);
	routeDebugger(result);
	res.status(200).send(result);
	nexusEvent.emit('updateAircrafts');
});

// @route   POST game/aircrafts/build
// @Desc    Takes in blueprint and name and facility(?) and starts construction on a new aircraft
// @access  Public
// currently not used by frontend
router.post('/build', async (req, res) => {
	const { name, facility, type, team } = req.body; // please give me these things
	try {
		const aircraft = await newUnit(name, facility, type, team); // just the facility ID
		res.status(200).send(aircraft);
	}
	catch (err) {
		res.status(404).send(err);
	}
});

// @route   POST game/aircrafts/transfer
// @Desc
// @access  Public
// currently not used by frontend
router.put('/transfer', async (req, res) => {// work in progress, still broken
	let { aircraft } = req.body; // please give me these things
	const { facility } = req.body;
	try {
		const target = await Facility.findById(facility).populate('site');
		aircraft = await Aircraft.findById(aircraft);
		if (!aircraft || aircraft == null) {
			nexusError('Could not find aircraft!', 404);
		}

		await addArrayValue(aircraft.status, 'deployed');
		await clearArrayValue(aircraft.status, 'ready');
		aircraft.site = target._id;

		const mission = 'Transfer';
		aircraft.mission = mission;
		aircraft.origin = facility._id;

		aircraft = await aircraft.save();
		await airMission.start(aircraft, target, mission);

		res.status(200).send(`Transfer of ${aircraft.name} to ${target.name} initiated...`);
	}
	catch (err) {
		res.status(400).send(`Error in transfer route: ${err}`);
	}
});

// @route   PUT game/aircrafts/repair
// @desc    Update aircraft to max health
// @access  Public
router.put('/repair', async function (req, res) {
	const aircraft = await Aircraft.findById(req.body._id);
	console.log(req.body);
	console.log(aircraft);
	let account = await Account.findOne({
		name: 'Operations',
		team: aircraft.team
	});
	if (account.balance < 2) {
		routeDebugger('Not enough funding...');
		res
			.status(402)
			.send(
				`No Funding! Assign more money to your operations account to repair ${aircraft.name}.`
			);
	}
	else {
		account = await account.withdrawal({ from: account, amount: 2, note: `Repairs for ${aircraft.name}` });
		routeDebugger(account);

		await addArrayValue(aircraft.status, 'repair');
    await clearArrayValue(aircraft.status, 'ready');
		await aircraft.save();

		routeDebugger(`${aircraft.name} put in for repairs...`);

		res.status(200).send(`${aircraft.name} put in for repairs...`);
		nexusEvent.emit('updateAircrafts');
	}
});

module.exports = router;