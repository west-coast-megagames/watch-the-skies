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


router.patch('/battle', async function (req, res) {
	const { attackers, defenders } = req.body;
	let attackerTotal = 0;
	let defenderTotal = 0;
	let attackerResult = 0;
	let defenderResult = 0;
	const spoils = [];
	let report = '';

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
	report = `Attacker hit ${attackerResult} out of ${attackerTotal} rolls!\nDefender hit ${defenderResult} out of ${defenderTotal}!\nAssigning defender casualties...\n`;

	// 4) assign casualties to defenders
	for (let i = 0; i < attackerResult; i++) {
		// 4.1) for every hit, randomly pick a unit from the defender
		const cas = rand(defenders.length) - 1;
		// 4.2) compile an array made up of unit's HP and upgrades
		const unit = await Military.findById(defenders[cas]).populate('upgrades');
		// 4.3) pick one element from that array
		const casSpecific = rand(unit.stats.health + unit.upgrades.length);
		if (casSpecific <= unit.stats.health) {
			// 4.4) if it is a "HP" result, unit takes a hit.
			unit.stats.health = unit.stats.health - 1;
			report += `${unit.name} has been hit!`;
			console.log(unit.name);
			// MAKE SURE TO REMOVE UNIT IF IT HITS 0 HP
		}
		else {
			// 4.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
			const hit = unit.upgrades[rand(unit.upgrades.length) - 1];
			console.log(hit.name);
			// unit.upgrades[hit].pop or something
			spoils.push(hit);
			report += `${hit.name} has been hit!`;
		}
		// save the unit that was hit
	}

	// 5) assign casualties to attackers
	// 	5.1) for every hit, randomly pick a unit from the attacker
	// 	5.2) compile an array made up of unit's HP and upgrades
	// 	5.3) pick one element from that array
	// 	5.4) if it is a "HP" result, unit takes a hit.
	// 	5.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
	// 6) inform both generals of causalities
	// 7) ask both generals if they would like to proceed
	// 8) if both generals continue, repeat to step 1
	// 9) if one side backs out while they other continues, that side "wins"
	// 	 9.1) control of site goes to victor
	// 	 9.2) all damaged upgrades go to victor
	// step 10) if both sides back down, no one gets control, create new site w/ scrap of all upgrades

	const data = { attackerResult, defenderResult };
	res.status(200).send(data, report);
});

module.exports = router;