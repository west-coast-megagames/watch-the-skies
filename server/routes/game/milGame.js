const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');

const { Account } = require('../../models/account');
const { Military } = require('../../models/military');
const { Site } = require('../../models/site');
const { Team } = require('../../models/team');

// Game Systems - Used to run Game functions
const banking = require('../../wts/banking/banking');
const nexusEvent = require('../../middleware/events/events');
const { d6, rand } = require('../../../dataUtil/systems/dice');
const { upgradeValue } = require('../../wts/upgrades/upgrades');

// Report Classes - Used to log game interactions
const { DeploymentReport } = require('../../wts/reports/reportClasses');
const randomCords = require('../../util/systems/lz');
const { resolveBattle } = require('../../wts/military/combat');
const { MilitaryMission } = require('../../models/report');


// @route   PUT game/military/deploy
// @Desc    Deploy a group of units for a country
// @access  Public
router.put('/deploy', async function (req, res) {
	const { units, cost, destination, team } = req.body;
	console.log(req.body);
	const teamObj = await Team.findOne({ name: team });
	let account = await Account.findOne({
		name: 'Operations',
		team: teamObj._id
	});
	routeDebugger(`${teamObj.name} is attempting to deploy.`);
	routeDebugger(
		`Deployment cost: $M${cost} | Account Balance: $M${account.balance}`
	);
	if (account.balance < cost) {
		routeDebugger('Not enough funding to deploy units...');
		res
			.status(402)
			.send(
				`Not enough funding! Assign ${
					cost - account.balance
				} more money teams operations account to deploy these units.`
			);
	}
	else {
		console.log(destination);
		const siteObj = await Site.findById(destination)
			.populate('country')
			.populate('zone');
		const unitArray = [];
		siteObj.status.warzone = true;

		for await (const unit of units) {
			const update = await Military.findById(unit);
			update.site = siteObj._id;
			update.country = siteObj.country._id;
			update.zone = siteObj.zone._id;
			update.status.deployed = true;
			update.location = randomCords(siteObj.geoDecimal.latDecimal, siteObj.geoDecimal.longDecimal);
			unitArray.push(update._id);
			await update.save();
		}

		account = await banking.withdrawal(
			account,
			cost,
			`Unit deployment to ${siteObj.name} in ${siteObj.country.name}, ${unitArray.length} units deployed.`
		);
		await account.save();
		await siteObj.save();
		routeDebugger(account);

		let report = new DeploymentReport();

		report.team = teamObj._id;
		report.site = siteObj._id;
		report.country = siteObj.country._id;
		report.zone = siteObj.zone._id;
		report.units = unitArray;
		report.cost = cost;

		report = await report.saveReport();

		// for await (let unit of units) {
		//   let update = await Military.findById(unit)
		//   unit.serviceRecord.push(report);
		//   await update.save();
		// }

		nexusEvent.emit('updateMilitary');
		res
			.status(200)
			.send(
				`Unit deployment to ${siteObj.name} in ${siteObj.country.name} succesful, ${unitArray.length} units deployed.`
			);
	}
});

// untested should be fine22
router.patch('/battleSim', async function (req, res) {
	let attackerTotal = 0;
	let defenderTotal = 0;
	let attackerResult = 0;
	let defenderResult = 0;
	let report = '';
	const { attackers, defenders } = req.body;
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
	report += `Attacker hit ${attackerResult} out of ${attackerTotal} rolls!\nDefender hit ${defenderResult} out of ${defenderTotal}!\n`;
	res.status(200).send(report);
});

router.patch('/resolve', async function (req, res) {
	let report = '';
	let data = {};
	for (const site of await Site.find({ 'status.warzone': true })) { // find all the sites that are a warzone
		// collect all the attackers
		report = '';
		const leadArmy = {
			team: '',
			strength: -1
		};

		let militaryReport = new MilitaryMission;
		militaryReport.type = 'Invade';
		const army = await Military.find({ site });

		const defenders = army.filter(el=> el.team.toHexString() === site.team.toHexString() && el.status.destroyed === false);
		const attackers = army.filter(el=> el.team.toHexString() != site.team.toHexString() && el.status.destroyed === false);
		const attackerTeams = [];
		// go over attackers, creating an array of objects
		for (const unit of attackers) {
			if (!attackerTeams.some(el => el === unit.team.toHexString())) attackerTeams.push(unit.team.toHexString());
		}

		report = report + (`Battle at ${site.name}:  \nDefenders: ${defenders.length}\nAttackers: ${attackers.length}\n\n`);
		militaryReport.attackers = attackers;
		militaryReport.defenders = defenders;
		militaryReport.attackingTeams = attackerTeams;
		militaryReport.site = site;

		if (attackers.length > 0 && defenders.length > 0) {
			data = await resolveBattle(attackers, defenders);
			report = report + data.report; // + 'spoils of war: \n' + data.spoils;
		}


		// if attackers were victorious
		if (defenders.length === 0 && attackers.length > 0) {
			report += 'The Attackers are victorious!\n';
			site.status.warzone = false;
			site.status.occupied = true;

			// determine who now owns the site.
			for (const team of attackerTeams) {
				let tempStrength = 0;
				const tempArmy = attackers.filter(el => el.team.toHexString() === team);
				for (let unit of tempArmy) {
					unit = await Military.findById(unit).populate('upgrades');
					tempStrength += unit.stats.attack + await upgradeValue(unit.upgrades, 'attack');
				}
				if (tempStrength > leadArmy.strength) {
					leadArmy.team = team;
					leadArmy.strength = tempStrength;
				}
				// I should put something in here if there's a tie, but fuck it. This will do till someone complains.
			}

			site.occupier = leadArmy.team;

			if (data.spoils && data.spoils.length > 0) {
				for (const upgrade of data.spoils) { // give out any spoils to the remainging attacker teams
					const unit = rand(attackers.length) - 1;
					upgrade.team = attackers[unit].team._id;
					await upgrade.save();
				}
			}

			// send the defeated units to a nearby site/facility
		}
		else if (attackers.length == 0) {		// else the defenders are victorius and there anre no more attackers?
			report += 'The Defenders are victorious!\n';
			site.status.warzone = false;
			for (const upgrade of data.spoils) {
				upgrade.team = site.team._id;
				await upgrade.save();
			}
			for (const unit of army) {
				await unit.recall();
			}
		}
		else {// else if it was a stalemate, no one recalls
			report += 'The Battle ended in a stalemate!\n';
			for (const upgrade of data.spoils) {
				const unit = rand(army.length) - 1;
				upgrade.team = army[unit].team._id;
				await upgrade.save();
			}
		}

		militaryReport.battleRecord = report;
		militaryReport.spoils = data.spoils;
		militaryReport = militaryReport.createTimestamp(militaryReport);
		militaryReport = await militaryReport.save();
		await site.save();
	}
	nexusEvent.emit('updateMilitary');
	res.status(200).send(report);
});

router.patch('/recall', async function (req, res) {
	for (const unit of await Military.find({ 'status.deployed': true })) {
		console.log(unit.name);
		await unit.recall();
	}
	nexusEvent.emit('updateMilitary');
	res.status(200).send('Military Units Recalled');
});

router.patch('/resethealth', async function (req, res) {
	for await (const unit of Military.find()) {
		console.log(`${unit.name} has ${unit.stats.health} health points`);
		unit.stats.health = unit.stats.healthMax;
		unit.status.destroyed = false;
		console.log(`${unit.name} now has ${unit.stats.health} health points`);
		await unit.save();
	}
	res.send('Military Health succesfully reset!');
	nexusEvent.emit('updateAircrafts');
});

module.exports = router;