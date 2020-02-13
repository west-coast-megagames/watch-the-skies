const { d6 } = require('../../util/systems/dice')
const interceptDebugger = require('debug')('app:intercept');
const { outcome } = require('./outcome')
const { interceptDmg } = require('./damage');
const interceptLogging = require('./report');

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
async function intercept (attacker, atkStance, atkReport, defender, defStance, defReport) {
    interceptDebugger(`Beginning intercept...`)
    
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

module.exports = { intercept };