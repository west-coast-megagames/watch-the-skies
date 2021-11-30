const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

// intel Model - Using Mongoose Model
const { Intel } = require('../../models/intel'); // WTS Team Model
const httpErrorHandler = require('../../middleware/util/httpError');
const nexusError = require('../../middleware/util/throwError');
const { Aircraft } = require('../../models/aircraft');

// @route   GET api/intels
// @Desc    Get all intels
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/intel requested...');
	try {
		const intels = await Intel.find();
		res.status(200).json(intels);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/intels/:id
// @Desc    Get a single intel by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/intel/:id requested...');
	const id = req.params.id;
	try {
		const intel = await intel.findById(id);
		if (intel != null) {
			res.status(200).json(intel);
		}
		else {
			nexusError(`The intel with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/intels
// @Desc    Post a new intel
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/intel call made...');

	try {
		let newintel = new Intel(req.body);
		const docs = await Intel.find({ name: req.body.name, team: req.body.team });

		if (docs.length < 1) {
			newintel = await newintel.save();
			logger.info(`${newintel.name} intel created for ${newintel.team.name} ...`);
			res.status(200).json(newintel);
		}
		else {
			nexusError(`A intel named ${newintel.name} already exists for this team!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/intels/:id
// @Desc    Delete an intel
// @access  Public
router.delete('/:id', async function (req, res) {
	logger.info('DEL Route: api/intel:id call made...');
	try {
		const id = req.params.id;
		let intel = await Intel.findById(id);
		if (intel != null) {
			intel = await Intel.findByIdAndDelete(id);
			logger.info(`${intel.name} with the id ${id} was deleted!`);
			res.status(200).send(`${intel.name} with the id ${id} was deleted!`);
		}
		else {
			nexusError(`No intel with the id ${id} exists!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/intels/deleteAll
// @desc    Delete All intel
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Intel.deleteMany();
	return res.status(200).json(data);
});

// @route   PATCH debug/intel
// @desc    Trigger Intel
// @access  Public
router.post('/testing', async function (req, res) {
	const { model, _id } = req.body;
	let doc = {};
	let intelFile = new Intel({
		team: '6124c23090596642e0341810',
		subject: _id,
		type: model.toLowerCase()
	});
	switch(model) {
	case 'Aircraft':
		doc = await Aircraft.findById(_id);
		intelFile = await intelFile.reconIntel(doc.toObject(), 'DebugRoute');
		break;
	default:
		console.log(`No ${model} case`);
	}

	res.status(200).send({ intelFile, doc });
});

module.exports = router;
