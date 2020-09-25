const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId');
const httpErrorHandler = require('../../middleware/util/httpError');
const nexusError = require('../../middleware/util/throwError');

// Mongoose Model Import
const { Zone, SpaceZone, GroundZone } = require('../../models/zone');

// @route   GET api/zones
// @Desc    Get all zones
// @access  Public
router.get('/', async (req, res) => {
	logger.info('GET Route: api/zones requested...');
	try {
		const zones = await Zone.find()
			.sort('code: 1');
		res.status(200).json(zones);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/zones/:id
// @Desc    Get zones by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/zones/:id requested...');
	const id = req.params.id;

	try {
		const zone = await Zone.findById(id);
		if (zone != null) {
			res.status(200).json(zone);
		}
		else {
			res.status(404).send(`The Zone with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   GET api/zones/code/:code
// @Desc    Get zones by code
// @access  Public
router.get('/code/:code', async (req, res) => {
	logger.info('GET Route: api/zones/code/:code requested...');
	const code = req.params.code;

	try {
		const zone = await Zone.findOne({ code: code });
		if (zone != null) {
			res.status(200).json(zone);
		}
		else {
			res.status(404).send(`The Zone with the Code ${code} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/zones
// @Desc    Create New Zone
// @access  Public
router.post('/', async (req, res) => {
	logger.info('POST Route: api/articles call made...');

	try {
		let newZone;
		if (req.body.type === 'Ground') {
			newZone = new GroundZone(req.body);
		}
		if (req.body.type === 'Space') {
			newZone = new SpaceZone(req.body);
		}
		const { code } = req.body;
		await newZone.validateZone();
		const docs = await Zone.find({ code });

		if (docs.length < 1) {
			newZone = await newZone.save();
			res.status(200).json(newZone);
		}
		else {
			console.log(`Zone Code already exists: ${code}`);
			res.status(400).send(`Zone Code ${code} already exists!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   put api/zones/:id
// @Desc    put zones by id
// @access  Public
router.put('/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;

	try {
		const zone = await Zone.findByIdAndUpdate(id);
		if (zone != null) {
			res.status(200).json(zone);
		}
		else {
			res.status(404).send(`The Zone with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});


// @route   DELETE api/zones/:id
// @Desc    Delete zone by ID
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/zones/:id call made...');
	const id = req.params.id;

	try {
		const zone = await Zone.findByIdAndRemove(id);

		if (zone != null) {
			logger.info(`The ${zone.name} zone with the id ${id} was deleted!`);
			res.status(200).json(zone);
		}
		else {
			nexusError(`The Zone with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/zones/deleteAll
// @desc    Delete All Zones
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Zone.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Zones!`);
});

module.exports = router;
