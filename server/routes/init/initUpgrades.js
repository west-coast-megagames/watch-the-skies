const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');
const { newUpgrade } = require('../../wts/construction/construction');

// Mongoose Model Import
const { Upgrade } = require('../../models/upgrade');

// @route   GET init/upgrades/lean
// @Desc    Get all upgrades/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/upgrades requested...');
	try {
		const upgrades = await Upgrade.find().lean()
			.sort('code: 1');
		res.status(200).json(upgrades);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/upgrades/:id
// @Desc    Get upgrades by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const upgrade = await Upgrade.findById(id);
		if (upgrade != null) {
			res.status(200).json(upgrade);
		}
		else {
			res.status(404).send(`The Upgrade with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/upgrades/code/:code
// @Desc    Get upgrades by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/upgrades/code/:code requested...');
	const code = req.params.code;

	try {
		const upgrade = await Upgrade.findOne({ code: code });
		if (upgrade != null) {
			res.status(200).json(upgrade);
		}
		else {
			res.status(200).json({ unitType: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initUpgrades/validate/:id
// @Desc    Validate upgrade with id
// @access  Public
router.get('/validate/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const upgrade = await Upgrade.findById(id);
		if (upgrade != null) {
			try {
				await upgrade.validateUpgrade();
				res.status(200).json(upgrade);
			}
			catch(err) {
				res.status(200).send(`Upgrade validation Error! ${err.message}`);
			}
		}
		else {
			res.status(404).send(`Upgrade with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

router.post('/build', async function (req, res) {
	const { code, team, facility } = req.body; // please give me these things

	try {
		let upgrade = await newUpgrade(code, team, facility); // just the facility ID
		upgrade.status.building = false;	// init upgrades are assumed to be built
		upgrade = await upgrade.save();

		res.status(200).json(upgrade);
	}
	catch (err) {
		res.status(404).send(err.message); // This returns a really weird json... watch out for that
	}
});

module.exports = router;