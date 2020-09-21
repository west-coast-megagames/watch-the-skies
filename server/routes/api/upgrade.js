const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging

const { Upgrade } = require('../../models/gov/upgrade/upgrade');
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
	await addUpgrade(req.body.upgrade, req.body.unit);
	res.status(200).send(`Added "${req.body.upgrade.name}" to unit "${req.body.unit.name}"`);
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

module.exports = router;