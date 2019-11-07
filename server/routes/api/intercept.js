const express = require('express');
const router = express.Router();
const intercept = require('../../util/systems/intercept/intercept');

// Interceptor Model - Using Mongoose Model
const Interceptor = require('../../models/ops/interceptor');

// @route   PUT api/intercept   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async function (req, res) {
    try {
        let attacker = await Interceptor.findById(req.body.attacker);
        let defender = await Interceptor.findById(req.body.defender);
        result = intercept(attacker, defender);
        res.json(result);
    } catch (err) {
        console.log(`Error: ${err.message}`);
        res.status(400).send(`Error: ${err.message}`);
    }
});

module.exports = router;