const { d6 } = require('../../util/systems/dice')
const interceptDebugger = require('debug')('app:intercept');
const { outcome } = require('./outcome')
const { interceptDmg } = require('./damage');
const interceptLogging = require('./report');

const { Interceptor } = require('../../models/ops/interceptor');
const { Aircraft } = require('../../models/ops/aircraft')
const { Site } = require('../../models/sites/site');

let interceptionMissions = []; // Attempted Interception missions for the round
let escortMissions = []; // Attempted Escort missions for the round
let patrolMissions = []; // Attempted Patrol missions for the round
let transportMissions = []; // Attempted Transport missions for the round
let reconMissions = []; // Attempted Recon missions for the round
let diversionMissions = []; // Attempted Diversion missions for the round

// Start function | loads in an aircraft & target as well as the mission type and saves them for resolution
async function start (aircraft, target, mission) {
    let result = `Plan for ${mission.toLowerCase()} mission by ${aircraft.name} submitted.`
    aircraft = aircraft._id; // Saves just the _ID of the aircraft
    target = target._id; // Saves just the _ID of the target

    // SWITCH Sorts the mission into the correct mission array
    switch(true) {
        case (mission === 'Interception'):
            let newIntercept = [{ aircraft, target }]; // Saves the Intercept combination
            interceptionMissions = [...interceptionMissions, ...newIntercept]; // Adds Interception to be resolved
            interceptDebugger(interceptionMissions);
            break;
        case (mission === 'Escort'):
            let newEscort = [{ aircraft, target }]; // Saves the Escort combination
            escortMissions = [...escortMissions, ...newEscort]; // Adds Escort to be resolved
            interceptDebugger(escortMissions);
            break;
        case (mission === 'Patrol'):
            let newPatrol = [{ aircraft, target }]; // Saves the Patrol combination
            patrolMissions = [...patrolMissions, ...newPatrol]; // Adds Patrol to be resolved
            interceptDebugger(patrolMissions);
            break;
        case (mission === 'Transport'):
            let newTransport = [{ aircraft, target }]; // Saves the Transport combination
            transportMissions = [...transportMissions, ...newTransport]; // Adds Transport to be resolved
            interceptDebugger(transportMissions);
            break;
        case (mission === 'Recon'):
            let newRecon = [{ aircraft, target }]; // Saves the Recon combination
            reconMissions = [...ReconMissions, ...newRecon]; // Adds Recon to be resolved
            interceptDebugger(reconMissions);
            break;
        case (mission === 'Diversion'):
            let newDiversion = [{ aircraft, target }]; // Saves the Recon combination
            diversionMissions = [...diversionMissions, ...newDiversion]; // Adds Recon to be resolved
            interceptDebugger(diversionMissions);
            break;
        default:
            result = `${result} This is not an acceptable mission type.`;
    };

    interceptDebugger(`${result}`);

    return; 
};

// Function for resolving missions when the Team Phase ends.
async function resolveMissions () {
    interceptDebugger('Resolving Missions...')
    let count = 0; // Mission Counter.

    // Iterate over all submitted Interceptions
    for await (let interception of interceptionMissions) {
        count++ // Count iteration for each interception
        interceptDebugger(`Mission #${count} - Intercept Mission`)
        let stance = 'passive' // Targets stance for interception defaults to 'passive'
        let aircraft = await Aircraft.findById(interception.aircraft).populate('country', 'name').populate('systems');
        let target = await Aircraft.findById(interception.target).populate('systems');
        interceptDebugger(`${aircraft.name} vs. ${target.name}`);
        let report = `${aircraft.name} is attempting to engaged a contact in ${aircraft.country.name} airspace.`;
        
        // Check for all escort missions for any that are guarding interception target (Aircraft)
        for (let escort of escortMissions) {
            interceptDebugger('Checking escort missions...')
            if (interception.target.toHexString() === escort.target.toHexString()) {
                interceptDebugger('Escort engaging!')
                target = await Aircraft.findById(escort.aircraft).populate('systems');
                escortMissions.splice(escortMissions.indexOf(escort), 1);
                stance = 'aggresive'
                report = `${report} Contact seems to have an escort, escort is breaking off to engage ${target.name}.`
            }
        };

        interceptDebugger(`${aircraft.name} is engaging ${target.name}.`);
        report = `${report} ${attacker.name} engaged ${defender.type}.`;
        intercept(aircraft, 'aggresive', target, stance, report);
    };
    interceptions = [];

    // Iterate over all remaining transport missions
    for await (let tansport of transportMissions) {
        count++ // Count iteration for each mission
        interceptDebugger(`Mission #${count} - Transport Mission}`);
        let stance = 'passive' // Targets stance for transport defaults to 'passive'
        let aircraft = await Aircraft.findById(transport.aircraft).populate('country', 'name').populate('systems');
        let target = await Site.findById(transport.target); // Loading Site that the transport is heading to.
        interceptDebugger(`${aircraft.name} transporting cargo to ${target.name}`);
        let report = `${aircraft.name} hauled cargo through ${aircraft.country.name} airspace, attemting to reach ${target.name}`;

        // Check for all patrol missions for any that are guarding transport target (Site)
        for (let patrol of patrolMissions) {
            interceptDebugger('Checking patrol missions...')
            if (transport.target.toHexString() === patrol.target.toHexString()) {
                interceptDebugger('Patrol engaging!')
                target = await Aircraft.findById(patrol.aircraft).populate('systems');
                patrolMissions.splice(patrolMissions.indexOf(patrol), 1);
                stance = 'aggresive'
                report = `${report} patrol sited over target site, being engaged by ${patrol.type}.`;
                intercept(aircraft, 'passive', target, stance, report);
            }
        };

        interceptDebugger(`${aircraft.name} arrived safely at ${target.name}`)
    }

    return;
}

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
async function intercept (attacker, atkStance, defender, defStance, report) {
    interceptDebugger(`Beginning intercept...`)
    let atkReport = report;
    let defReport = `${defender.name} engaged ${attacker.type}.`;
    
    let atkRoll = d6() + d6(); // Attacker Roll | 2 d6
    interceptDebugger(`${attacker.name} rolled a ${atkRoll}`);
    let defRoll = d6() + d6(); // Defender Roll | 2 d6
    interceptDebugger(`${defender.name} rolled a ${defRoll}`);

    let atkResult = await outcome(attacker, atkRoll, atkStance); // Puts the attacker through the results table returning results data | outcome.js
    let defResult = await outcome(defender, defRoll, defStance); // Puts the attacker through the results table returning results data | outcome.js

    let interceptReport = await interceptDmg(attacker, defender, atkResult, defResult); // Calculates damage and applies it | damage.js
    interceptReport.atkReport = `${atkReport} ${interceptReport.atkReport}`
    interceptReport.defReport = `${defReport} ${interceptReport.defReport}`
    interceptLogging(interceptReport, attacker, defender); // Creates the final intercept logs for both teams | report.js
    interceptDebugger(`Atk After Action Report - ${atkReport} ${interceptReport.atkReport}`);
    interceptDebugger(`Def After Action Report - ${defReport} ${interceptReport.defReport}`);
};

module.exports = { start, resolveMissions };