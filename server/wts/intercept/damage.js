const interceptDebugger = require('debug')('app:intercept - damage');
const { generateSalvage } = require('./salvage');
const { d6, rand } = require('../../util/systems/dice');

// Intercepter Model
const { Aircraft } = require('../../models/aircraft');
const { Site } = require('../../models/site');

async function interceptDmg (attacker, defender, atkResult, defResult) {
	interceptDebugger('Prepearing damage report...');
	const defOutcome = {
		evade: defResult.evade - Math.floor(atkResult.evade / 2), // Final defender evade
		damage: defResult.damage, // Final self dmg to defender
		sysDmg: defResult.sysDmg, // Hard system damage
		hit: atkResult.hit, // If defender was hit
		weaponDmg: atkResult.attack, // Weapon damage on hit
		sysHit: atkResult.penetration - defender.stats.armor// # of system hits
	};

	if (atkResult.sysHit) defOutcome.sysHit += 2;

	const atkOutcome = {
		evade: atkResult.evade - Math.floor(defResult.evade / 2),
		damage: atkResult.damage,
		sysDmg: atkResult.sysDmg,
		hit: defResult.hit,
		weaponDmg: defResult.attack,
		sysHit: defResult.penetration - attacker.stats.armor
	};

	if (defResult.sysHit) atkOutcome.sysHit += 2;

	const defReport = await dmgCalc(defender, defOutcome);
	const atkReport = await dmgCalc(attacker, atkOutcome);

	const dmgReport = {
		defDmg: defReport.dmg,
		defSysDmg: defReport.sysDmg,
		defenseDesc: defReport.dmgDesc,
		defStatus: defReport.outcome,
		defReport: defReport.aar,
		atkDmg: atkReport.dmg,
		atkSysDmg: atkReport.sysDmg,
		atkDesc: atkReport.dmgDesc,
		atkStatus: atkReport.outcome,
		atkReport: atkReport.aar,
		salvage: [...atkReport.salvage, ...defReport.salvage]
	};

	if (defOutcome.destroyed) dmgReport.atkReport = `${dmgReport.atkReport} ${dmgReport.defStatus}`;
	if (atkOutcome.destroyed) dmgReport.defReport = `${dmgReport.defReport} ${dmgReport.atkStatus}`;

	return dmgReport;
}

async function dmgCalc (unit, report) {
	const { evade, damage, sysDmg, hit } = report;
	let { weaponDmg, sysHit } = report;
	const { name } = unit;

	interceptDebugger(`Calculating ${name} damage...`);
	interceptDebugger(report);
	let battleReport = '';
	const salvageArray = [];
	let crash = false;

	let atkDmg = 0;
	let evaded = 0;
	let systemHits = 0;

	if (evade > 0) {
		weaponDmg < evade ? evaded = weaponDmg : evaded = evade;
		weaponDmg < evade ? weaponDmg = 0 : weaponDmg -= evade;
		battleReport = `${battleReport}${name} evades ${evaded}pts of damage. `;
		interceptDebugger(battleReport);
	}

	hit === true ? atkDmg = weaponDmg : sysHit = 0; // If a hit is scored then add damage otherwise no system hits happen.

	let hullDmg = atkDmg + damage;
	interceptDebugger(`${unit.name} takes ${hullDmg} damage!`);

	if (sysHit > 0 || sysDmg) {
		sysDmg === true ? (systemHits = sysHit + 2) : (systemHits = sysHit);

		const systemKeys = Object.keys(unit.systems);

		for (let i = 0; i < systemHits; i++) {
			const index = rand(systemKeys.length - 1);

			const sysName = systemKeys[index].charAt(0).toUpperCase() + systemKeys[index].slice(1);

			// TODO: Check upgrade array for relevant upgrade
			const upgrade = unit.upgrades.find(upG => upG.type === sysName);
			if (!upgrade || upgrade === null) {
				// default salvage here.. whenever we figure that out
				salvageArray.push('Salvage'); // placehoder for now

				interceptDebugger(`Damaging System ${sysName}...`);
				battleReport = `${battleReport}${sysName} damaged. `;
				unit.systems[systemKeys[index]].damaged ? unit.systems[systemKeys[index]].destroyed = true : unit.systems[systemKeys[index]].damaged = true;
				hullDmg += 1;
			}
			else if (upgrade.status.damaged === false) {
				upgrade.status.damaged = true;
				upgrade.status.salvage = true;
				salvageArray.push(upgrade._id);
				interceptDebugger(`Damaging Upgrade ${upgrade.name}...`);
			}
			else if (upgrade.status.damaged === true) {
				upgrade.status.destroyed = true;
				// no salvage from destroyed systems? idk, might want to prevent "double dipping"
			}
		}
	}

	if (unit.systems['engine'].destroyed || unit.systems['cockpit'].destroyed) crash = true;

	unit.stats.hull = unit.stats.hull - hullDmg;
	battleReport = `${battleReport}${unit.name} took ${hullDmg}pts of damage in the battle. `;
	if (unit.systems['engine'].destroyed) {battleReport = `${battleReport}${unit.name} has lost control due to engine damage. `;}
	if (unit.systems['cockpit'].destroyed) {battleReport = `${battleReport}All contact with the pilot has been lost. `;}
	interceptDebugger(battleReport);

	const dmgReport = {
		dmg: hullDmg,
		sysDmg: systemHits > 0 ? true : false,
		dmgDesc: `${unit.name} took ${hullDmg} damage!`,
		outcome: `${unit.name} returns to base!`,
		destroyed: false,
		salvage: salvageArray,
		aar: battleReport
	};

	if (unit.stats.hull <= 0 || crash === true) {
		interceptDebugger(`${unit.name} shot down in combat...`);
		unit.status.destroyed = true;
		dmgReport.outcome = `${unit.name} shot down in combat...`;
		(dmgReport.destroyed = true),
		(dmgReport.aar = `${dmgReport.aar}${unit.name} shot down in combat...`);
		for (const upgrade of unit.upgrades) {
			upgrade.status.damaged = true;
			upgrade.status.destroyed = true;
			salvageArray.push(upgrade._id);
		}
		// a few default salvage
		salvageArray.push('Salvage');
	}

	await applyDmg(unit);
	return dmgReport;
}

// Update Aircrafts with Damage
async function applyDmg (unit) {
	interceptDebugger(`Applying damage to ${unit.name}...`);
	const update = await Aircraft.findById(unit._id)
		.populate('team')
		.populate('origin');

	const origin = await Site.findById(update.origin.site._id);

	// if (update.team.type === 'Alien') {
	// 	return 0;
	// }
	// interceptDebugger(unit);
	// interceptDebugger(update);

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
	return 0;
}

module.exports = { interceptDmg, dmgCalc };