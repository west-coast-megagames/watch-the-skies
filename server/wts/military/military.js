const { Military } = require('../../models/military');
const { MilitaryMission } = require('../../models/report');
const { Site } = require('../../models/site');
const { Team } = require('../../models/team');
const { d6, rand } = require('../../util/systems/dice');
const nexusEvent = require('../../middleware/events/events');
const routeDebugger = require('debug')('app:routes');
const { Upgrade } = require('../../models/upgrade');
const { Account } = require('../../models/account');
const { Facility } = require('../../models/facility');
const randomCords = require('../../util/systems/lz');
const { DeploymentReport } = require('../../models/report');
const { clearArrayValue, addArrayValue } = require('../../middleware/util/arrayCalls');

async function resolveBattle(attackers, defenders) {
	let attackerTotal = 0;
	let defenderTotal = 0;
	let attackerResult = 0;
	let defenderResult = 0;
	const spoils = [];
	let report = '';
	const resultReport = [];
	let combatRound = 1;

	for (combatRound; combatRound < 4; combatRound++) {
		attackerTotal = 0;
		defenderTotal = 0;
		attackerResult = 0;
		defenderResult = 0;
		const result = {
			round: combatRound,
			attackerRolls: 0,
			attackerHits: 0,
			defenderRolls: 0,
			defenderHits: 0,
			attackersDamaged: [],
			attackersDestroyed: [],
			defendersDamaged: [],
			defendersDestroyed: []
		};

		if (attackers.length === 0 || defenders.length === 0) {
			break;
		}
		report += `Beginning Combat Round ${combatRound}\n\n`;
		// 1) calculate total attack value of attackers
		for (let unit of attackers) {
			unit = await Military.findById(unit).populate('upgrades').lean();
			attackerTotal = attackerTotal + unit.stats.attack;
		}

		// 2) calculate total defense value of attackers
		for (let unit of defenders) {
			unit = await Military.findById(unit).populate('upgrades');
			defenderTotal = defenderTotal + unit.stats.defense;
		}

		// 3) roll both sides and save results
		for (let i = 0; i < attackerTotal; i++) {
			const res = d6();
			if (res > 2) {
				attackerResult++;
			}
		}
		for (let i = 0; i < defenderTotal; i++) {
			const res = d6();
			if (res > 2) {
				defenderResult++;
			}
		}
		report += `Attacker hit ${attackerResult} out of ${attackerTotal} rolls!\nDefender hit ${defenderResult} out of ${defenderTotal}!\nAssigning defender casualties...\n`;
		result.attackerRolls = attackerTotal;
		result.attackerHits = attackerResult;
		result.defenderRolls = defenderTotal;
		result.defenderHits = defenderResult;

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
				result.defendersDamaged.push(unit.name);

				// MAKE SURE TO REMOVE UNIT IF IT HITS 0 HP
				if (unit.stats.health === 0) {
					report += `${unit.name} has been DESTROYED!\n`;
					result.defendersDestroyed.push(unit.name);

					unit.status.destroyed = true;
					defenders.splice(cas, 1);
					while (unit.upgrades.length > 0) {
						const up = unit.upgrades.pop();
						for (const element of up.effects) {
							switch (element.type) {
							case 'attack':
								unit.stats.attack -= element.effect;
								break;
							case 'defense':
								unit.stats.defense -= element.effect;
								break;
							default: break;
							}
						}
						spoils.push(up);
					}
				}
			}
			else {
				// 4.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
				const index = (rand(unit.upgrades.length) - 1);
				const hit = unit.upgrades[index];

				unit.upgrades.splice(index, 1);
				for (const element of hit.effects) {
					switch (element.type) {
					case 'attack':
						unit.stats.attack -= element.effect;
						break;
					case 'defense':
						unit.stats.defense -= element.effect;
						break;
					default: break;
					}
				}
				spoils.push(hit);
				report += `${hit.name} has been hit!\n`;
				result.defendersDamaged.push(hit.name);
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
				result.attackersDamaged.push(unit.name);

				// MAKE SURE TO REMOVE UNIT IF IT HITS 0 HP
				if (unit.stats.health === 0) {
					report += `${unit.name} has been DESTROYED!\n`;
					result.attackersDestroyed.push(unit.name);

					unit.status.destroyed = true;
					attackers.splice(cas, 1);
					while (unit.upgrades.length > 0) {
						const up = unit.upgrades.pop();
						for (const element of up.effects) {
							switch (element.type) {
							case 'attack':
								unit.stats.attack -= element.effect;
								break;
							case 'defense':
								unit.stats.defense -= element.effect;
								break;
							default: break;
							}
						}
						spoils.push(up);
					}
				}
			}
			else {
			// 	5.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
				const index = (rand(unit.upgrades.length) - 1);
				const hit = unit.upgrades[index];

				unit.upgrades.splice(index, 1);
				for (const element of hit.effects) {
					switch (element.type) {
					case 'attack':
						unit.stats.attack -= element.effect;
						break;
					case 'defense':
						unit.stats.defense -= element.effect;
						break;
					default: break;
					}
				}
				spoils.push(hit);
				report += `${hit.name} has been hit!\n`;
				result.attackersDamaged.push(hit.name);
			}
			// save the unit that was hit
			await unit.save();
		}
		resultReport.push(result);
	}// for combatRound

	const data = { resultReport, report, spoils };
	return data;
}

