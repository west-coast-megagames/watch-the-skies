const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');
const airMission = require('../../wts/intercept/intercept');

// Interceptor Model - Using Mongoose Model
const { Interceptor } = require('../../models/ops/interceptor');

// @route   PUT api/intercept   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async (req, res) => {
    let result = ''
    let { aircraft, target, mission } = req.body;

    aircraft = await Interceptor.findById(aircraft);
    target = await Interceptor.findById(target);

    result = `${aircraft.designation} launching.`;
    aircraft.location = target.location;

    aircraft = await aircraft.launch(aircraft, mission); // Changes attacker status
    result = `${result} ${aircraft.designation} en route to attempt ${mission.toLowerCase()}.`; 
    
    await airMission.start(aircraft, target, mission);

    routeDebugger(result)
    res.status(200).send(result);
});

module.exports = router;