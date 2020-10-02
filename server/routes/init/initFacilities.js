const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Facility } = require('../../models/facility');

// @route   GET init/initFacilities/lean
// @Desc    Get all facilitys/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: init/facilitidx requested...');
	try {
		const facilitys = await Facility.find().lean()
			.sort('code: 1');
		res.status(200).json(facilitys);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/initFacilities/:id
// @Desc    Get facilitys by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const facility = await Facility.findById(id);
		if (facility != null) {
			res.status(200).json(facility);
		}
		else {
			res.status(404).send(`The Facility with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initFacilities/code/:code
// @Desc    Get facilitys by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initFacilities/code/:code requested...');
	const code = req.params.code;

	try {
		const facility = await Facility.findOne({ code: code });
		if (facility != null) {
			res.status(200).json(facility);
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