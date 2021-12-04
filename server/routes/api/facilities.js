const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Facility } = require('../../models/facility');
const { getDistance } = require('../../util/systems/geo');
const { Aircraft } = require('../../models/aircraft');
const { Site } = require('../../models/site');
const { Military } = require('../../models/military');
const { Squad } = require('../../models/squad');

// @route   GET api/facilities
// @Desc    Get all facilities
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/facilities requested...');
	try {
		const facilities = await Facility.find()
			.populate('site', 'name type geoDecimal')
			.populate('team', 'shortName name sciRate')
			.populate('research')
			.populate('upgrade');
		res.status(200).json(facilities);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/facilities/:id
// @Desc    Get Facilities by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/facilities/:id requested...');
	const id = req.params.id;
	try {
		const facility = await Facility.findById(id)
			.populate('team', 'name shortName')
			.populate('site', 'name')
			.populate('research')
			.populate('upgrade')
			.sort({ team: 1 });

		if (facility != null) {
			res.status(200).json(facility);
		}
		else {
			nexusError(`The facility with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/facilities/
// @Desc    Create New facility
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/facilities call made...');
	let newFacility = new Facility(req.body);

	try {
		await newFacility.validateFacility();
		newFacility = await newFacility.save();
		res.status(200).json(newFacility);
	}
	catch(err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/facilities/:id
// @Desc    Delete one facilities
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/facilities/:id call made...');
	const id = req.params.id;

	try {
		const facility = await Facility.findByIdAndRemove(id);

		if (facility != null) {
			logger.info(`The facility ${facility.name} with the id ${id} was deleted!`);
			res.status(200).json(facility);
		}
		else {
			nexusError(`The facility with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/facilities/deleteAll
// @desc    Delete All Facilities
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Facility.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Facilities!`);
});

router.patch('/test', async function (req, res) {
	const { type, targetID } = req.body;
	// 0 Get target
	let geoDecimal;
	let target;
	switch(type) {
	case 'Aircraft':
		target = await Aircraft.findById(targetID);
		geoDecimal = target.location;
		break;
	case 'Military':
		target = await Military.findById(targetID)
			.populate('site', 'geoDecimal');
		geoDecimal = target.site.geoDecimal; // Military always do stuff at sites
		break;
	case 'Squad':
		target = await Squad.findById(targetID)
			.populate('site', 'geoDecimal');
		geoDecimal = target.site.geoDecimal; // Squads are not completely figured out might get a location stat
		break;
	default:
		console.log(`${type} not valid type`);
		// throw new Error(`${type} not valid type`);
	}

	const facilities = await Facility.find()
		.populate('site', 'geoDecimal'); // 1) Find all Facilities with surviellence tags TODO

	// 2) for every facility
	if (target) {
		for (const facility of facilities) {
			// 2.2) calculate distance between facility and target
			const distance = getDistance(facility.site.geoDecimal.lat, facility.site.geoDecimal.lng, geoDecimal.lat, geoDecimal.lng); // Get distance to target in KM
			console.log(distance);
			// 2.1) If distance <= facility.range Do a method call to see if Intel is generated for the facility
			// distance < facility.stats.range ? cost = facility.doIntel(target.stats) : undefined;
		}
	}

	return res.status(200).send(`found ${facilities.length} Facilities!`);
});


module.exports = router;