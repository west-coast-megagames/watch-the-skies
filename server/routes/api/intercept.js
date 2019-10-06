const express = require('express');
const router = express.Router();
const intercept = require('../../util/systems/intercept/intercept');

// Item Model
const Interceptor = require('../../models/interceptor');

// @route   GET api/intercept
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.post('/', async function(req, res) {
    console.log(req.body);
    let atkId = req.body.attacker;
    console.log(atkId);
    let defId = req.body.defender;
    console.log(defId);
    let attacker = await Interceptor.findById(atkId)
    let defender = await Interceptor.findById(defId)
    result = intercept(attacker, defender);
    res.json(result);
});

module.exports = router;