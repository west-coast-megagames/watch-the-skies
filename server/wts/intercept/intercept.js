const { d6 } = require('../../util/systems/dice')
const interceptDebugger = require('debug')('app:intercept');
const { outcome } = require('./outcome')
const interceptDmg = require('./damage');
const report = require('./report');

const { Interceptor } = require('../../models/ops/interceptor');

let interceptionMissions = []; // Attempted Interception missions for the round
let escortMissions = []; // Attempted Escort missions for the round
let patrolMissions = []; // Attempted Patrol missions for the round
let transportMissions = []; // Attempted Transport missions for the round
let reconMissions = []; // Attempted Recon missions for the round
let diversionMissions = []; // Attempted Diversion missions for the round

async function start (aircraft, target, mission) {
    let result = `Plan for ${mission.toLowerCase()} mission by ${aircraft.designation} submitted.`
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
    let count = 0;
    // Iterate over all submitted Interceptions
    for await (let interception of interceptionMissions) {
        count++
        interceptDebugger(`Interception #${count}`)
        let stance = 'passive'
        let aircraft = await Interceptor.findById(interception.aircraft).populate('team', 'name');
        let target = await Interceptor.findById(interception.target);
        let report = `${aircraft.designation} is attempting to engaged a contact in ${aircraft.team.name} airspace.`; // TODO - Change team name to locational information
        
        // Check for all escort missions for any that are guarding interception target
        for (let escort of escortMissions) {
            interceptDebugger('Checking escort missions...')
            if (interception.target.toHexString() === escort.target.toHexString()) {
                interceptDebugger('Escort engaging!')
                target = await Interceptor.findById(escort.aircraft);
                escortMissions.splice(escortMissions.indexOf(escort), 1);
                stance = 'aggresive'
                report = `${report} Contact seems to have an escort, escort is breaking off to engage ${interception.aircraft.designation}.`
            }
        };

        interceptDebugger(`${aircraft.designation} is engaging ${target.designation}.`);
        
        intercept(aircraft, target, stance, report);
    };
    interceptions = [];

    return;
}

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
function intercept (attacker, defender, defStance, report) {
    interceptDebugger(`Beginning intercept...`)
    atkReport = `${report} ${attacker.designation} has engaged a ${defender.type}.`;
    defReport = `${defender.designation} has beem engaged a ${attacker.type}.`;
    
    let atkRoll = d6() + d6(); // Gets Attacker Roll
    interceptDebugger(`${attacker.designation} rolled a ${atkRoll}`);
    let defRoll = d6() + d6(); // Gets Defender Roll
    interceptDebugger(`${defender.designation} rolled a ${defRoll}`);

    let atkResult = outcome(attacker, atkRoll, 'aggresive');
    let defResult = outcome(defender, defRoll, defStance);

    // let interceptReport = interceptDmg(attacker, defender, atkResult, defResult);

    interceptDebugger(`${attacker.designation} got a ${atkResult.outcome}`);
    interceptDebugger(`${defender.designation} got a ${defResult.outcome}`);
    
//     const finalReport = {...interceptReport, ...result}

//    report(finalReport, attacker, defender, engaged);
    interceptDebugger(`Report: ${atkReport}`);
};

module.exports = { start, resolveMissions };