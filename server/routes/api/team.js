const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Team } = require('../../models/team');

// @route   GET api/team
// @Desc    Get all Teams
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/teams requested...');

	try {
		const teams = await Team.find()
			.sort({ team: 1 });
		res.status(200).json(teams);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/team/:id
// @Desc    Get all single team
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/team/:id requested...');
	const id = req.params.id;

	try {
		const team = await Team.findById(id);
		if (team != null) {
			res.status(200).json(team);
		}
		else {
			nexusError(`The Team with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// TODO: Add GET route that allows for getting by discriminator

// @route   POST api/team
// @Desc    Post a new team
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/team call made...');
	let newTeam = new Team(req.body);

	try {
		await newTeam.validatBlueprint();
		newTeam = await newTeam.save();
		logger.info(`Team ${newTeam.name} created...`);
		res.status(200).json(newTeam);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/team/:id
// @Desc    Delete a team
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/team/:id call made...');
	const id = req.params.id;

	try {
		const team = await Team.findByIdAndRemove(id);

		if (team != null) {
			logger.info(`Team ${team.name} with the id ${id} was deleted!`);
			res.status(200).json(team).send(`Team ${team.name} with the id ${id} was deleted!`);
		}
		else {
			nexusError(`No team with the id ${id} exists!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;