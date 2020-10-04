const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging
const validateObjectId = require('../../middleware/util/validateObjectId'); // Middleware that validates object ID's in HTTP perameters
const httpErrorHandler = require('../../middleware/util/httpError'); // Middleware that parses errors and status for Express responses
const nexusError = require('../../middleware/util/throwError'); // Project Nexus middleware for error handling

// Mongoose Model Import
const { Research, KnowledgeResearch, AnalysisResearch, TechResearch } = require('../../models/research');

// @route   GET api/research
// @Desc    Get all research
// @access  Public
router.get('/', async function (req, res) {
	logger.info('GET Route: api/research requested...');
	try {
		const research = await Research.find()
			.sort({ level: 1 })
			.sort({ field: 1 });
		res.status(200).json(research);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/research/:id
// @Desc    Get research by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	logger.info('GET Route: api/research/:id requested...');
	const id = req.params.id;

	try {
		const research = await Research.findById(id);

		if (research != null) {
			res.status(200).json(research);
		}
		else {
			nexusError(`The Research with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/research
// @Desc    Post a research
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/research call made...');

	try {
		let newResearch;

		switch (true) {
		case req.body.type === 'Technology':
			newResearch = new TechResearch(req.body);
			break;
		case req.body.type === 'Knowledge':
			newResearch = new KnowledgeResearch(req.body);
			break;
		case req.body.type === 'Analysis':
			newResearch = new AnalysisResearch(req.body);
			break;
		default:
			nexusError(`Research type ${req.body.type} is not valid!`, 404);
		}

		await newResearch.validateZone();
		newResearch = await newResearch.save();
		res.status(200).json(newResearch);
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/research/:id
// @Desc    Delete zone by ID
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
	logger.info('DEL Route: api/research/:id call made...');
	const id = req.params.id;

	try {
		const research = await Research.findByIdAndRemove(id);

		if (research != null) {
			logger.info(`The ${research.name} research with the id ${id} was deleted!`);
			res.status(200).json(research);
		}
		else {
			nexusError(`The research with the ID ${id} was not found!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DEL api/research/deleteAll
// @Desc    Delete All Research
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Research.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} records in the Reseach Collection!`);
});


module.exports = router;