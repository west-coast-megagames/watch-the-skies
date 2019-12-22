const { atkRoll, defRoll } = require('./rolls');
const interceptDebugger = require('debug')('app:intercept');
const interceptDmg = require('./damage');
const report = require('./report');

const interceptor = require('../../models/ops/interceptor');

let interceptions = [];

async function launchInterception (attacker, defender) {
    interceptDebugger(`${attacker.designation} en route to intercept...`)

    await interceptor.launch(attacker); // Changes attacker status

    let newIntercept = [{ attacker, defender }]; // Saves the Intercept combination
    interceptions = [...interceptions, ...newIntercept]; // Adds Interception to be resolved

    interceptDebugger(interceptions);

    return `${attacker.designation} en route to intercept...`; 
};

function resolveInterceptions () {
    for (const interception of interceptions) {
        let { attacker, defender } = interception;

        intercept(attacker, defender);

        interceptions = [];
    };
}

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
function intercept (attacker, defender) {
    let engaged = `${attacker.designation} is attempting to engaged a ${defender.type} in ${defender.location.country.countryName} airspace.`;
    
    let atkResult = atkRoll(attacker); // Gets Attacker Roll
    let defResult = defRoll(defender); // Gets Defender Roll

    let interceptReport = interceptDmg(attacker, defender, atkResult, defResult);

    let result = {
        attackerReport: `${attacker.designation} got a ${atkResult.outcome}`,
        defenderReport: `${defender.designation} got a ${defResult.outcome}`
    };
    
    const finalReport = {...interceptReport, ...result}

   report(finalReport, attacker, defender, engaged);
};

module.exports = { launchInterception, resolveInterceptions };