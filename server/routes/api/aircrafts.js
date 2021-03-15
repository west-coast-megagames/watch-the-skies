const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

// Aircraft Model - Using Mongoose Model
const { Aircraft } = require('../../models/aircraft'); // Aircraft Model
const { Team } = require('../../models/team'); // WTS Team Model
const { Upgrade } = require('../../models/upgrade');
const httpErrorHandler = require('../../middleware/util/httpError');
const nexusError = require('../../middleware/util/throwError');

// @route   GET api/aircrafts
// @Desc    Get all Aircrafts
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/aircraft requested...');
	try {
		const aircrafts = await Aircraft.find()
			.sort({ team: 1 })
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('systems', 'name category')
			.populate('site', 'name')
			.populate('base', 'name');
		res.status(200).json(aircrafts);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/aircrafts/:id
// @Desc    Get a single aircraft by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/aircraft/:id requested...');
	const id = req.params.id;
	try {
		const aircraft = await Aircraft.findById(id)
			.sort({ team: 1 })
			.populate('team', 'name shortName')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('systems', 'name category')
			.populate('site', 'name')
			.populate('base', 'name');
		if (aircraft != null) {
			res.status(200).json(aircraft);
		}
		else {
			nexusError(`The Aircraft with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/aircrafts
// @Desc    Post a new aircraft
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/aircraft call made...');

	try {
		let newAircraft = new Aircraft(req.body);

		// update stats based on any upgrades
		for (const upgId of newAircraft.upgrades) {
			const upgrade = await Upgrade.findById(upgId);
			if (upgrade) {
				for (const element of upgrade.effects) {
					switch (element.type) {
					case 'health':
						newAircraft.stats.health += element.effect;
						break;
					case 'attack':
						newAircraft.stats.attack += element.effect;
						break;
					case 'defense':
						newAircraft.stats.defense += element.effect;
						break;
					case 'range':
						newAircraft.stats.range += element.effect;
						break;
					case 'evade':
						newAircraft.stats.evade += element.effect;
						break;
					case 'penetration':
						newAircraft.stats.penetration += element.effect;
						break;
					default: break;
					}
				}
			}
		}

		await newAircraft.validateAircraft();
		const docs = await Aircraft.find({ name: req.body.name, team: req.body.team });

		if (docs.length < 1) {
			newAircraft = await newAircraft.save();
			await Team.populate(newAircraft, { path: 'team', model: 'Team', select: 'name' });
			logger.info(`${newAircraft.name} aircraft created for ${newAircraft.team.name} ...`);
			res.status(200).json(newAircraft);
		}
		else {
			nexusError(`A aircraft named ${newAircraft.name} already exists for this team!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/aircrafts/:id
// @Desc    Delete an aircraft
// @access  Public
router.delete('/:id', async function (req, res) {
	logger.info('DEL Route: api/aircraft:id call made...');
	try {
		const id = req.params.id;
		let aircraft = await Aircraft.findById(id);
		if (aircraft != null) {
			await aircraft.stripUpgrades();
			aircraft = await Aircraft.findByIdAndDelete(id);
			logger.info(`${aircraft.name} with the id ${id} was deleted!`);
			res.status(200).send(`${aircraft.name} with the id ${id} was deleted!`);
		}
		else {
			nexusError(`No aircraft with the id ${id} exists!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/aircrafts/deleteAll
// @desc    Delete All Aircraft
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	let airDelCount = 0;
	let upgDelCount = 0;
	for await (const aircraft of Aircraft.find()) {
		const id = aircraft.id;
		// delete attached upgrades
		for (const upgrade of aircraft.upgrades) {
			try {
				await Upgrade.findByIdAndRemove(upgrade);
				upgDelCount += 1;
			}
			catch (err) {
				nexusError(`${err.message}`, 500);
			}
		}
		try {
			const aircraftDel = await Aircraft.findByIdAndRemove(id);
			if (aircraftDel == null) {
				res.status(404).send(`The Aircraft with the ID ${id} was not found!`);
			}
			else {
				airDelCount += 1;
			}
		}
		catch (err) {
			nexusError(`${err.message}`, 500);
		}
	}
	return res.status(200).send(`We wiped out ${airDelCount} Aircraft and ${upgDelCount} Upgrades! `);
});

module.exports = router;
