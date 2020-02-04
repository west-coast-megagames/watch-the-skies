const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');
const airMission = require('../../wts/intercept/intercept');
const nexusEvent = require('../../startup/events');

// Interceptor Model - Using Mongoose Model
const { Interceptor } = require('../../models/ops/interceptor');

// @route   PUT api/intercept   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async (req, res) => {
    let result = ''
    let { aircraft, target, mission } = req.body;

    aircraft = await Interceptor.findById(aircraft).populate('systems');
    target = await Interceptor.findById(target).populate('systems');

    result = `${aircraft.name} launching.`;
    aircraft.location = target.location;

    aircraft = await aircraft.launch(aircraft, mission); // Changes attacker status
    result = `${result} ${aircraft.name} en route to attempt ${mission.toLowerCase()}.`;

    await airMission.start(aircraft, target, mission);

    routeDebugger(result)
    res.status(200).send(result);
    nexusEvent.emit('updateAircrafts');
});

module.exports = router;