const { Military } = require('../../models/military');
const { Site } = require('../../models/site');
const { Team } = require('../../models/team');
const { d6, rand } = require('../../util/systems/dice');
const { upgradeValue } = require('../upgrades/upgrades');


async function resolveBattle (attackers, defenders) {
	let attackerTotal = 0;
	let defenderTotal = 0;
	let attackerResult = 0;
	let defenderResult = 0;
	const spoils = [];
	let report = '';
	let combatRound = 1;

	for (combatRound; combatRound < 4; combatRound++) {
		attackerTotal = 0;
		defenderTotal = 0;
		attackerResult = 0;
		defenderResult = 0;

		if (attackers.length === 0 || defenders.length === 0) {
			break;
		}
		report += `Beginning Combat Round ${combatRound}\n\n`;
		// 1) calculate total attack value of attackers
		for (let unit of attackers) {
			unit = await Military.findById(unit).populate('upgrades');
			attackerTotal = attackerTotal + await upgradeValue(unit.upgrades, 'attack');
			attackerTotal = attackerTotal + unit.stats.attack;
		}

		// 2) calculate total defense value of attackers
		for (let unit of defenders) {
			unit = await Military.findById(unit).populate('upgrades');
			defenderTotal = defenderTotal + await upgradeValue(unit.upgrades, 'defense');
			defenderTotal = defenderTotal + unit.stats.defense;
		}

		// 3) roll both sides and save results
		for (let i = 0; i < attackerTotal; i++) {
			const result = d6();
			if (result > 2) {
				attackerResult++;
			}
		}
		for (let i = 0; i < defenderTotal; i++) {
			const result = d6();
			if (result > 2) {
				defenderResult++;
			}
		}
		report += `Attacker hit ${attackerResult} out of ${attackerTotal} rolls!\nDefender hit ${defenderResult} out of ${defenderTotal}!\nAssigning defender casualties...\n`;

		// 4) assign casualties to defenders
		for (let i = 0; i < attackerResult; i++) {
			if (defenders.length === 0) break;
			// 4.1) for every hit, randomly pick a unit from the defender
			const cas = rand(defenders.length) - 1;
			// 4.2) compile an array made up of unit's HP and upgrades
			const unit = await Military.findById(defenders[cas]).populate('upgrades');
			// 4.3) pick one element from that array
			const casSpecific = rand(unit.stats.health + unit.upgrades.length);

			if (casSpecific <= unit.stats.health) {
				// 4.4) if it is a "HP" result, unit takes a hit.
				unit.stats.health = unit.stats.health - 1;
				report += `${unit.name} has been hit!\n`;
				// MAKE SURE TO REMOVE UNIT IF IT HITS 0 HP
				if (unit.stats.health === 0) {
					report += `${unit.name} has been DESTROYED!\n`;
					unit.status.destroyed = true;
					defenders.splice(cas, 1);
				}
			}
			else {
				// 4.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
				const index = (rand(unit.upgrades.length) - 1);
				const hit = unit.upgrades[index];

				unit.upgrades.splice(index, 1);
				spoils.push(hit);
				report += `${hit.name} has been hit!\n`;
			}
			// save the unit that was hit
			await unit.save();
		}

		report += '\nAssigning attacker casualties...\n';

		// 5) assign casualties to attackers
		for (let i = 0; i < defenderResult; i++) {
			if (attackers.length === 0) break;
			const cas = rand(attackers.length) - 1;// 	5.1) for every hit, randomly pick a unit from the attacker
			const unit = await Military.findById(attackers[cas]).populate('upgrades'); 	// 	5.2) compile an array made up of unit's HP and upgrades
			// 	5.3) pick one element from that array
			const casSpecific = rand(unit.stats.health + unit.upgrades.length);

			if (casSpecific <= unit.stats.health) {
			// 	5.4) if it is a "HP" result, unit takes a hit.
				unit.stats.health = unit.stats.health - 1;
				report += `${unit.name} has been hit!\n`;

				// MAKE SURE TO REMOVE UNIT IF IT HITS 0 HP
				if (unit.stats.health === 0) {
					report += `${unit.name} has been DESTROYED!\n`;
					unit.status.destroyed = true;
					attackers.splice(cas, 1);
				}
			}
			else {
			// 	5.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
				const index = (rand(unit.upgrades.length) - 1);
				const hit = unit.upgrades[index];

				unit.upgrades.splice(index, 1);
				spoils.push(hit);
				report += `${hit.name} has been hit!\n`;
			}
			// save the unit that was hit
			await unit.save();
		}
	}// for combatRound

	const data = { attackerResult, defenderResult, report, spoils };
	return data;
}

module.exports = { resolveBattle };