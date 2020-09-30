const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');

// Mongoose Model Import
const { Country } = require('../../models/country');

// @route   GET init/countries/lean
// @Desc    Get all countrys/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: api/countrys requested...');
	try {
		const countrys = await Country.find().lean()
			.sort('code: 1');
		res.status(200).json(countrys);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/initCountries/code/:code
// @Desc    Get Country by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initCountries/code/:code requested...');
	const code = req.params.code;

	try {
		const country = await Country.findOne({ code: code });
		if (country != null) {
			res.status(200).json(country);
		}
		else {
			res.status(200).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/countries/:id
// @Desc    Get countrys by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const country = await Country.findById(id);
		if (country != null) {
			res.status(200).json(country);
		}
		else {
			res.status(404).send(`The Country with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   Patch init/countries/borderedBy/:id
// @Desc    Update borderedBy for Country
// @access  Public
router.patch('/borderedBy/:id', validateObjectId, async (req, res) => {
	logger.info('Patch Route: init/countries/borderedBy requested...');
	const id = req.params.id;
	const updBorderedBy = req.body;

	try {
		const country = await Country.findById(id);
		if (country != null) {
			country.borderedBy = updBorderedBy;
			const updCountry = await country.save();
			res.status(200).json(updCountry);
			logger.info(`Borderedby for Country ${updCountry.code} updated...`);
		}
		else {
			logger.error(`Failed to update Borderedby for Country ${id}`);
			res.status(400).json({ type: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;