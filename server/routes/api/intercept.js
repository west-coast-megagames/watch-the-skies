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

    attacker.location.country.countryName = defender.location.country.countryName
    
    await attacker.save()
    let result = await intercept.launchInterception(attacker, defender);
    res.status(200).send(result);
});

module.exports = router;