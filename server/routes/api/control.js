const express = require('express');
const router = express.Router();

// Interceptor Model - Using Mongoose Model
const { Interceptor } = require('../../models/ops/interceptor');
const { System } = require('../../models/ops/systems');
const { loadSystems, systems } = require('../../wts/construction/systems/systems');

// @route   PATCH api/control/alien/deploy
// @desc    Update all alien crafts to be deployed
// @access  Public
router.patch('/alien/deploy', async function (req, res) {
    let count = 0;
    let interceptors = await Interceptor.find().populate('team');
    interceptors = interceptors.filter(i => i.team.teamType === 'A')
    for await (const interceptor of interceptors) {
        console.log(interceptor);
        if (interceptor.status.deployed === false) {
            count++
            interceptor.status.deployed = true;
            await interceptor.save();    
        }
    }
    if (count === 0) {
        res.status(200).send(`No alien crafts availible to deployed...`);
    } else {
        res.status(200).send(`${count} alien crafts have been deployed...`);
    }
});


// @route   PATCH api/control/alien/return
// @desc    Update all interceptors to be not be deployed
// @access  Public
router.patch('/alien/return', async function (req, res) {
    let count = 0;
    let interceptors = await Interceptor.find().populate('team');
    interceptors = interceptors.filter(i => i.team.teamType === 'A')
    for await (const interceptor of interceptors) {
        if (interceptor.status.deployed === true) {
        count++
        interceptor.status.deployed = false;
        await interceptor.save();
        }
    }
    if (count === 0) {
        res.status(200).send(`No alien crafts availible to return to base...`);
    } else {
        res.status(200).send(`${count} alien crafts have returned to base...`);
    }
});

// @route   PATCH api/control/resethull
// @desc    Update all interceptors to max health
// @access  Public
router.patch('/resethull', async function (req, res) {
    for await (const interceptor of Interceptor.find()) {    
        console.log(`${interceptor.designation} has ${interceptor.stats.hull} hull points`);
        interceptor.stats.hull = interceptor.stats.hullMax;
        interceptor.status.destroyed = false;
        console.log(`${interceptor.designation} now has ${interceptor.stats.hull} hull points`);
        await interceptor.save();
    }
    res.send("Interceptors succesfully reset!");
});

// @route   PATCH api/control/loadSystems
// @desc    Loads all systems into game server
// @access  Public
router.patch('/loadSystems', async function (req, res) {
    let response = await loadSystems();
    res.status(200).send(response);
});

// @route   POST api/control/build
// @desc    Builds the thing!
// @access  Public

router.post('/build', async function (req, res) {
    let aircraft = req.body;
    aircraft.systems = [];
    for (let sys of aircraft.loadout) {
        let sysRef = systems[systems.findIndex(system => system.name === sys )];
        newSystem = await new System(sysRef);
        await newSystem.save(((err, newSystem) => {
          if (err) return console.error(`Post Build Interceptor System Save Error: ${err}`);
        }));
        //console.log(newSystem);
        aircraft.systems.push(newSystem._id);
    }
    let newInterceptor = new Interceptor(aircraft);
    newInterceptor = await newInterceptor.save();
    newInterceptor = await Interceptor.findById(newInterceptor._id).populate('team', 'shortName').populate('systems');
    newInterceptor.updateStats();
    //console.log(newInterceptor);
   
    res.status(200).send(newInterceptor);
});



module.exports = router;