const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const Log = require('../../models/logs/log');

// @route   GET api/log
// @Desc    Get all logs
// @access  Public
router.get('/', async function (req, res) {
    routeDebugger('Sending the logs!');
    let logs = await Log.find().populate('team');
    res.json(logs);
});

module.exports = router;