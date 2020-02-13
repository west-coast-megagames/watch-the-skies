const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');
const airMission = require('../../wts/intercept/missions');
const nexusEvent = require('../../startup/events');

// Interceptor Model - Using Mongoose Model
const { Interceptor } = require('../../models/ops/interceptor');
const { Site } = require('../../models/sites/site');

// @route   PUT api/intercept   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async (req, res) => {
    let result = ''
    let { aircraft, target, mission } = req.body;
    routeDebugger(req.body)

    aircraft = await Interceptor.findById(aircraft).populate('systems');

    if (mission === 'Interception' || mission === 'Escort' || mission === 'Recon Aircraft') {
        target = await Interceptor.findById(target).populate('systems');
        aircraft.site = target.site;
    } else if (mission === 'Diversion' || mission === 'Transport' || mission === 'Recon Site' || mission === 'Patrol') {
        target = await Site.findById(target);
        aircraft.site = target._id;
    };

    result = `${aircraft.name} launching.`;
    aircraft.country = target.country;
    aircraft.zone = target.zone;
    aircraft.status.mission = mission;
    
    routeDebugger(aircraft);

    aircraft = await aircraft.launch(aircraft, mission); // Changes attacker status
    result = `${result} ${aircraft.name} en route to attempt ${mission.toLowerCase()}.`;

    await airMission.start(aircraft, target, mission);

    routeDebugger(result)
    res.status(200).send(result);
    nexusEvent.emit('updateAircrafts');
});

module.exports = router;