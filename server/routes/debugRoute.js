const express = require('express');
const router = express.Router();
const nexusEvent = require('../startup/events');
const routeDebugger = require('debug')('app:routes:debug');
const { logger } = require('../middleware/winston');

const { startResearch, assignKnowledgeCredit } = require('../wts/research/research');

const { Upgrade } = require('../models/upgrade');
const { Facility } = require('../models/facility');
const { Aircraft } = require('../models/ops/aircraft');
const { upgradeValue, addUpgrade } = require('../wts/upgrades/upgrades');

const { rand } = require('../util/systems/dice');
const { resolveMissions } = require('../wts/intercept/missions');

// @route   PATCH debug/research
// @desc    Trigger the research system
// @access  Public
router.patch('/research', async function (req, res) {
    startResearch()
    res.status(200).send(`We triggered the research system!`);
});

// @route   PATCH debug/knowledge
// @desc    Trigger the research knowledge credit system
// @access  Public
router.patch('/knowledge', async function (req, res) {
    assignKnowledgeCredit();
    res.status(200).send(`We triggered the research credit system!`);
});

router.patch('/fixFacilities', async function (req, res) {
    let count = 0;
    for await (let facility of Facility.find()) {
        let { research, airMission, storage, manufacturing, naval, ground } = facility.capability;
        if (research.capacity > 0) {
            research.status.damage = [];
            research.status.pending = [];
            research.funding = []
            for (let i = 0; i < research.capacity; i++) {
                research.status.damage.set(i, false);
                research.funding.set(i, 0);
                research.status.pending.set(i, false);
            }
            research.active = true;
            research.sciRate = rand(25)
            research.sciBonus = 0
        }
        if (airMission.capacity > 0) airMission.active = true;
        if (storage.capacity > 0) storage.active = true;
        if (manufacturing.capacity > 0) manufacturing.active = true;
        if (naval.capacity > 0) naval.active = true;
        if (ground.capacity > 0) ground.active = true;

        routeDebugger(facility.capability);

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

router.patch('/missions', async function (req, res) {
    resolveMissions();
})

// @route   PATCH debug/returnAircraft
// @desc    Update all aircrafts to return to base
// @access  Public
router.patch("/returnAircraft", async function (req, res) {
    routeDebugger(`Returning all aircraft to base!`);
    let count = 0;
    for (const aircraft of await Aircraft.find()) {
        let response = await aircraft.returnToBase(aircraft);
        routeDebugger(response);
        count++;
    }
    res.status(200).send(`${count} aircrafts succesfully returned!`);
    nexusEvent.emit("updateAircrafts");
});



module.exports = router