async function runMilitary() {
	let report = '';
	let data = {};
	for (const site of await Site.find({ 'status': 'warzone' })) { // find all the sites that are a warzone
		// collect all the attackers
		report = '';
		const leadArmy = {
			team: '',
			strength: -1
		};

		let militaryReport = new MilitaryMission;
		militaryReport.type = 'Battle';
		const army = await Military.find({ site }).lean();

		/* TODO for adding allinaces into combat
			[] Creat a array of Teams involved
			[] Check each teams alliances
			[] Create armies for each alliance group

			1) Get list of all Teams at battle
			2) Go over list and compare each team's Alliances. Create list of who each team CAN attack
			3) Use valid targets list to assign casualties to enemies
			4) After combat round, update valid targets lists to remove those knocked out
		*/


		let defenders = [];
		let attackers = [];
		if (site.status.some(el => el === 'occupied')) {
			defenders = army.filter(el=> el.team.toHexString() === site.occupier.toHexString() && el.status.destroyed === false);
			attackers = army.filter(el=> el.team.toHexString() != site.occupier.toHexString() && el.status.destroyed === false);
		}
		else {
			defenders = army.filter(el=> el.team.toHexString() === site.team.toHexString() && el.status.destroyed === false);
			attackers = army.filter(el=> el.team.toHexString() != site.team.toHexString() && el.status.destroyed === false);
		}

		const attackerTeams = [];
		// go over attackers, creating an array of objects
		for (const unit of attackers) {
			if (!attackerTeams.some(el => el.toHexString() === unit.team.toHexString())) attackerTeams.push(unit.team);
		}

		report = report + (`Battle at ${site.name}:  \nDefenders: ${defenders.length}\nAttackers: ${attackers.length}\n\n`);
		militaryReport.attackers = attackers;
		militaryReport.defenders = defenders;
		militaryReport.attackingTeams = attackerTeams;
		militaryReport.site = site;

		if (attackers.length > 0 && defenders.length > 0) {
			data = await resolveBattle(attackers, defenders);
			report = report + data.report; // + 'spoils of war: \n' + data.spoils;
			militaryReport.results = data.resultReport;
		}


		// if attackers were victorious
		if (defenders.length === 0 && attackers.length > 0) {
			report += 'The Attackers are victorious!\n';
			militaryReport.winner = 'The Attackers are victorious';
			let liberated = false;
			await clearArrayValue(site.status, 'warzone');
			await addArrayValue(site.status, 'occupied');

			// determine who now owns the site.
			for (const team of attackerTeams) {
				let tempStrength = 0;
				const tempArmy = attackers.filter(el => el.team.toHexString() === team.toHexString());
				for (let unit of tempArmy) {
					unit = await Military.findById(unit);
					tempStrength += unit.stats.attack;
				}
				if (tempStrength > leadArmy.strength) {
					leadArmy.team = team;
					leadArmy.strength = tempStrength;
				}
				// I should put something in here if there's a tie, but fuck it. This will do till someone complains.
			}

			site.occupier = leadArmy.team;
			if (site.occupier.toHexString() === site.team.toHexString()) {
				militaryReport.winner += ', and the site was liberated';
				site.status.occupied = false;

				await clearArrayValue(site.status, 'occupied');
				liberated = true;
			}

			for (let unit of army) {
				unit = await Military.findById(unit._id);
				if (unit.status.destroyed === true || (liberated && unit.team.toHexString() === site.team.toHexString())) {
					await unit.recall();
				}
			}

			// hit this logic if combat has been resolved successfully
			if (site.subType === 'Point of Interest') {
				site.hidden = true;
				console.log('Site hidden');
			}

			// TODO: Add in any crash site spoils to the iterator

			if (data.spoils && data.spoils.length > 0) {
				for (let upgrade of data.spoils) { // give out any spoils to the remainging attacker teams
					const unit = rand(attackers.length) - 1;
					upgrade = await Upgrade.findById(upgrade);
					upgrade.status.damaged = true;
					upgrade.status.storage = true;
					upgrade.team = attackers[unit].team._id;
					await upgrade.save();
				}
			}

			// send the defeated units to a nearby site/facility
		}
		else if (attackers.length == 0) {		// else the defenders are victorius and there anre no more attackers?
			report += 'The Defenders are victorious!\n';
			militaryReport.winner = 'The Defenders are victorious';
			
			await clearArrayValue(site.status, 'warzone');

			if (data.spoils && data.spoils.length > 0) {
				for (let upgrade of data.spoils) {
					upgrade = await Upgrade.findById(upgrade);
					upgrade.status.damaged = true;
					upgrade.status.storage = true;
					upgrade.team = site.team._id;
					await upgrade.save();
				}
			}

			for (let unit of army) {
				unit = await Military.findById(unit._id);
				if (attackerTeams.some(el => el.toHexString() === unit.team.toHexString()) || unit.status.destroyed === true) {
					await unit.recall();
				}
			}
		}
		else {// else if it was a stalemate, no one recalls
			report += 'The Battle ended in a stalemate!\n';
			militaryReport.winner = 'The Battle ended in a stalemate';
			if (data.spoils && data.spoils.length > 0) {
				for (let upgrade of data.spoils) {
					const unit = rand(army.length) - 1;
					upgrade = await Upgrade.findById(upgrade);
					upgrade.status.damaged = true;
					upgrade.status.storage = true;
					upgrade.team = army[unit].team._id;
					await upgrade.save();
				}
			}

		}

		militaryReport.battleRecord = report;
		militaryReport.spoils = data.spoils;
		militaryReport = militaryReport.createTimestamp(militaryReport);

		for (const team of attackerTeams) {
			let newReport = new MilitaryMission({
				team,
				type: militaryReport.type,
				attackers: militaryReport.attackers,
				defenders: militaryReport.defenders,
				attackingTeams: militaryReport.attackingTeams,
				site: militaryReport.site,
				battleRecord: militaryReport.battleRecord,
				results: militaryReport.results,
				winner: militaryReport.winner,
				spoils: militaryReport.spoils
			});

			newReport = newReport.createTimestamp(newReport);
			newReport = await newReport.save();
		}

		militaryReport.team = site.team;
		militaryReport = await militaryReport.save();
		await site.save();
	}
	nexusEvent.emit('updateMilitary');
	nexusEvent.emit('updateSites');
	nexusEvent.emit('updateLogs');
}

