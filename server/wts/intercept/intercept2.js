const interceptDebugger = require('debug')('app:intercept');
const { d10, rand } = require('../../util/systems/dice');
const dynReport = require('./battleDetails');
const { clearArrayValue, addArrayValue } = require('../../middleware/util/arrayCalls');

const { Aircraft } = require('../../models/aircraft');
const { Site } = require('../../models/site');

let attackReport = undefined; // Report for the mission member
let defenseReport = undefined; // Report for the mission target
let interception = {}; // Interception object

let attacker = undefined; // Aircraft on the mission
let defender = undefined; // Target of the interception

// Intercept Function: Initiates an interception
async function intercept(atkUnit, atkReport, defUnit, defReport) {
	interceptDebugger('Beginning intercept...');
	attackReport = atkReport; // Assigns the Attack Report to global variable
	defenseReport = defReport; // Assigns the Defense Report to global variable

	attackReport.report += ` ${dynReport.engageDesc(atkUnit, atkUnit.team)}`;
	attackReport.opponent = defUnit; // Tracks that the opponent is the current target
	attackReport.unit = atkUnit; // Tracks current stats of the unit
	attackReport.position = 'offense';

	defenseReport.opponent = atkUnit; // Tracks that the opponent is the attacker
	defenseReport.unit = defUnit; // Tracks current stats of the unit
	defenseReport.position = 'defense';

	// Resets the global interception report for both AAR reports.
	interception = {
		attacker: {
			stance: atkUnit.stance,
			rolls: [],
			outcomes: [],
			stats: [],
			dmg: {
				hull: 0,
				armor: 0,
				system: 0
			}
		},
		defender: {
			stance: defUnit.stance,
			rolls: [],
			outcomes: [],
			stats: [],
			dmg: {
				armor: 0,
				hull: 0,
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
	do {
		round++;
		interceptDebugger(`Round ${round} of intercept ${atkReport.code}`);

		const atkStats = combatBonus(attacker); // Calculates the current stats for the attacker
		interception.attacker.stats.push(atkStats);
		const defStats = combatBonus(defender); // Calculates the current stats for the defender
		interception.defender.stats.push(defStats);

		const atkHitTarget = 4 + defStats.evade - atkStats.detection; // Calculates how hard the defender is to hit
		const defHitTarget = 4 + atkStats.evade - defStats.detection; // Calculates how hard the attacker is to hit

		const atkRoll = round <= atkStats.attack ? d10() : 0; // Rolls attackers roll for the round, assigns 0 if they have no roll.
		interception.attacker.rolls.push(atkRoll); // Pushes the result to the attacker report.

		const defRoll = round <= defStats.attack ? d10() : 0; // Rolls defender roll for the round, assigns 0 if they have no roll.
		interception.defender.rolls.push(defRoll); // Pushes the result to defender report.

		interceptDebugger(`${attacker.name} rolled a ${atkRoll} for round ${round}!`);
		// Checks for a hit by the attacker for the round, and if it is a critical hit
		if (atkRoll >= atkHitTarget || atkRoll == 10) {
			if (atkRoll == 10) {
				defender = await dmgAircraft(defender, atkStats, 'defender', true); // Assigns a crit hit
				interception.attacker.outcomes.push('critical');
			}
			else {
				defender = await dmgAircraft (defender, atkStats, 'defender', false); // Assigns a normal hit
				interception.attacker.outcomes.push('hit');
			}
		}
		else if (atkRoll == 0) {
			interceptDebugger(`${attacker.name} is out of attacks!`);
			interception.attacker.outcomes.push('no attack');
		}
		else {
			attackReport.report = `${attackReport.report} ${dynReport.missedOpponent(attacker)}`; // dynamic reporting of attackers miss
			defenseReport.report = `${defenseReport.report} ${dynReport.dodgeDesc(defender)}`; // dynamic reporting of defender evading
			interception.attacker.outcomes.push('miss');
		}

		interceptDebugger(`${defender.name} rolled a ${defRoll} for round ${round}!`);
		// Checks for a hit by the defender for the round, and if it is a critical hit
		if (defRoll >= defHitTarget || defRoll == 10) {
			if (defRoll == 10) {
				attacker = await dmgAircraft(attacker, defStats, 'attacker', true); // Assigns a crit hit
				interception.defender.outcomes.push('critical');
			}
			else {
				attacker = await dmgAircraft (attacker, defStats, 'attacker', false); // Assigns a normal hit
				interception.defender.outcomes.push('hit');
			}

		}
		else if (defRoll == 0) {
			interceptDebugger(`${defender.name} is out of attacks!`);
			interception.defender.outcomes.push('no attack');
		}
		else {
			interceptDebugger(`${defender.name} missed the target of ${defHitTarget}!`);
			defenseReport.report = `${defenseReport.report} ${dynReport.missedOpponent(defender)}`; // dynamic reporting of defenders miss
			attackReport.report = `${attackReport.report} ${dynReport.dodgeDesc(attacker)}`; // dynamic reporting of attacker evading
			interception.defender.outcomes.push('miss');
		}

		// Combat ends if either aircraft is destroyed and a crash is generated for each destroyed aircraft
		if ((attacker.status.some(el => el === 'destroyed')) || (defender.status.some(el => el === 'destroyed'))) {
			// Generate Crash Site
			combat = false;
		}

		// TODO: Add way for units on 'evasive' stance with high evade value to end combat and continue on.

		if (attacker.stats.attack <= round && defender.stats.attack <= round) combat = false;
	}
	while (combat);

	attackReport.interception = interception;
	attackReport.createTimestamp();
	await attackReport.save();

	defenseReport.interception = interception;
	defenseReport.createTimestamp();
	await defenseReport.save();

	await applyDmg(attacker); // Saves the effects of the combat for the attacker
	await applyDmg(defender); // Saves the effects of the combat for the defender

	attackReport = undefined; // Resets Attack Report to undefined
	attacker = undefined; // Resets the attacker to undefefined
	defenseReport = undefined; // Resets Attack Report to undefined
	defender = undefined; // Resets the Defender to undefined

	return;
}

// Looks through the upgrades, system damage, and stance of a craft and adjusts the combat stats accordingly
function combatBonus(unit) {
	interceptDebugger(`Recalculating Combat Bonuses for ${unit.name}!`);
	const	stats = unit.stats.toObject();

	// Give stat bonus based on upgrades
	for (const upgrade of unit.upgrades) {
		if (upgrade.effects.length > 0) {
			for (const effect of upgrade.effects) {
				if (effect.type in stats) stats[effect.type] += effect.value;
			}
		}
	}

	const systemKeys = Object.keys(unit.systems); // Pulls all system keys
	systemKeys.shift(); // Gets rid of the system key 'index' at index 0

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

// Damages an aircraft due to the current side
async function dmgAircraft(unit, opposition, side, criticalHit) {
	interceptDebugger(`Damaging ${side} ${unit.name}...`);
	const { stats } = unit;
	let hits = 0;
	let crash = false;

	// If the unit has a positive ARMOR value, that will take the hit.
	if (stats.armor > 0 && !criticalHit) {
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
			const index = rand(systemKeys.length) - 1; // Selects a random system
			interception[side].dmg.system += hits; // Adds system hits to report

			const sysName = systemKeys[index];
			const upgrade = unit.upgrades.find(upG => upG.type === sysName);

			if (!upgrade || upgrade === null) {
				unit.systems[sysName].damaged ? unit.systems[sysName].destroyed = true : unit.systems[sysName].damaged = true;
				interception.salvage.push('scrap');
				interceptDebugger(`Damaging ${sysName} system...`);
				// TODO: Add dynamic report of system hit and status of system
			}
			else if (!upgrade.status.some(el => el === 'damaged')) {
				await addArrayValue(upgrade.status, 'damaged');
				await addArrayValue(upgrade.status, 'salvage');
				interception.salvage.push(upgrade._id);
				interceptDebugger(`Damaging Upgrade ${upgrade.name}...`);
				// TODO: Add dynamic report of upgrade loss and status of system
			}
			else if (upgrade.status.some(el => el === 'damaged')) {
				await addArrayValue(upgrade.status, 'destroyed');
				// TODO: add dynamic of upgrade destruction of the upgrade and status of the system
			}
		}
	}

	if (stats.armor < 0) unit.stats.armor = 0; // Sets ARMOR value tp 0 if it was taken negative.

	if (unit.systems['engine'].destroyed || unit.systems['cockpit'].destroyed) crash = true;

	if (unit.stats.hull <= 0 || crash === true) {
		interceptDebugger(`${unit.name} shot down in combat...`);
		await addArrayValue(unit.status, 'destroyed');
		// TODO: Add dynamic report for crash
		for (const upgrade of unit.upgrades) {
			await addArrayValue(upgrade.status, 'damaged');
			await addArrayValue(upgrade.status, 'salvage');
			interception.salvage.push(upgrade._id);
		}
	}

	return unit;
}

// Update Aircrafts with Damage
async function applyDmg(unit) {
	interceptDebugger(`Applying damage to ${unit.name}...`);
	const update = await Aircraft.findById(unit._id)
		.populate('team')
		.populate('origin');

	const origin = await Site.findById(update.origin.site._id);

	update.systems = unit.systems;
	update.stats.hull = unit.stats.hull;
	update.status.destroyed = (unit.status.some(el => el === 'destroyed'));
	update.mission = 'Docked';
	update.status.ready = true;
	update.status.deployed = false;
	update.organization = origin.organization;
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