const express = require('express');
const router = express.Router();
// const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging

const validateObjectId = require('../../middleware/util/validateObjectId');

const { Aircraft, validateRoles } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { Squad } = require('../../models/squad');
const { Team, validateTeam } = require('../../models/team');


// EXPECTATION:
router.put('/rename', async function (req, res) {
	let target;
	let originalName;
	switch (req.body.model) {
	case 'Facility':
		target = await Facility.findById(req.body._id);
		originalName = target.name;
		target.name = req.body.name;
		target = await target.save();
		break;
	case 'Aircraft':
		target = await Aircraft.findById(req.body._id);
		originalName = target.name;
		target.name = req.body.name;
		target = await target.save();
		break;
	case 'Squad':
		// this is untested
		target = await Squad.findById(req.body._id);
		originalName = target.name;
		target.name = req.body.name;
		target = await target.save();
		break;
	case 'Upgrade':
		// return once upgrades are finished
		break;
	default:
		res
			.status(200)
			.send('Unable to determine the type of Object you want to rename');
	}
	res.status(200).send(`Renamed '${originalName}' to '${target.name}'`);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TEAM~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   PUT api/team/id
// @Desc    Update Existing Team
// @access  Public
router.put('/:id', validateObjectId, async (req, res) => {
	try {
		const id = req.params.id;

		const { error } = validateTeam(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const roles = req.body.roles;
		if (roles) {
			try {
				for await (const currRole of roles) {
					const test2 = validateRoles(currRole);
					if (test2.error) return res.status(400).send(`Team Val Roles Error: ${test2.error.details[0].message}`);
				}
			}
			catch (err) {
				return res.status(400).send(`Team Val Roles Error: ${err.message}`);
			}
		}

		const team = await Team.findByIdAndUpdate(req.params.id,
			{ name: req.body.name,
				code: req.body.code,
				shortName: req.body.shortName,
				type: req.body.type,
				roles: req.body.roles,
				prTrack: req.body.prTrack,
				prLevel: req.body.prLevel,
				sciRate: req.body.sciRate
			},
			{ new: true, omitUndefined: true }
		);

		if (team != null) {
			res.json(team);
		}
		else {
			res.status(404).send(`The Team with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		console.log(`Team Put Error: ${err.message}`);
		res.status(400).send(`Team Put Error: ${err.message}`);
	}
});

module.exports = router;