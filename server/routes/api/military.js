const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Military, Corps, Fleet } = require('../../models/military');
const { Upgrade } = require('../../models/upgrade');

// @route   GET api/military
// @Desc    Get all Militaries
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/militaries requested...');

	try {
		const military = await Military.find()
			.populate('team', 'name shortName code')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('site', 'name')
			.populate('origin')
			.sort({ team: 1 });
		res.status(200).json(military);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}

});

// @route   GET api/military/:id
// @Desc    Get Military by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/military/:id requested...');
	const id = req.params.id;

	try {
		const military = await Military.findById(id)
			.populate('team', 'name shortName code')
			.populate('zone', 'name')
			.populate('country', 'name')
			.populate('gear', 'name category')
			.populate('site', 'name')
			.populate('origin', 'name')
			.populate('upgrades')
			.sort({ team: 1 });
		if (military != null) {
			res.status(200).json(military);
		}
		else {
			nexusError(`The Military with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/military
// @Desc    Create New military unit
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/military call made...');

	let newMilitary;
	switch(req.body.type) {

	case('Corps'):
		newMilitary = new Corps(req.body);
		break;

	case('Fleet'):
		newMilitary = new Fleet(req.body);
		break;

	default:
		logger.info(`Team ${req.body.name} has invalid type ${req.body.type}`);
		res.status(500).json(newMilitary);

	}

	try {
		// update stats based on any upgrades
		for (const upgId of newMilitary.upgrades) {
			const upgrade = await Upgrade.findById(upgId);
			if (upgrade) {
				for (const element of upgrade.effects) {
					switch (element.type) {
					case 'health':
						newMilitary.stats.health += element.effect;
						break;
					case 'attack':
						newMilitary.stats.attack += element.effect;
						break;
					case 'defense':
						newMilitary.stats.defense += element.effect;
						break;
					default: break;
					}
				}
			}
		}

		await newMilitary.validateMilitary();
		newMilitary = await newMilitary.save();
		logger.info(`Unit ${newMilitary.name} created...`);
		res.status(200).json(newMilitary);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/military
// @Desc    Edit an existing military unit
// @access  Public
router.patch('/', async (req, res) => {
	const { editedUnit } = req.body;
	try{
		const unit = await Military.findByIdAndUpdate(editedUnit._id, editedUnit, { new: true, overwrite: true });
		// unit = await unit.save();
		console.log(unit);
		res.status(200).send(unit);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}


});

// @route   DELETE api/military/:id
// @Desc    Delete an military unit
// @access  Public
router.delete('/:id', async function (req, res) {
	logger.info('DEL Route: api/military/:id call made...');
	const id = req.params.id;

	try {
		const military = await Military.findByIdAndRemove(id);

		if (military != null) {
			// delete attached upgrades
			for (const upgrade of military.upgrades) {
				try {
					await Upgrade.findByIdAndRemove(upgrade);
				}
				catch (err) {
					nexusError(`${err.message}`, 500);
				}
			}
			logger.info(`The unit ${military.name} with the id ${id} was deleted!`);
			res.status(200).send(military);
		}
		else {
			nexusError(`No military with the id ${id} exists!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/military/deleteAll
// @desc    Delete All Military
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	let milDelCount = 0;
	let upgDelCount = 0;
	for await (const military of Military.find()) {
		const id = military.id;
		// delete attached upgrades
		for (const upgrade of military.upgrades) {
			try {
				await Upgrade.findByIdAndRemove(upgrade);
				upgDelCount += 1;
			}
			catch (err) {
				nexusError(`${err.message}`, 500);
			}
		}
		try {
			const militaryDel = await Military.findByIdAndRemove(id);
			if (militaryDel == null) {
				res.status(404).send(`The Military with the ID ${id} was not found!`);
			}
			else {
				milDelCount += 1;
			}
		}
		catch (err) {
			nexusError(`${err.message}`, 500);
		}
	}
	return res.status(200).send(`We wiped out ${milDelCount} Military and ${upgDelCount} Upgrades! `);
});

module.exports = router;
