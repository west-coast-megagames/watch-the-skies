const express = require('express');
const router = express.Router();
// const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging

const validateObjectId = require('../../middleware/util/validateObjectId');
const { newUpgrade } = require('../../wts/construction/construction');
const { upgradeValue, removeUpgrade, addUpgrade } = require('../../wts/upgrades/upgrades');

const { Aircraft, validateRoles } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { Military } = require('../../models/military');
const { Squad } = require('../../models/squad');
const { Team, validateTeam } = require('../../models/team');
const { Upgrade } = require('../../models/upgrade');

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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~UPGRADES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// @route   GET game/upgrade/stat
// @Desc    get the total stat contribution of a specific stat from an upgrade array
// @access  Public
router.get('/upgrades/stat', async function (req, res) {
	const z = await upgradeValue(req.body.upgrades, req.body.desiredStat);
	res.status(200).send(`The result is: ${z}`);
});


router.put('/upgrade/add', async function (req, res) {
	let { upgrade, unit } = req.body;
	upgrade = await Upgrade.findById(upgrade);
	unit = await Military.findById(unit);
	await addUpgrade(upgrade, unit);
	res.status(200).send(`Added "${upgrade.name}" to unit "${unit.name}"`);
});

// @route   POST game/upgrade/stat
// @Desc    remove an upgrade from a unit
// @access  Public
router.put('/upgrade/remove', async function (req, res) {
	const response = await removeUpgrade(req.body.upgrade, req.body.unit);
	res.status(200).send(response);
});

router.post('/upgrade/build', async function (req, res) {
	const { code, team, facility } = req.body; // please give me these things

	try {
		let upgrade = await newUpgrade(code, team, facility); // just the facility ID
		upgrade = await upgrade.save();

		res.status(200).json(upgrade);
	}
	catch (err) {
		res.status(404).send(err); // This returns a really weird json... watch out for that
	}
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
				for (const currRole of roles) {
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
				teamType: req.body.teamType,
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