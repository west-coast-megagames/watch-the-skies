const { d6 } = require('../../util/systems/dice')
const interceptDebugger = require('debug')('app:intercept');
const { outcome } = require('./outcome')
const { interceptDmg } = require('./damage');
const interceptLogging = require('./report');

const { Interceptor } = require('../../models/ops/interceptor');

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
            result = `${result} Patrol mission activated.`;
            break;
        case (mission === 'Transport'):
            result = `${result} Transport mission activated.`;
            break;
        case (mission === 'Recon'):
            result = `${result} Recon mission activated.`;
            break;
        case (mission === 'Diversion'):
            result = `${result} Diversion mission activated.`;
            break;
        default:
            result = `${result} This is not an acceptable mission type.`;
    };

    interceptDebugger(`${result}`);

    return; 
};

async function resolveMissions () {
    interceptDebugger('Resolving Missions...')
    let count = 0; // Mission Counter.
    // Iterate over all submitted Interceptions
    for await (let interception of interceptionMissions) {
        count++ // Count iteration for each interception
        interceptDebugger(`Interception #${count}`)
        let stance = 'passive' // Targets stance for interception defaults to 'passive'
        let aircraft = await Interceptor.findById(interception.aircraft).populate('location.country', 'name').populate('systems');
        let target = await Interceptor.findById(interception.target).populate('systems');
        interceptDebugger(`${aircraft.name} vs. ${target.name}`);
        let report = `${aircraft.name} is attempting to engaged a contact in ${aircraft.location.country.name} airspace.`;
        
        // Check for all escort missions for any that are guarding interception target
        for (let escort of escortMissions) {
            interceptDebugger('Checking escort missions...')
            if (interception.target.toHexString() === escort.target.toHexString()) {
                interceptDebugger('Escort engaging!')
                target = await Interceptor.findById(escort.aircraft).populate('systems');
                escortMissions.splice(escortMissions.indexOf(escort), 1);
                stance = 'aggresive'
                report = `${report} Contact seems to have an escort, escort is breaking off to engage ${interception.aircraft.name}.`
            }
        };

        interceptDebugger(`${aircraft.name} is engaging ${target.name}.`);
        intercept(aircraft, target, stance, report);
    };
    interceptions = [];

    return;
}

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
async function intercept (attacker, defender, defStance, report) {
    interceptDebugger(`Beginning intercept...`)
    atkReport = `${report} ${attacker.name} has engaged ${defender.type}.`;
    defReport = `${defender.name} has been engaged by ${attacker.type}.`;
    
    let atkRoll = d6() + d6(); // Attacker Roll | 2 d6
    interceptDebugger(`${attacker.name} rolled a ${atkRoll}`);
    let defRoll = d6() + d6(); // Defender Roll | 2 d6
    interceptDebugger(`${defender.name} rolled a ${defRoll}`);

    let atkResult = await outcome(attacker, atkRoll, 'aggresive'); // Puts the attacker through the results table returning results data | outcome.js
    let defResult = await outcome(defender, defRoll, defStance); // Puts the attacker through the results table returning results data | outcome.js

    let interceptReport = await interceptDmg(attacker, defender, atkResult, defResult); // Calculates damage and applies it | damage.js
    interceptReport.atkReport = `${atkReport} ${interceptReport.atkReport}`
    interceptReport.defReport = `${defReport} ${interceptReport.defReport}`
    interceptLogging(interceptReport, attacker, defender); // Creates the final intercept logs for both teams | report.js
    interceptDebugger(`Atk After Action Report - ${atkReport} ${interceptReport.atkReport}`);
    interceptDebugger(`Def After Action Report - ${defReport} ${interceptReport.defReport}`);
};

module.exports = { start, resolveMissions };