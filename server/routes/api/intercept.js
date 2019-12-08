const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');
const intercept = require('../../wts/intercept/intercept');

// Interceptor Model - Using Mongoose Model
const { Interceptor } = require('../../models/ops/interceptor');

// @route   PUT api/intercept   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async (req, res) => {
    routeDebugger('Accepting Interception...')
    let attacker = await Interceptor.findById(req.body.attacker);
    let defender = await Interceptor.findById(req.body.defender);
    result = intercept.launchInterception(attacker, defender);
    res.json(result);
});

module.exports = router;