const { d6 } = require('../../util/systems/dice');
const interceptDebugger = require('debug')('app:intercept');
const { outcome } = require('./outcome');
const { interceptDmg } = require('./damage');
const { generateCrash } = require('./salvage');
const { interceptLogging } = require('./report');

// Interception Algorithm - Expects an attacker object and a defender object from MongoDB
async function intercept (attacker, atkStance, atkReport, defender, defStance, defReport) {
	interceptDebugger('Beginning intercept...');

	let atkTotal = 0;
	let defTotal = 0;

	for (let i = 0; i < 2; i++) {
		const atkRoll = d6();
		atkTotal += atkRoll;
		const defRoll = d6();
		defTotal += defRoll;
		// Save rolls to attack report
		atkReport.interception.atkStats.rolls.push(atkRoll);
		// Save rolls to defense report
		defReport.interception.defStats.rolls.push(defRoll);
	}

	atkReport.interception.atkStats.rollTotal = atkTotal;
	atkReport.interception.atkStats.stance = atkStance;
	interceptDebugger(`${attacker.name} rolled a ${atkTotal}`);
	defReport.interception.defStats.rollTotal = defTotal;
	defReport.interception.defStats.stance = defStance;
	interceptDebugger(`${defender.name} rolled a ${defTotal}`);

	const atkResult = await outcome(attacker, atkTotal, atkStance); // Puts the attacker through the results table returning results data | outcome.js
	const defResult = await outcome(defender, defTotal, defStance); // Puts the attacker through the results table returning results data | outcome.js

	const offense = { attacker, atkResult, atkReport };
	const defense = { defender, defResult, defReport };

	const interceptReport = await interceptDmg(offense, defense); // Calculates damage and applies it | damage.js

	if (interceptReport.salvage.length > 0) {
		await generateCrash(interceptReport.salvage, attacker.site, attacker.organization);
	}

	interceptReport.atkReport = `${atkReport} ${interceptReport.atkReport}`;
	interceptReport.defReport = `${defReport} ${interceptReport.defReport}`;
	interceptLogging(interceptReport, attacker, defender); // Creates the final intercept logs for both teams | report.js
	interceptDebugger(`Atk After Action Report - ${atkReport} ${interceptReport.atkReport}`);
	interceptDebugger(`Def After Action Report - ${defReport} ${interceptReport.defReport}`);

	return;
}

module.exports = { intercept };