async function repairUnit(data) {
	const unit = await Military.findById(data._id);

	let account = await Account.findOne({
		name: 'Operations',
		team: unit.team
	});
	if (account.balance < 2) {
		// error send here
		return ({ message : `No Funding! Assign more money to your operations account to repair ${unit.name}.`, type: 'error' });
	}
	else {
		account = await account.withdrawal({ from: account, amount: 2, note: `Repairs for ${unit.name}` });

		// unit.status.repair = true;
		// unit.status.ready = false;
		unit.status.ready = true;
		unit.status.destroyed = false;
		unit.status.damaged = false;
		unit.stats.health = unit.stats.healthMax;
		await unit.save();
		return ({ message : `${unit.name} repaired!`, type: 'success' });
	}
}

async function transferUnit(data) { // for transferring to other facilities as an action
	// TODO: Check if Facility has capacity
	const unit = await Military.findById(data.unit);
	const facility = await Facility.findById(data.facility).populate('site');

	if (unit.status.action) {
		unit.origin = data.facility;
		unit.status.action = false;

		unit.location = randomCords(facility.site.geoDecimal.lat, facility.site.geoDecimal.lng);
		unit.site = facility.site;
		unit.organization = facility.site.organization;
		unit.zone = facility.site.zone;
		unit.status.deployed = false;

		await unit.save();
		return ({ message : `Used ${unit.name}'s action to transfer to ${facility.name}!`, type: 'success' });
	}
	else if (unit.status.mission) {
		unit.origin = data.facility;
		unit.status.mission = false;
		unit.status.ready = false;

		unit.location = randomCords(facility.site.geoDecimal.lat, facility.site.geoDecimal.lng);
		unit.site = facility.site;
		unit.organization = facility.site.organization;
		unit.zone = facility.site.zone;
		unit.status.deployed = false;

		await unit.save();
		return ({ message : `Used ${unit.name}'s mission to transfer to ${facility.name}!`, type: 'success' });
	}
	else {
		return ({ message : `${unit.name} has already used its Action this turn. Transfer cancelled.`, type: 'error' });
	}

}

