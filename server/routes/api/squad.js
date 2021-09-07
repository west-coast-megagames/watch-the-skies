const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Squad } = require('../../models/squad');

// @route   GET api/squad
// @Desc    Get all Militaries
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/militaries requested...');

	try {
		const squad = await Squad.find()
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('organization', 'name')
			.populate('site', 'name')
			.populate('origin')
			.sort({ team: 1 });
		res.status(200).json(squad);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}

});

// @route   GET api/squad/:id
// @Desc    Get Squad by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/squad/:id requested...');
	const id = req.params.id;

	try {
		const squad = await Squad.findById(id)
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('organization', 'name')
			.populate('gear', 'name category')
			.populate('site', 'name')
			.populate('origin', 'name')
			.sort({ team: 1 });
		if (squad != null) {
			res.status(200).json(squad);
		}
		else {
			nexusError(`The Squad with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/squad
// @Desc    Create New squad unit
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/squad call made...');
	let newSquad = new Squad(req.body);

	try {
		await newSquad.validateSquad();
		newSquad = await newSquad.save();
		logger.info(`Unit ${newSquad.name} created...`);
		res.status(200).json(newSquad);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/squad/:id
// @Desc    Delete an squad unit
// @access  Public
router.delete('/:id', async function (req, res) {
	logger.info('DEL Route: api/squad/:id call made...');
	const id = req.params.id;

	try {
		const squad = await Squad.findByIdAndRemove(id);

		if (squad != null) {
			logger.info(`The unit ${squad.name} with the id ${id} was deleted!`);
			res.status(200).send(squad);
		}
		else {
			nexusError(`No squad with the id ${id} exists!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/squad/deleteAll
// @desc    Delete All Squad
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Squad.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Squad!`);
});

module.exports = router;
