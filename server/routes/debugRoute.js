const express = require('express');
const router = express.Router();
const nexusEvent = require('../startup/events');
const routeDebugger = require('debug')('app:routes:debug');

const { startResearch, assignKnowledgeCredit } = require('../wts/research/research');

// @route   PATCH debug/research
// @desc    Trigger the research system
// @access  Public
router.patch('/research', async function (req, res) {
    startResearch()
    res.status(200).send(`We triggered the research system!`);
});

// @route   PATCH debug/knowledge
// @desc    Trigger the research knowledge credit system
// @access  Public
router.patch('/knowledge', async function (req, res) {
    assignKnowledgeCredit();
    res.status(200).send(`We triggered the research credit system!`);
});

module.exports = router