async function deployUnit(data, type) {
	// this code assumes all units passed to it are eligible for deploy/invade. Re-writes are required if we want double checking
	const { units, cost, destination, team } = data;
	const teamObj = await Team.findOne({ name: team });
	let account = await Account.findOne({
		name: 'Operations',
		team: teamObj._id
	});
	routeDebugger(`${teamObj.name} is attempting to deploy.`);
	routeDebugger(
		`${type} cost: $M${cost} | Account Balance: $M${account.balance}`
	);
	if (account.balance < cost) {
		routeDebugger('Not enough funding to deploy units...');
		return ({ message : `Not enough funding! Assign ${cost - account.balance} more money teams operations account to deploy these units.`, type: 'error' });
	}
	else {
		const siteObj = await Site.findById(destination)
			.populate('organization')
			.populate('zone');
		const unitArray = [];

		for await (const unit of units) {
			const update = await Military.findById(unit);

			if (type === 'invade') {
				update.status.mission = false;
			}
			else {
				update.status.action = false;
			}


			update.site = siteObj._id;
			update.organization = siteObj.organization._id;
			update.zone = siteObj.zone._id;
			update.status.deployed = true;
			update.location = randomCords(siteObj.geoDecimal.lat, siteObj.geoDecimal.lng);
			unitArray.push(update._id);
			await update.save();
		}

		account = await account.withdrawal({ from: account._id, amount: cost, note: `Unit ${type} to ${siteObj.name} in ${siteObj.organization.name}, ${unitArray.length} units deployed.` });

		if (type === 'invade') {
			siteObj.warzone = true;
			await siteObj.save();
		}

		routeDebugger(account);

		let report = new DeploymentReport();

		report.team = teamObj._id;
		report.site = siteObj._id;
		report.organization = siteObj.organization._id;
		report.zone = siteObj.zone._id;
		report.units = unitArray;
		report.cost = cost;

		report = await report.saveReport();

		// for await (let unit of units) {
		//   let update = await Military.findById(unit)
		//   unit.serviceRecord.push(report);
		//   await update.save();
		// }

		return ({ message : `Unit ${type} to ${siteObj.name} in ${siteObj.organization.name} succesful, ${unitArray.length} units deployed.`, type: 'success' });
	}
}


module.exports = { resolveBattle, runMilitary, repairUnit, transferUnit, deployUnit };