const interceptDebugger = require('debug')('app:intercept');
const { d10, rand } = require('../../util/systems/dice');

const { Aircraft } = require('../../models/aircraft');
const { Site } = require('../../models/site');

let attackReport = undefined;
let defenseReport = undefined;
let interception = {};

let attacker = undefined;
let defender = undefined;

async function intercept (atkUnit, atkReport, defUnit, defReport) {
	interceptDebugger('Beginning intercept...');
	attackReport = atkReport; // Assigns the Attack Report to global variable
	defenseReport = defReport; // Assigns the Defense Report to global variable
	// Resets the global interception report for both AAR reports.
	interception = {
		attaker: {
			stance: atkUnit.stance,
			rolls: [],
			outcomes: [],
			dmg: {
				armor: 0,
				frame: 0,
				system: 0
			}
		},
		defender: {
			stance: defUnit.stance,
			rolls: [],
			outcomes: [],
			dmg: {
				armor: 0,
				frame: 0,
				system: 0
			}
		},
		salvage: []
	};

	attacker = atkUnit; // Assigns the Attacker to a global variable
	defender = defUnit; // Assigns the Defender to a global variable

	// Abort if we don't have two units, and two reports.
	if (!attackReport || !defenseReport || !attacker || !defender) return;

	let round = 0;
	let combat = true;

	// Combat lasts until a unit dies, bugs out, or evades.
	while (combat) {
		round++;
		interceptDebugger(`Round ${round} of intercept ${atkReport.code}`);

		const atkStats = combatBonus(attacker);
		const defStats = combatBonus(defender);

		const atkHitTarget = 6 + defStats.evade - atkStats.detection;
		const defHitTarget = 6 + atkStats.evade - defStats.detection;

		const atkRoll = round <= atkStats.attack ? d10() : 0; // Rolls attakers roll for the round, assigns 0 if they have no roll.
		interception.attaker.rolls.push(atkRoll); // Pushes the result to the attackers report.

		const defRoll = round <= defStats.attack ? d10() : 0; // Rolls defender roll for the round, assigns 0 if they have no roll.
		interception.attaker.rolls.push(atkRoll);

		interceptDebugger(`${attacker.name} rolled a ${atkRoll} for round ${round}!`);
		if (atkRoll >= atkHitTarget || atkRoll == 10) {
			defender = await dmgAircraft(defender, atkStats, 'defender');

		}
		else {
			interceptDebugger(`${attacker.name} missed the target of ${atkHitTarget}!`);
			// dynamic reporting of attackers miss
			// dynamic reporting of defender evading
		}

		interceptDebugger(`${defender.name} rolled a ${defRoll} for round ${round}!`);
		if (defRoll >= defHitTarget || defRoll == 10) {
			if (defRoll == 10) {
				attacker = await dmgAircraft(attacker, defStats, 'attacker', true); // Assigns a crit hit
			}
			else {
				attacker = await dmgAircraft (attacker, defStats, 'attaker', false); // Assigns a normal hit
			}

		}
		else {
			interceptDebugger(`${defender.name} missed the target of ${defHitTarget}!`);
			// dynamic reporting of defenders miss
			// dynamic reporting of defender evading
		}

		// Combat ends if either aircraft is destroyed and a crash is generated for each destroyed aircraft
		if (attacker.status.destroyed || defender.status.destroyed) {
			// Generate Crash Site
			combat = false;
		}

		// TODO: Add way for units on 'evasive' stance with high evade value to end combat and continue on.

		if (attacker.stats.attack <= round && defender.stats.attack <= round) combat = false;
	}

	attackReport.interception = interception;
	defenseReport.interception = interception;
	await attackReport.save();
	await defenseReport.save();

	await applyDmg(attacker);
	await applyDmg(defender);

	return;
}

