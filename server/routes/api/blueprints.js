const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Blueprint, FacilityBlueprint, AircraftBlueprint, SquadBlueprint, UpgradeBlueprint, MilitaryBlueprint, BuildingBlueprint } = require('../../models/blueprint');

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
			nexusError(`The blueprint with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// TODO: Add GET route that allows for getting by discriminator

// @route   POST api/blueprints
// @Desc    Create New blueprint
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/blueprints call made...');

	try {
		let newBlueprint;
		switch (req.body.buildModel) {

		case('aircraft'):
			newBlueprint = new AircraftBlueprint(req.body);
			break;

		case('military'):
			newBlueprint = new MilitaryBlueprint(req.body);
			break;

		case('building'):
			newBlueprint = new BuildingBlueprint(req.body);
			break;

		case('facility'):
			newBlueprint = new FacilityBlueprint(req.body);
			break;

		case('squad'):
			newBlueprint = new SquadBlueprint(req.body);
			break;

		case('upgrade'):
			newBlueprint = new UpgradeBlueprint(req.body);
			break;

		default:
			logger.info(`Blueprint ${req.body.name} has invalid buildModel ${req.body.buildModel}`);
			res.status(500).json(newBlueprint);


		}
		await newBlueprint.validateBlueprint();
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
		const blueprint = await Blueprint.findByIdAndRemove(id);

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

// @route   PATCH api/blueprints/deleteAll
// @desc    Delete All Blueprints
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Blueprint.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Blueprints!`);
});

module.exports = router;