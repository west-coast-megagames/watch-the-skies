const express = require('express');
const router = express.Router();
const { UpgradeBlueprint } = require('../../models/blueprint');
const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging
const { Upgrade } = require('../../models/upgrade');
const nexusEvent = require('../../middleware/events/events');
const nexusError = require('../../middleware/util/throwError');
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const { Team } = require('../../models/team');
const { Facility } = require('../../models/facility');

// @route   GET api/upgrades
// @Desc    Get all Upgrades
// @access  Public
router.get('/', async function (req, res) {
	const upgrades = await Upgrade.find();
	res.status(200).json(upgrades);
});

// @route   GET api/upgrades/:id
// @Desc    Get all Upgrades
// @access  Public
router.get(':id', async function (req, res) {
	const upgrades = await Upgrade.findById({ _id: req.params.id });
	res.status(200).json(upgrades);
});

// @route   POST api/upgrades/stat
// @Desc    add an upgrade to a unit
// @access  Public
router.post('/', async function (req, res) {
	const { code } = req.body; // please give me these things
	const team = await Team.findOne({ code: 'TCN' });
	const facility = await Facility.findOne();
	try {
		const blue = await UpgradeBlueprint.findOne({ code: code });

		if (!blue) nexusError(`Could not find Blueprint of ${code}`, 404);
		let upgrade = new Upgrade();
		upgrade.team = team;
		upgrade.facility = facility;
		upgrade.name = blue.name;
		upgrade.cost = blue.cost;
		upgrade.buildTime = blue.buildTime;
		upgrade.desc = blue.desc;
		upgrade.prereq = blue.prereq;
		upgrade.effects = blue.effects;

		upgrade = await upgrade.save();

		res.status(200).json(upgrade);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/upgrades/:id
// @Desc    Delete a upgrades
// @access  Public
router.delete('/:id', validateObjectId, async function (req, res) {// Scott has not tested this. Bad Scott
	const id = req.params.id;
	const upgrade = await Upgrade.findByIdAndRemove(id);
	if (upgrade != null) {
		logger.info(`${upgrade.name} with the id ${id} was deleted!`);
		nexusEvent.emit('updateMilitary');
		res.status(200).send(`${upgrade.name} with the id ${id} was deleted!`);
	}
	else {
		res.status(404).send(`No upgrade with the id ${id} exists!`);
	}
});

// @route   PATCH api/upgrades/deleteAll
// @desc    Delete All Upgrades
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Upgrade.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Upgrades!`);
});

module.exports = router;