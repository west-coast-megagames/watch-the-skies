const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Zone } = require('../../models/zone');

// @route   GET init/zones/lean
// @Desc    Get all zones/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/zones requested...');
	try {
		const zones = await Zone.find().lean()
			.sort('code: 1');
		res.status(200).json(zones);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/zones/:id
// @Desc    Get zones by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const zone = await Zone.findById(id);
		if (zone != null) {
			res.status(200).json(zone);
		}
		else {
			res.status(404).send(`The Zone with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/zones/code/:code
// @Desc    Get zones by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/zones/code/:code requested...');
	const code = req.params.code;

	try {
		const zone = await Zone.findOne({ code: code });
		if (zone != null) {
			res.status(200).json(zone);
		}
		else {
			res.status(200).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;