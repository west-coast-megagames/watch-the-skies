const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

// Aircraft Model - Using Mongoose Model
const { Aircraft } = require('../../models/ops/aircraft');
const { Upgrade } = require('../../models/gov/upgrade/upgrade');
const { newUnit } = require('../../wts/construction/construction');

// @route   GET api/aircraft
// @Desc    Get all Aircrafts
// @access  Public
router.get('/', async function (req, res) {
	// console.log('Sending aircrafts somewhere...');
	const aircrafts = await Aircraft.find()
		.sort({ team: 1 })
		.populate('team', 'name shortName')
		.populate('zone', 'name')
		.populate('country', 'name')
		.populate('systems', 'name category')
		.populate('site', 'name')
		.populate('origin', 'name');
	res.status(200).json(aircrafts);
});

// @route   GET api/aircraft
// @Desc    Get Aircrafts by ID
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
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
		res.status(404).send(`The Aircraft with the ID ${id} was not found!`);
	}
});

// @route   DELETE api/aircraft/:id
// @Desc    Delete an aircraft
// @access  Public
router.delete('/:id', async function (req, res) {
	const id = req.params.id;
	const aircraft = await Aircraft.findByIdAndRemove(id);
	if (aircraft != null) {
		// remove associated systems records
		for (let j = 0; j < aircraft.systems.length; ++j) {
			const upgId = aircraft.upgrades[j]; // changed systems removed to Upgrades.
			try{
				let removedUP = await Upgrade.findById(upgId);
				removedUP.status.storage = true;
				removedUP = await removedUP.save();
			}
			catch{
				console.log(`The Upgrade with the ID ${upgId} was not found! when deleting unit ${aircraft.name}`);
			}
		}
		console.log(`${aircraft.name} with the id ${id} was deleted!`);
		res.status(200).send(`${aircraft.name} with the id ${id} was deleted!`);
	}
	else {
		res.status(400).send(`No aircraft with the id ${id} exists!`);
	}
});

// @route   POST api/aircraft/build
// @Desc    Takes in blueprint and name and facility(?) and starts construction on a new aircraft
// @access  Public
router.post('/build', async (req, res) => {
	const { name, facility, type, team } = req.body; // please give me these things
	try {
		const aircraft = await newUnit(name, facility, type, team); // just the facility ID
		res.status(200).send(aircraft);
	}
	catch (err) {
		res.status(404).send(err); // This returns a really weird json... watch out for that
	}
});

module.exports = router;
