const routeDebugger = require('debug')('app:routes:facilities');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { newFacility } = require('../../wts/construction/construction');

// Facility Model - Using Mongoose Model
const { Facility } = require('../../models/gov/facility/facility');

// @route   GET api/facilities
// @Desc    Get all facilities
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Looking up all facilities...');
	const facilities = await Facility.find()
		.populate('site', 'name type')
		.populate('team', 'shortName name sciRate')
		.populate('research')
		.populate('upgrade');

	res.status(200).json(facilities);
});

// @route   GET api/facility
// @Desc    Get Facilities by ID
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const facility = await Facility.findById(id)
		.sort({ team: 1 })
		.populate('team', 'name shortName')
		.populate('site', 'name')
		.populate('research')
		.populate('upgrade');	
	if (facility != null) {
		res.json(facility);
	} else {
		res.status(404).send(`The facility with the ID ${id} was not found!`);
	}
});

// @route   POST api/facility
// @Desc    Takes in blueprint and name and site and starts construction on a new Facility
// @access  Public
router.post('/build', async (req, res) => {
	const { name, site, team } = req.body; // please give me these things
	try {
		let facility = await newFacility(name, site, team);
		facility = await facility.save();
		res.status(200).json(facility);
	}
	catch(err) {
		res.status(404).send(err);// This returns a really weird json... watch out for that
	}
});
module.exports = router;