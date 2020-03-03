const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');
const routeDebugger = require('debug')('app:routes:admin');

// Mongoose Models - Database models
const { Aircraft, validateAircraft, updateStats } = require('../../models/ops/aircraft');
const { Account } = require('../../models/gov/account');
const { Country } = require('../../models/country'); 
const { Zone } = require('../../models/zone'); 
const { Team } = require('../../models/team/team'); 
const { BaseSite } = require('../../models/sites/site');

// Game State - Server side template items
const { loadSystems, systems, validUnitType } = require('../../wts/construction/systems/systems');

const banking = require('../../wts/banking/banking')

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

module.exports = router

