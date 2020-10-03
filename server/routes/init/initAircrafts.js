const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Aircraft } = require('../../models/aircraft');

// @route   GET init/aircrafts/lean
// @Desc    Get all aircrafts/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/aircrafts requested...');
	try {
		const aircrafts = await Aircraft.find().lean()
			.sort('code: 1');
		res.status(200).json(aircrafts);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/aircrafts/:id
// @Desc    Get aircrafts by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const aircraft = await Aircraft.findById(id);
		if (aircraft != null) {
			res.status(200).json(aircraft);
		}
		else {
			res.status(404).send(`The Aircraft with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/aircrafts/name/:name
// @Desc    Get aircrafts by name
// @access  Public
router.get('/name/:name', async (req, res) => {
	logger.info('GET Route: init/aircrafts/name/:name requested...');
	const name = req.params.code;

	try {
		const aircraft = await Aircraft.findOne({ name: name });
		if (aircraft != null) {
			res.status(200).json(aircraft);
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