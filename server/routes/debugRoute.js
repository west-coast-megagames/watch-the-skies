const express = require('express');
const router = express.Router();
const nexusEvent = require('../startup/events');
const routeDebugger = require('debug')('app:routes:debug');

const { startResearch } = require('../wts/research/research');

// @route   PATCH debug/research
// @desc    Trigger the research system
// @access  Public
router.patch('/research', async function (req, res) {
    startResearch()
    res.status(200).send(`We triggered the research system!`);
});

module.exports = router