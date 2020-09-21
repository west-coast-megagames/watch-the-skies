const express = require('express');
const router = express.Router();
const zoneDebugger = require('debug')('app:zone');
const validateObjectId = require('../../middleware/util/validateObjectId');

const { Zone, validateZone } = require('../../models/zone');

// @route   GET api/zones
// @Desc    Get all zones
// @access  Public
router.get('/', async (req, res) => {
	const zones = await Zone.find().populate('satellite', 'name').sort('code: 1');
	res.status(200).json(zones);
});

// @route   GET api/zones/id
// @Desc    Get zones by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const zone = await Zone.findById(id).populate('satellite', 'name');
	if (zone != null) {
		res.status(200).json(zone);
	}
	else {
		res.status(404).send(`The Zone with the ID ${id} was not found!`);
	}
});

// @route   GET api/zones/code
// @Desc    Get Zones by Zone Code
// @access  Public
router.get('/code/:code', async (req, res) => {
	const code = req.params.code;
	const zone = await Zone.find({ code }).populate('satellite', 'name');
	if (zone.length) {
		res.json(zone);
	}
	else {
		res.status(404).send(`The Zone with the Zone Code ${code} was not found!`);
	}
});

// @route   POST api/zones
// @Desc    Create New Zone
// @access  Public
router.post('/', async (req, res) => {
	const { code, name, terror } = req.body;
	zoneDebugger('In Zone Post ... Code: ', code, 'Name: ', name);
	const newZone = new Zone({ code, name, terror });
	const docs = await Zone.find({ code });
	if (!docs.length) {
		const { error } = validateZone(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const zone = await newZone.save();
		res.json(zone);
		console.log(`New Zone ${req.body.code} created...`);
	}
	else {
		console.log(`Zone Code already exists: ${code}`);
		res.status(400).send(`Zone Code ${code} already exists!`);
	}
});

// @route   DELETE api/zones/id
// @Desc    Update Existing Zone
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const zone = await Zone.findByIdAndRemove(req.params.id);

	if (zone != null) {
		res.json(zone);
	}
	else {
		res.status(404).send(`The Zone with the ID ${id} was not found!`);
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
