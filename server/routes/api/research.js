const routeDebugger = require('debug')('app:routes');
const nexusEvent = require('../../startup/events');
const express = require('express');
const router = express.Router();

const { loadTech, techSeed } = require('../../wts/research/techTree');
const { loadKnowledge, knowledgeSeed } = require('../../wts/research/knowledge')
const science = require('../../wts/research/research');



// Research Models - Using Mongoose Model
const TechResearch = require('../../models/sci/techResearch');
const AnalysisResearch = require('../../models/sci/analysisResearch');
const { Research, KnowledgeResearch } = require('../../models/sci/research')

// @route   GET api/research/
// @Desc    Get all research
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Showing all completed research...');
    let research = await Research.find().sort({ level: 1 }).sort({ field: 1 });
    res.json(research);
});

// @route   GET api/research/sciStats
// @Desc    Get global science state
// @access  Public
router.get('/sciState', async function (req, res) {
    routeDebugger('Sending server science state...');
    let state = {
        fundingCost: science.fundingCost,
        techCost: science.techCost
    };
    res.status(200).json(state);
});

// @route   POST api/research/tech
// @Desc    Post a technology
// @access  Public
router.post('/tech', async function (req, res) {
    let tech = new TechResearch(req.body);

    tech = await tech.save();
        console.log(`Technology Created...`);
        return res.json(tech);            
});

// @route   POST api/research/knowledge
// @Desc    Post a knowledge field
// @access  Public
router.post('/knowledge', async function (req, res) {
    let field = new KnowledgeResearch(req.body);

    field = await field.save();
        console.log(`Knowledge aquired...`);
        return res.json(field);            
});

// @route   POST api/research/analysis
// @Desc    Post a knowledge field
// @access  Public
router.post('/analysis', async function (req, res) {
    let analysis = new AnalysisResearch(req.body);

    analysis = await analysis.save();
        console.log(`Analysis Completed...`);
        return res.json(analysis);            
});

// @route   PATCH api/research/load/tech
// @Desc    Load all technology from JSON files
// @access  Public
router.patch('/load/tech', async function (req, res) {
    let response = await loadTech();
    nexusEvent.emit('updateResearch');
    return res.status(200).send(response);
});

// @route   PATCH api/research/load/knowledge
// @Desc    Load all knowledge fields from JSON files
// @access  Public
router.patch('/load/knowledge', async function (req, res) {
    let response = await loadKnowledge(); // Loads all knowledge into the server
    nexusEvent.emit('updateResearch');
    return res.status(200).send(response);
});

// @route   PATCH api/research/load/knowledge/seed
// @Desc    Load all knowledge fields from JSON files
// @access  Public
router.patch('/load/knowledge/seed', async function (req, res) {
    let response = await knowledgeSeed();
    nexusEvent.emit('updateResearch');
    return res.status(200).send('We did it, such a knowledge seed!')
});

// @route   PATCH api/research/load/tech/seed
// @Desc    Load all technology from JSON files
// @access  Public
router.patch('/load/tech/seed', async function (req, res) {
    let response = await techSeed();
    nexusEvent.emit('updateResearch');
    return res.status(200).send(`We did it, we seeded Technology`);
});

// @route   DEL api/research/delete
// @Desc    Load all research in the database
// @access  Public
router.delete('/', async function (req, res) {
    let data = await Research.deleteMany();
    console.log(data);
    return res.status(200).send(`We wiped out ${data.deletedCount} records in the Reseach Database!`)
});


module.exports = router;