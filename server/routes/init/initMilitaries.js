const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Military } = require('../../models/military');

// @route   GET init/militarys/lean
// @Desc    Get all militarys/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/militarys requested...');
	try {
		const militarys = await Military.find().lean()
			.sort('code: 1');
		res.status(200).json(militarys);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/militarys/:id
// @Desc    Get militarys by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const military = await Military.findById(id);
		if (military != null) {
			res.status(200).json(military);
		}
		else {
			res.status(404).send(`The Military with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/militarys/name/:name
// @Desc    Get militarys by name
// @access  Public
router.get('/name/:name', async (req, res) => {
	logger.info('GET Route: init/militarys/name/:name requested...');
	const name = req.params.name;

	try {
		const military = await Military.findOne({ name: name });
		if (military != null) {
			res.status(200).json(military);
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