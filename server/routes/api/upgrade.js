const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/util/validateObjectId');
const { newUpgrade } = require('../../wts/construction/construction');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging

const { Upgrade } = require('../../models/upgrade');
const { addUpgrade } = require('../../wts/upgrades/upgrades');

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
	const { code, team, facility } = req.body; // please give me these things

	try {
		let upgrade = await newUpgrade(code, team, facility); // just the facility ID
		upgrade = await upgrade.save();

		res.status(200).json(upgrade);
	}
	catch (err) {
		res.status(404).send(err.message); // This returns a really weird json... watch out for that
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