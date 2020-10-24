const IntercptLog = require('../../models/logs/intereptLog');
const { Aircraft } = require('../../models/aircraft');
const interceptDebugger = require('debug')('app:intercept_report');

function interceptLogging (finalReport, attacker, defender) {
	const atkLog = {
		team: attacker.team,
		position: 'Offense',
		country: defender.country,
		zone: defender.zone,
		site: defender.site,
		report: finalReport.atkReport,
		unit: attacker._id,
		opponent: defender._id,
		atkStats: {
			damage: {
				frameDmg: finalReport.atkDmg,
				systemDmg: finalReport.atkSysDmg
			},
			outcome: finalReport.atkStatus
		},
		defStats: {
			damage: {
				frameDmg: finalReport.defDmg,
				systemDmg: finalReport.defSysDmg
			},
			outcome: finalReport.defStatus
		},
		salvage: finalReport.salvage
	};

	const defLog = {
		team: defender.team,
		position: 'Defense',
		country: defender.country,
		zone: defender.zone,
		site: defender.site,
		report: finalReport.defReport,
		unit: defender._id,
		opponent: attacker._id,
		atkStats: {
			damage: {
				frameDmg: finalReport.atkDmg,
				systemDmg: finalReport.atkSysDmg
			},
			outcome: finalReport.atkStatus
		},
		defStats: {
			damage: {
				frameDmg: finalReport.defDmg,
				systemDmg: finalReport.defSysDmg
			},
			outcome: finalReport.defStatus
		},
		salvage: finalReport.salvage
	};

	makeAfterActionReport(atkLog);
	makeAfterActionReport(defLog);
}

async function makeAfterActionReport (log) {
	const gameClock = require('../gameClock/gameClock');
	const { turn, phase, turnNum, minutes, seconds } = gameClock.getTimeRemaining();
	const timestamp = { timestamp: { turn, phase, turnNum, clock: `${minutes}:${seconds}` } };
	const date = Date.now();
	let newLog = new IntercptLog({ date, ...timestamp, ...log });

	newLog = await newLog.save();

	// Saves the log in the aircrafts survice record...
	const aircraft = await Aircraft.findById(newLog.unit);
	aircraft.serviceRecord.push(newLog._id);

	await aircraft.save();

	interceptDebugger(newLog);
}

module.exports = { interceptLogging, makeAfterActionReport };