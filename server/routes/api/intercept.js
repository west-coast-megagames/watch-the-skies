const express = require('express');
const router = express.Router();
const intercept = require('../../util/systems/intercept/intercept');

// Interceptor Model - Using Mongoose Model
const Interceptor = require('../../models/interceptor');

// @route   PUT api/intercept   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async function (req, res) {
    try {
        console.log(req.body);
        let atkId = req.body.attacker;
        console.log(atkId);
        let defId = req.body.defender;
        console.log(defId);
        let attacker = await Interceptor.findById(atkId);
        let defender = await Interceptor.findById(defId);
        result = intercept(attacker, defender);
        res.json(result);
    } catch (err) {
        console.log('Error:', err.message);
        res.send('Error:', err.message);
    }

});

module.exports = router;