const express = require('express');
const router = express.Router();
// const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging

// const validateObjectId = require('../../middleware/util/validateObjectId');
const { upgradeValue } = require('../../wts/upgrades/upgrades');

// @route   GET game/upgrades/stat
// @Desc    get the total stat contribution of a specific stat from an upgrade array
// @access  Public
router.get('/stat', async function (req, res) {
	const z = await upgradeValue(req.body.upgrades, req.body.desiredStat);
	res.status(200).send(`The result is: ${z}`);
});

module.exports = router;