const routeDebugger = require('debug')('app:routes');
const express = require('express');

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

module.exports = router;