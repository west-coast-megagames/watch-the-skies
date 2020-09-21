const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

// Research Models - Using Mongoose Model
const { Research, KnowledgeResearch, AnalysisResearch, TechResearch } = require('../../models/research');
const validateObjectId = require('../../middleware/util/validateObjectId');

const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging
require ('winston-mongodb');

// @route   GET api/research/
// @Desc    Get all research
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Showing all completed research...');
	const research = await Research.find().sort({ level: 1 }).sort({ field: 1 });
	res.status(200).json(research);
});

// @route   GET api/research/id
// @Desc    Get countries by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	try {
		const research = await Research.findById(id);
		if (research != null) {
			res.status(200).json(research);
		}
		else {
			res.status(404).send(`The Research with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		logger.error(`Get Research by ID Catch Error ${err.message}`, { meta: err });
		res.status(400).send(err.message);
	}
});

// @route   POST api/research/tech
// @Desc    Post a technology
// @access  Public
router.post('/tech', async function (req, res) {
	let tech = new TechResearch(req.body);

	tech = await tech.save();
	console.log('Technology Created...');
	return res.json(tech);
});

// @route   POST api/research/knowledge
// @Desc    Post a knowledge field
// @access  Public
router.post('/knowledge', async function (req, res) {
	let field = new KnowledgeResearch(req.body);

	field = await field.save();
	console.log('Knowledge aquired...');
	return res.json(field);
});

// @route   POST api/research/analysis
// @Desc    Post a knowledge field
// @access  Public
router.post('/analysis', async function (req, res) {
	let analysis = new AnalysisResearch(req.body);

	analysis = await analysis.save();
	console.log('Analysis Completed...');
	return res.json(analysis);
});

// @route   DEL api/research/delete
// @Desc    Load all research in the database
// @access  Public
router.delete('/', async function (req, res) {
	const data = await Research.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} records in the Reseach Database!`);
});


module.exports = router;