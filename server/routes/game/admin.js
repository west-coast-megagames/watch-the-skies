const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');
const routeDebugger = require('debug')('app:routes:admin');

// Mongoose Models - Database models
const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');
const { Account } = require('../../models/gov/account');
const { Facility } = require('../../models/gov/facility/facility');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team/team'); 
const { BaseSite } = require('../../models/sites/site');

// Game State - Server side template items
const { validUnitType } = require('../../wts/util/construction/validateUnitType');

const banking = require('../../wts/banking/banking');

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

module.exports = router

