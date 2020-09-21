const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston');

// Mongoose Model Import
const { Team, validateTeam, validateRoles } = require('../../models/team');

// @route   GET api/team
// @Desc    Get all Teams
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Looking up teams...');
	const teams = await Team.find().sort({ team: 1 });
	res.json(teams);
});

// @route   GET api/team/id/:id
// @Desc    Get all single team
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const team = await Team.findById(id);
	if (team != null) {
		res.json(team);
	}
	else {
		res.status(404).send(`The Team with the ID ${id} was not found!`);
	}
});

// @route   GET api/team/code
// @Desc    Get Team by Team Code
// @access  Public
router.get('/code/:teamCode', async (req, res) => {
	const teamCode = req.params.teamCode;
	const team = await Team.find({ teamCode });
	if (team.length) {
		res.json(team);
	}
	else {
		res.status(404).send(`The Team with the Team Code ${teamCode} was not found!`);
	}
});

// @route   POST api/team
// @Desc    Post a new team
// @access  Public
router.post('/', async (req, res) => {
	const { name, roles, prTrack, prLevel, sciRate, shortName, teamCode, teamType } = req.body;
	const { error } = validateTeam(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	if (roles) {
		if (roles.length > 0) {
			try {
				for (const currRole of roles) {
					const test2 = validateRoles(currRole);
					if (test2.error) return res.status(400).send(`Team Val Roles Error: ${test2.error.details[0].message}`);
				}
			}
			catch (err) {
				return res.status(400).send(`Team Val Roles Error: ${err.message}`);
			}
		}
	}

	const newTeam = new Team(
		{ name, roles, prTrack, prLevel, sciRate, shortName, teamCode, teamType }
	);
	const docs = await Team.find({ name });
	if (!docs.length) {
		const team = await newTeam.save();
		res.status(200).json(team);
		routeDebugger(`The ${name} team created...`);
	}
	else {
		console.log(`${name} team already exists!`);
		res.status(400).send(`${name} team already exists!`);
	}
});

// @route   DELETE api/team/:id
// @Desc    Delete a team
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const team = await Team.findByIdAndRemove(id);
	if (team != null) {
		logger.info(`${team.name} with the id ${id} was deleted!`);
		res.json(team).send(`${team.name} with the id ${id} was deleted!`);
	}
	else {
		res.status(404).send(`No team with the id ${id} exists!`);
	}
});

module.exports = router;