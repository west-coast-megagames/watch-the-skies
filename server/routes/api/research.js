const routeDebugger = require('debug')('app:routes');
const express = require('express');

const { loadTech } = require('../../wts/research/techTree');
const { loadKnowledge, knowledgeSeed } = require('../../wts/research/knowledge')
const research = require('../../wts/research/research')

const router = express.Router();

// Research Models - Using Mongoose Model
const TechResearch = require('../../models/sci/techResearch');
const KnowledgeResearch = require('../../models/sci/knowledgeResearch');
const AnalysisResearch = require('../../models/sci/analysisResearch');
const Research = require('../../models/sci/research')

// @route   GET api/research/
// @Desc    Get all research
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Showing all completed research...');
    let research = await Research.find();
    res.json(research);
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
    return res.status(200).send(response);
});

// @route   PATCH api/research/load/knowledge
// @Desc    Load all knowledge fields from JSON files
// @access  Public
router.patch('/load/knowledge', async function (req, res) {
    let response = await loadKnowledge();
    return res.status(200).send(response);
});

// @route   PATCH api/research/load/knowledge/seed
// @Desc    Load all knowledge fields from JSON files
// @access  Public
router.patch('/load/knowledge/seed', async function (req, res) {
    await knowledgeSeed();
    return res.status(200).send('We did it, such a seed!')
});

router.put('/progress', async function (req, res) {
    let { tech_id, lab_id } = req.body;
    let progress = await research.calculateProgress(tech_id, lab_id);

    return res.status(200).send(progress);
});

module.exports = router;