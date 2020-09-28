const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Team } = require('../../models/team');

// @route   GET init/initTeam/:id
// @Desc    Get teams by id
// @access  Public
router.get('/:id', validateObjectId, async function (req, res) {
	logger.info('GET Route: api/team/:id requested...');
	const id = req.params.id;

	try {
		const team = await Team.findById(req.team._id).select('teamCode email name');

		if (team != null) {
			logger.info(`Verifying ${team.teamCode}`);
			res.status(200).json(team);
		}
		else {
			nexusError(`The team with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET init/initTeams/teamCode/:teamCode
// @Desc    Get Team by teamCode
// @access  Public
router.get('/teamCode/:teamCode', async (req, res) => {
	logger.info('GET Route: init/initTeams/teamCode/:teamCode requested...');
	const teamCode = req.params.teamCode;

	try {
		const team = await Team.findOne({ teamCode: teamCode });
		if (team != null) {
			res.status(200).json(team);
		}
		else {
			res.status(200).json({ teamCode: false });
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

module.exports = router;