const missionDebugger = require('debug')('app:missions - air');
const nexusEvent = require('../../startup/events');
const { intercept } = require('./intercept')

const { Aircraft } = require('../../models/ops/aircraft')
const { Site } = require('../../models/sites/site');

let interceptionMissions = []; // Attempted Interception missions for the round
let escortMissions = []; // Attempted Escort missions for the round
let patrolMissions = []; // Attempted Patrol missions for the round
let transportMissions = []; // Attempted Transport missions for the round
let reconMissions = []; // Attempted Recon missions for the round
let diversionMissions = []; // Attempted Diversion missions for the round

let count = 0; // Mission Counter.

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
            missionDebugger(interceptionMissions);
            break;
        case (mission === 'Escort'):
            let newEscort = [{ aircraft, target }]; // Saves the Escort combination
            escortMissions = [...escortMissions, ...newEscort]; // Adds Escort to be resolved
            missionDebugger(escortMissions);
            break;
        case (mission === 'Patrol'):
            let newPatrol = [{ aircraft, target }]; // Saves the Patrol combination
            patrolMissions = [...patrolMissions, ...newPatrol]; // Adds Patrol to be resolved
            missionDebugger(patrolMissions);
            break;
        case (mission === 'Transport'):
            let newTransport = [{ aircraft, target }]; // Saves the Transport combination
            transportMissions = [...transportMissions, ...newTransport]; // Adds Transport to be resolved
            missionDebugger(transportMissions);
            break;
        case (mission === 'Recon'):
            let newRecon = [{ aircraft, target }]; // Saves the Recon combination
            reconMissions = [...ReconMissions, ...newRecon]; // Adds Recon to be resolved
            missionDebugger(reconMissions);
            break;
        case (mission === 'Diversion'):
            let newDiversion = [{ aircraft, target }]; // Saves the Recon combination
            diversionMissions = [...diversionMissions, ...newDiversion]; // Adds Recon to be resolved
            missionDebugger(diversionMissions);
            break;
        default:
            result = `${result} This is not an acceptable mission type.`;
    };

    missionDebugger(`${result}`);

    return; 
};

// Function for resolving missions when the Team Phase ends.
async function resolveMissions () {
    missionDebugger('Resolving Missions...')

    await runInterceptions();
    await runTransports();
    await runRecon();
    await clearMissions();

    nexusEvent.emit('updateAircrafts');

    return 0;
}

// Iterate over all submitted Interceptions
async function runInterceptions () {
    for await (let interception of interceptionMissions) {
        count++ // Count iteration for each interception
        missionDebugger(`Mission #${count} - Intercept Mission`)
        let stance = 'passive' // Targets stance for interception defaults to 'passive'
        let aircraft = await Aircraft.findById(interception.aircraft).populate('country', 'name').populate('systems');
        let target = await Aircraft.findById(interception.target).populate('systems');
        missionDebugger(`${aircraft.name} vs. ${target.name}`);
        let atkReport = `${aircraft.name} is attempting to engaged a contact in ${aircraft.country.name} airspace.`;
        
        let escortCheck = await checkEscort(interception.target, atkReport)

        target = escortCheck.target;
        atkReport = escortCheck.atkReport;
        defReport = escortCheck.defReport;
        
        missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
        atkReport = `${atkReport} ${aircraft.name} engaged ${target.type}.`;
        intercept(aircraft, 'aggresive', atkReport, target, stance, defReport );
    };
    return 0;
}

// Iterate over all remaining transport missions
async function runTransports () {
    for await (let transport of transportMissions) {
        count++ // Count iteration for each mission
        missionDebugger(`Mission #${count} - Transport Mission`);
        let aircraft = await Aircraft.findById(transport.aircraft).populate('country', 'name').populate('systems');
        let target = await Site.findById(transport.target); // Loading Site that the transport is heading to.
        missionDebugger(`${aircraft.name} transporting cargo to ${target.name}`);
        let atkReport = `${aircraft.name} hauling cargo through ${aircraft.country.name} airspace from ${target.name}`;

        let patrolCheck = await checkPatrol(transport.target, atkReport, aircraft)

        if (patrolCheck === 'continue') {
            atkReport = `${atkReport} ${aircraft.name} arrived safely at ${target.name}.`;
            missionDebugger(`${aircraft.name} arrived safely at ${target.name}`)
            // Make a mission log
            // Schedule a ground mission.
        }
    }
    
    return 0;
}

