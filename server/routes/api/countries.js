const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Country } = require('../../models/country');

// @route   GET api/counties
// @Desc    Get all countries
// @access  Public
router.get('/', async (req, res) => {
	logger.info('GET Route: api/countries requested...');
	try {
		const countries = await Country.find()
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('borderedBy', 'name')
			.sort('code: 1');
		res.status(200).json(countries);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/counties/:key/:value
// @Desc    Get by property
// @access  Public
router.get('/:key/:value', async (req, res) => {
	logger.info('GET Route: api/countries requested...');
	const query = {};
	query[req.params.key] = req.params.value;

	try {
		const countries = await Country.find(query)
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('borderedBy', 'name')
			.sort('code: 1');
		res.status(200).json(countries);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/countries/:id
// @Desc    Get countries by id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	try {
		const country = await Country.findById(id)
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('borderedBy', 'name');
		if (country != null) {
			res.status(200).json(country);
		}
		else {
			res.status(404).send(`The country with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// TODO: Add GET route that allows for getting by discriminator

// @route   POST api/countries
// @Desc    Create New Country
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/countries call made...');
	const { code } = req.body;

	try {
		let newCountry = new Country(req.body);
		await newCountry.validateCountry();
		const docs = await Country.find({ code });

		if (docs.length < 1) {
			newCountry = await newCountry.save();
			res.status(200).json(newCountry);
			logger.info(`The country ${newCountry.name} created...`);
		}
		else {
			nexusError(`A country with the code ${newCountry.code} already exists!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/countries/:id
// @Desc    Update Existing Country
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/contries/:id call made...');
	const id = req.params.id;

	try {
		const country = await Country.findByIdAndRemove(id);

		if (country != null) {
			logger.info(`The country ${country.name} with the id ${id} was deleted!`);
			res.status(200).json(country);
		}
		else {
			nexusError(`The Country with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/countries/deleteAll
// @desc    Delete All Countrys
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	try {
		await Country.deleteMany();
		res.status(200).send('All Countrys succesfully deleted!');
	}
	catch (err) {
		console.log(`Error: ${err.message}`);
		res.status(400).send(`Error: ${err.message}`);
	}
});

module.exports = router;