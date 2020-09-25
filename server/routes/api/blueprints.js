const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Blueprint } = require('../../models/blueprint');

// @route   GET api/blueprints
// @Desc    Get all blueprints
// @access  Public
router.get('/', async (req, res) => {
	logger.info('GET Route: api/blueprints requested...');
	try {
		const blueprints = await Blueprint.find()
			.sort('buildModel: 1');
		res.status(200).json(blueprints);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/blueprints/:id
// @Desc    Get blueprint by id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/blueprints/:id requested...');
	const id = req.params.id;
	try {
		const blueprint = await Blueprint.findById(id);
		if (blueprint != null) {
			res.status(200).json(blueprint);
		}
		else {
			res.status(404).send(`The blueprint with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// TODO: Add GET route that allows for sorting by discriminator

// @route   POST api/blueprints
// @Desc    Create New blueprint
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/blueprints call made...');
	let newBlueprint = new Blueprint(req.body);

	try {
		await newBlueprint.validatBlueprint();
		newBlueprint = await newBlueprint.save();
		logger.info(` Blueprint ${newBlueprint.code} - ${newBlueprint.name} created...`);
		res.status(200).json(newBlueprint);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/blueprints/:id
// @Desc    Delete one blueprint
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/blueprints/:id call made...');
	const id = req.params.id;

	try {
		const blueprint = await Blueprint.findByIdAndRemove(req.params.id);

		if (blueprint != null) {
			logger.info(`The ${blueprint.headline} blueprint with the id ${id} was deleted!`);
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

module.exports = router;