// Iterate over all remaining Recon missions
async function runRecon() {
    for await (let recon of reconMissions) {
        count++ // Count iteration for each mission
        missionDebugger(`Mission #${count} - Recon Mission`);
        let aircraft = await Aircraft.findById(recon.aircraft).populate('country', 'name').populate('systems');
        let atkReport = `${aircraft.name} conducting surveillance in ${aircraft.country.name}.`;
        if (aircraft.status.mission === 'Recon Aircraft') {
            let target = await Aircraft.findById(recon.target); // Loading Aircraft that the recon is heading to.
            let escortCheck = await checkEscort(recon.target, atkReport)

            target = escortCheck.target;
            atkReport = escortCheck.atkReport;
            if (target.toHexString() === recon.target.toHexString()) { // toHexString allows checking equality for _id
                atkReport = `${atkReport} ${aircraft.name} safely gathered information on ${target.type}.`;
            } else {
                defReport = escortCheck.defReport;
            
                missionDebugger(`${aircraft.name} is engaging ${target.name}.`);
                atkReport = `${atkReport} ${aircraft.name} engaged ${target.type}.`;
                intercept(aircraft, 'aggresive', atkReport, target, stance, defReport );

                return 0;
            }
        } else if (aircraft.status.mission === 'Recon Site') {
            let patrolCheck = await checkPatrol(recon.target, atkReport, aircraft);
            let target = await Site.findById(recon.target); // Loading Aircraft that the recon is heading to.
            if (patrolCheck === 'continue') {
                atkReport = `${atkReport} ${aircraft.name} safely gathered information on ${target.type}.`;
                missionDebugger(`${aircraft.name} safely gathered information on ${target.name}`)
                // Trigger information unlock
                // Make mission log
            }
        }
    }
}

// Check for all patrol missions for any that are guarding transport target (Site)
async function checkPatrol(target, atkReport, aircraft) {
    for (let patrol of patrolMissions) {
        missionDebugger('Checking patrol missions...')
        if (target.toHexString() === patrol.target.toHexString()) { // toHexString allows checking equality for _id
            missionDebugger('Patrol engaging!');
            target = await Aircraft.findById(patrol.aircraft).populate('systems');
            patrolMissions.splice(patrolMissions.indexOf(patrol), 1);
            atkReport = `${atkReport} patrol sited over target site, being engaged by ${target.type}.`;
            let defReport = `${target.name} breaking off from patrol to engage ${aircraft.type}.`
            intercept(aircraft, 'passive', atkReport, target, 'aggresive', defReport);
            return 'intercepted';
        };
    };
    return 'continue';
}

// Check for all escort missions for any that are guarding (Aircraft)
async function checkEscort(target, atkReport) {
    for (let escort of escortMissions) {
        missionDebugger('Checking escort missions...')
        if (target.toHexString() === escort.target.toHexString()) { // toHexString allows checking equality for _id
            missionDebugger('Escort engaging!')
            target = await Aircraft.findById(target);
            let newTarget = await Aircraft.findById(escort.aircraft).populate('systems');
            escortMissions.splice(escortMissions.indexOf(escort), 1);
            stance = 'aggresive'
            let defReport = `${newTarget.name} broke away from ${target.name} to engage incoming aircraft.`
            atkReport = `${atkReport} Contact seems to have an escort, escort is breaking off to engage.`
            target = newTarget;
            return { target, atkReport, defReport };
        }
    };
    target = await Aircraft.findById(target).populate('systems').populate('country');
    let defReport = `${target.name} engaged over ${target.country.name} airspace.`;
    return { target, atkReport, defReport };
}

function clearMissions() {
    interceptionMissions = []; // Attempted Interception missions for the round
    escortMissions = []; // Attempted Escort missions for the round
    patrolMissions = []; // Attempted Patrol missions for the round
    transportMissions = []; // Attempted Transport missions for the round
    reconMissions = []; // Attempted Recon missions for the round
    diversionMissions = []; // Attempted Diversion missions for the round

    return 0;
}

module.exports = { start, resolveMissions }