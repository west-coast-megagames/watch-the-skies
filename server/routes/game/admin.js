const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');
const routeDebugger = require('debug')('app:routes:admin');

const { rand } = require('../../util/systems/dice');

// Mongoose Models - Database models
const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');
const { Account } = require('../../models/gov/account');
const { Facility } = require('../../models/gov/facility/facility');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team/team'); 
const { BaseSite } = require('../../models/sites/site');

// Game State - Server side template items
const { loadSystems, systems } = require('../../wts/construction/systems/systems');
const { validUnitType } = require('../../wts/util/construction/validateUnitType');

const banking = require('../../wts/banking/banking');
const { logger } = require('../../middleware/winston');

// MUST BUILD - Initiation
router.get('/initialteGame', async (req, res) => {
    try {
        // Load Knowledge
        // Load Tech
        // Seed Research
        // Load Equipment
        // Load Facilities
        // Log Game state
        res.status(200).send('Successful Initiation...');
    } catch (err) {
        res.send(err);
    }
});


// @route   PATCH game/admin/resethull
// @desc    Update all aircrafts to max health
// @access  Public
router.patch('/resethull', async function (req, res) {
    for await (const aircraft of Aircraft.find()) {    
        console.log(`${aircraft.name} has ${aircraft.stats.hull} hull points`);
        aircraft.stats.hull = aircraft.stats.hullMax;
        aircraft.status.destroyed = false;
        console.log(`${aircraft.name} now has ${aircraft.stats.hull} hull points`);
        await aircraft.save();
    }
    res.send("Aircrafts succesfully reset!");
    nexusEvent.emit('updateAircrafts');
});

// @route   PATCH game/admin/resetLabs
// @desc    Update all labs to empty
// @access  Public
router.patch('/resetLabs', async function (req, res) {
    for await (const lab of Facility.find({ type: 'Lab'})) {    
        routeDebugger(`${lab.name} has ${lab.research.length} projects`);
        lab.research = []
        routeDebugger(`${lab.name} now has ${lab.research.length} projects`);
        await lab.save();
    }
    res.status(200).send("Labs succesfully reset!");
    nexusEvent.emit('updateFacilities');
});

router.patch('/fixFacilities', async function (req, res) {
    let count = 0;
    for await (let facility of Facility.find()) {
        let { research, airMission, storage, manufacturing, naval, ground } = facility.capability;
        if (research.capacity > 0) {
            research.active = true;
            research.sciRate = rand(25)
            research.sciBonus = 0
        }
        if (airMission.capacity > 0) airMission.active = true;
        if (storage.capacity > 0) storage.active = true;
        if (manufacturing.capacity > 0) manufacturing.active = true;
        if (naval.capacity > 0) naval.active = true;
        if (ground.capacity > 0) ground.active = true;

        console.log(facility.capability);

        logger.info(`${facility.name} - research: ${research.active}`);
        logger.info(`${facility.name} - airMission: ${airMission.active}`);
        logger.info(`${facility.name} - storage: ${storage.active}`);
        logger.info(`${facility.name} - manufacturing: ${manufacturing.active}`);
        logger.info(`${facility.name} - naval: ${naval.active}`);
        logger.info(`${facility.name} - ground: ${ground.active}`);

        await facility.save();
        count++
    }
    return res.status(200).send(`We handled ${count} facilities...`)
})

module.exports = router