function combatBonus (unit) {
	interceptDebugger(`Recalculating Combat Bonuses for ${unit.name}!`);
	const	stats = unit.stats;

	// Give stat bonus based on upgrades
	for (const upgrade of unit.upgrades) {
		for (const effect of upgrade.effects) {

			if (effect.type in stats) stats[effect.type] += effect.value;

		}
	}

	const systemKeys = Object.keys(unit.systems); // Pulls all system keys
	systemKeys.shift();
	// Checks craft for damage for this round
	for (const key of systemKeys) {
		switch (key) {
		case ('cockpit'):
			if (unit.systems[key].damaged) {
				stats.attack -= 1;
				stats.detection -= 1;
				stats.evade += 1;
			}
			break;
		case ('engine'):
			if (unit.systems[key].damaged) {
				stats.evade -= 1;
			}
			break;
		case ('weapon'):
			if (unit.systems[key].damaged) {
				stats.attack -= 1;
			}
			break;
		case ('sensor'):
			if (unit.systems[key].damaged) {
				stats.detection -= 1;
			}
			break;
		default:
			interceptDebugger(`This craft has an unexpected ${key} system...`);
		}	
	}

	interceptDebugger(`${unit.name} is in a ${unit.stance} stance.`);
	// Give stat bonus based on stance
	switch (unit.stance) {
	case ('aggresive'):
		stats.attack += 1;
		stats.evade -= 1;
		break;
	case ('evasive'):
		stats.attack -= 1;
		stats.evade += 1;
		break;
	default:
	}
	return stats;
}

async function dmgAircraft (unit, opposition, side, criticalHit) {
	interceptDebugger(`Damaging ${unit.name} due to damage by the ${side}.`);
	const { stats } = unit;
	let hits = 0;
	let crash = false;

	// If the unit has a positive ARMOR value, that will take the hit.
	if (stats.armor > 0) {
		unit.stats.armor -= opposition.penetration; // Does damage equal to PENETRATION to armor
		interception[side].dmg.armor += opposition.pentration; // Adds armor damage to report.
		// TODO: Add dynamic report about armor hit.
	}
	else {
		criticalHit ? hits += 2 : hits += 1;
		unit.stats.hull -= hits; // Units take 1 DMG any time damage gets past ARMOR
		interception[side].dmg.hull += hits ; // Adds hull damage to report.
		const systemKeys = Object.keys(unit.systems); // Pulls all system keys
		systemKeys.shift();

		for (let i = 0; i < hits; i++) {
			const index = rand(systemKeys.length - 1); // Selects a random system

			const sysName = systemKeys[index].charAt(0).toUpperCase() + systemKeys[index].slice(1);
			const upgrade = unit.upgrades.find(upG => upG.type === sysName);
			if (!upgrade || upgrade === null) {
				unit.systems[sysName].damaged ? unit.systems[sysName].destroyed = true : unit.systems[sysName].damaged = true;
				interception.salvage.push('scrap');
				interceptDebugger(`Damaging Upgrade ${upgrade.name}...`);
				// TODO: Add dynamic report of system hit and status of system
			}
			else if (upgrade.status.damaged === false) {
				upgrade.status.damaged = true;
				upgrade.status.salvage = true;
				interception.salvage.push(upgrade._id);
				interceptDebugger(`Damaging Upgrade ${upgrade.name}...`);
				// TODO: Add dynamic report of upgrade loss and status of system
			}
			else if (upgrade.status.damaged === true) {
				upgrade.status.destroyed = true;
				// TODO: add dynamic of upgrade destruction of the upgrade and status of the system
			}
		}
	}

	if (stats.armor < 0) unit.stats.armor = 0; // Sets ARMOR value tp 0 if it was taken negative.

	if (unit.systems['engine'].destroyed || unit.systems['cockpit'].destroyed) crash = true;

	if (unit.stats.hull <= 0 || crash === true) {
		interceptDebugger(`${unit.name} shot down in combat...`);
		unit.status.destroyed = true;
		// TODO: Add dynamic report for crash
		for (const upgrade of unit.upgrades) {
			upgrade.status.damaged = true;
			upgrade.status.salvage = true;
			interception.salvage.push(upgrade._id);
		}
	}

	return unit;
}

// Update Aircrafts with Damage
async function applyDmg (unit) {
	interceptDebugger(`Applying damage to ${unit.name}...`);
	const update = await Aircraft.findById(unit._id)
		.populate('team')
		.populate('origin');

	const origin = await Site.findById(update.origin.site._id);

	update.systems = unit.systems;
	update.stats.hull = unit.stats.hull;
	update.status.destroyed = unit.status.destroyed;
	update.mission = 'Docked';
	update.status.ready = true;
	update.status.deployed = false;
	update.country = origin.country;
	update.site = update.origin._id;
	update.zone = origin.zone;

	if (unit.stats.hull != unit.stats.hullMax) {
		update.status.damaged = true;
	}

	await update.save();
	interceptDebugger(`Damage applied to ${unit.name}...`);
	return;
}

module.exports = { intercept };