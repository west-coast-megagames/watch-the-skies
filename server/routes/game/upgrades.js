const express = require('express');
const router = express.Router();
// const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging
const nexusEvent = require('../../middleware/events/events');

// const validateObjectId = require('../../middleware/util/validateObjectId');
const { newUpgrade } = require('../../wts/construction/construction');
const { upgradeValue, removeUpgrade, addUpgrade } = require('../../wts/upgrades/upgrades');

const { Military } = require('../../models/military');
const { Upgrade } = require('../../models/upgrade');

// @route   GET game/upgrades/stat
// @Desc    get the total stat contribution of a specific stat from an upgrade array
// @access  Public
router.get('/stat', async function (req, res) {
	const z = await upgradeValue(req.body.upgrades, req.body.desiredStat);
	res.status(200).send(`The result is: ${z}`);
});


router.put('/add', async function (req, res) {
	let { upgrade, unit } = req.body;
	upgrade = await Upgrade.findById(upgrade);
	unit = await Military.findById(unit);
	const response = await addUpgrade(upgrade, unit);
	nexusEvent.emit('updateMilitary');
	nexusEvent.emit('updateUpgrades');
	res.status(200).send(response);
});

// @route   POST game/upgrades/remove
// @Desc    remove an upgrade from a unit
// @access  Public
router.put('/remove', async function (req, res) {
	const response = await removeUpgrade(req.body.upgrade, req.body.unit);
	nexusEvent.emit('updateMilitary');
	nexusEvent.emit('updateUpgrades');
	res.status(200).send(response);
});

router.post('/build', async function (req, res) {
	const { code, team, facility } = req.body; // please give me these things

	try {
		let upgrade = await newUpgrade(code, team, facility); // just the facility ID
		upgrade = await upgrade.save();
		nexusEvent.emit('updateUpgrades');
		res.status(200).json(upgrade);
	}
	catch (err) {
		res.status(404).send(err.message); // This returns a really weird json... watch out for that
	}
});

module.exports = router;