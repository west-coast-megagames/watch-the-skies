const express = require('express');
const router = express.Router();
// const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging
const nexusEvent = require('../../middleware/events/events');

// const validateObjectId = require('../../middleware/util/validateObjectId');
const { newUpgrade } = require('../../wts/construction/construction');
const { upgradeValue, removeUpgrade, addUpgrade } = require('../../wts/upgrades/upgrades');

const { Military } = require('../../models/military');
const { Upgrade } = require('../../models/upgrade');
const banking = require('../../wts/banking/banking');
const { Account } = require('../../models/account');

// @route   GET game/upgrades/stat
// @Desc    get the total stat contribution of a specific stat from an upgrade array
// @access  Public
router.get('/stat', async function (req, res) {
	const z = await upgradeValue(req.body.upgrades, req.body.desiredStat);
	res.status(200).send(`The result is: ${z}`);
});

// moved to socket
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
	try {
		let upgrade = await newUpgrade(req.body); // just the facility ID
		upgrade = await upgrade.save();
		nexusEvent.emit('updateUpgrades');
		res.status(200).json(upgrade);
	}
	catch (err) {
		res.status(404).send(err.message); // This returns a really weird json... watch out for that
	}
});

router.put('/repair', async function (req, res) {
	const upgrade = await Upgrade.findById(req.body._id);

	let account = await Account.findOne({
		name: 'Operations',
		team: upgrade.team
	});
	if (account.balance < 2) {
		res
			.status(402)
			.send(
				`No Funding! Assign more money to your operations account to repair ${upgrade.name}.`
			);
	}
	else {
		account = await banking.withdrawal(
			account,
			2,
			`Repairs for ${upgrade.name}`
		);
		await account.save();

		// upgrade.status.repair = true;
		// upgrade.status.ready = false;
		upgrade.status.destroyed = false;
		upgrade.status.damaged = false;
		await upgrade.save();

		res.status(200).send(`${upgrade.name} put in for repairs...`);
		nexusEvent.emit('updateUpgrades');
	}
});

module.exports = router;