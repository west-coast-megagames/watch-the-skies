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
// const { d6 } = require('../../../dataUtil/systems/dice');

// Report Classes - Used to log game interactions
const { DeploymentReport } = require('../../wts/reports/reportClasses');
const randomCords = require('../../util/systems/lz');
const { runMilitary } = require('../../wts/military/combat');

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
		// console.log(destination);
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
		unit.stats.damaged = false;
		console.log(`${unit.name} now has ${unit.stats.health} health points`);
		await unit.save();
	}
	res.send('Military Health succesfully reset!');
	nexusEvent.emit('updateMilitary');
});

router.patch('/resetsites', async function (req, res) {
	for await (const site of Site.find()) {
		console.log(`Resetting ${site.name}`);
		site.status.warzone = false;
		site.status.occupied = false;
		site.occupier = await Team.findOne({ code: 'TCN' });
		await site.save();
	}
	console.log('All done');
	res.send('All sites succesfully reset!');
	nexusEvent.emit('updateSites');
});

router.put('/repair', async function (req, res) {
	const unit = await Military.findById(req.body._id);
	console.log(req.body);
	console.log(unit);
	let account = await Account.findOne({
		name: 'Operations',
		team: unit.team
	});
	if (account.balance < 2) {
		routeDebugger('Not enough funding...');
		res
			.status(402)
			.send(
				`No Funding! Assign more money to your operations account to repair ${unit.name}.`
			);
	}
	else {
		account = await banking.withdrawal(
			account,
			2,
			`Repairs for ${unit.name}`
		);
		await account.save();
		routeDebugger(account);

		// unit.status.repair = true;
		// unit.status.ready = false;
		unit.status.ready = true;
		unit.status.destroyed = false;
		unit.status.damaged = false;
		unit.stats.health = unit.stats.healthMax;

		await unit.save();

		routeDebugger(`${unit.name} put in for repairs...`);

		res.status(200).send(`${unit.name} put in for repairs...`);
		nexusEvent.emit('updateMilitary');
	}
});

router.patch('/resolve', async function (req, res) {
	await runMilitary();
	res.status(200).send('Battles resolved');
});


module.exports = router;