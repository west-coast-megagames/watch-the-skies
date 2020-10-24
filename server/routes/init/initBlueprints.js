const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Blueprint } = require('../../models/blueprint');

// @route   GET init/initBlueprints/lean
// @Desc    Get all blueprints/lean
// @access  Public
router.get('/lean', async (req, res) => {
	// logger.info('GET lean Route: init/initBlueprints requested...');
	try {
		const blueprints = await Blueprint.find().lean()
			.sort('code: 1');
		res.status(200).json(blueprints);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET init/initBlueprint/:id
// @Desc    Get blueprints by id
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/blueprint/:id requested...');
	const id = req.params.id;

	try {
		const blueprint = await Blueprint.findById(req.blueprint._id).select('code email name');

		if (blueprint != null) {
			logger.info(`Verifying ${blueprint.code}`);
			res.status(200).json(blueprint);
		}
		else {
			nexusError(`The blueprint with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initBlueprints/code/:code
// @Desc    Get Blueprint by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: init/initBlueprints/code/:code requested...');
	const code = req.params.code;

	try {
		const blueprint = await Blueprint.findOne({ code: code });
		if (blueprint != null) {
			res.status(200).json(blueprint);
		}
		else {
			res.status(200).json({ desc: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initBlueprints/validate/:id
// @Desc    Validate blueprint with id
// @access  Public
router.get('/validate/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const blueprint = await Blueprint.findById(id);
		if (blueprint != null) {
			try {
				await blueprint.validateBlueprint();
				res.status(200).json(blueprint);
			}
			catch(err) {
				res.status(200).send(`Blueprint validation Error! ${err.message}`);
			}
		}
		else {
			res.status(404).send(`The Blueprint with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;