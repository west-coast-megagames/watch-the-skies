const express = require('express');
const router = express.Router();
const nexusEvent = require('../../middleware/events/events');
const routeDebugger = require('debug')('app:routes:game');

// Mongoose Models - Used to save and validate objects into MongoDB
const { Account } = require('../../models/account');
const { Aircraft, validateRoles } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { Military } = require('../../models/military');
const { Site } = require('../../models/site');
const { Squad } = require('../../models/squad');
const { Team, validateTeam } = require('../../models/team');
const { Trade } = require('../../models/trade');
const { Treaty } = require('../../models/treaty');

// Game Systems - Used to run Game functions
const airMission = require('../../wts/intercept/missions');
const banking = require('../../wts/banking/banking');
const { newUpgrade } = require('../../wts/construction/construction');
const { upgradeValue, removeUpgrade, addUpgrade } = require('../../wts/upgrades/upgrades');
const { resolveTrade } = require('../../wts/trades/trade');
const validateObjectId = require('../../middleware/util/validateObjectId');
const science = require('../../wts/research/research');

// Report Classes - Used to log game interactions
const { DeploymentReport } = require('../../wts/reports/reportClasses');
const { func } = require('joi');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error logging
const nexusError = require('../../middleware/util/throwError');
const { Upgrade } = require('../../models/upgrade');
const { d6, rand } = require('../../../dataUtil/systems/dice');


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ACCOUNTS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ARTICLES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~AUTH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~BANKING~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~CONTROL~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~COUNTRY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~FACILITIES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~HOME~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~INTERCEPT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~INTERCEPTOR~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   POST api/aircraft/build
// @Desc    Takes in blueprint and name and facility(?) and starts construction on a new aircraft
// @access  Public
router.post('/build', async (req, res) => {
	const { name, facility, type, team } = req.body; // please give me these things
	try {
		const aircraft = await newUnit(name, facility, type, team); // just the facility ID
		res.status(200).send(aircraft);
	}
	catch (err) {
		res.status(404).send(err); // This returns a really weird json... watch out for that
	}
});

// @route   POST api/aircraft/transfer
// @Desc
// @access  Public
router.put('/transfer', async (req, res) => {// work in progress, still broken
	let { aircraft, facility } = req.body; // please give me these things
	try {
		const target = await Facility.findById(facility).populate('site');
		aircraft = await Aircraft.findById(aircraft);
		if (!aircraft || aircraft == null) {
			nexusError('Could not find aircraft!', 404);
		}

		aircraft.status.deployed = true;
		aircraft.status.ready = false;
		aircraft.site = target._id;

		const mission = 'Transfer';
		aircraft.mission = mission;
		aircraft.origin = facility._id;

		aircraft = await aircraft.save();
		await airMission.start(aircraft, target, mission);

		res.status(200).send(`Transfer of ${aircraft.name} to ${target.name} initiated...`);
	}
	catch (err) {
		res.status(400).send(`Error in transfer route: ${err}`);
	}
});
// @route   PUT game/aircraft/repair
// @desc    Update aircraft to max health
// @access  Public
router.put('/repair', async function (req, res) {
	const aircraft = await Aircraft.findById(req.body._id);
	console.log(req.body);
	let account = await Account.findOne({
		name: 'Operations',
		team: aircraft.team
	});
	if (account.balance < 2) {
		res
			.status(402)
			.send(
				`No Funding! Assign more money to your operations account to repair ${aircraft.name}.`
			);
	}
	else {
		account = await banking.withdrawal(
			account,
			2,
			`Repairs for ${aircraft.name}`
		);
		await account.save();

		aircraft.status.repair = true;
		aircraft.ready = false;
		await aircraft.save();

		res.status(200).send(`${Aircraft.name} put in for repairs...`);
		nexusEvent.emit('updateAircrafts');
	}
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~LOG~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~LOGERRORS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~LOGINFO~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~MILITARY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
/*
/*
ok scott's logic in battle:
1) calculate total attack value of attackers
2) calculate total defense value of attackers
3) roll both sides and save results
4) assign casualties to defenders
   4.1) for every hit, randomly pick a unit from the defender
   4.2) compile an array made up of unit's HP and upgrades
   4.3) pick one element from that array
   4.4) if it is a "HP" result, unit takes a hit.
   4.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
5) assign casualties to attackers
   5.1) for every hit, randomly pick a unit from the attacker
   5.2) compile an array made up of unit's HP and upgrades
   5.3) pick one element from that array
   5.4) if it is a "HP" result, unit takes a hit.
   5.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
6) inform both generals of causalities
7) ask both generals if they would like to proceed
8) if both generals continue, repeat to step 1
9) if one side backs out while they other continues, that side "wins"
    9.1) control of site goes to victor
    9.2) all damaged upgrades go to victor
step 10) if both sides back down, no one gets control, create new site w/ scrap of all upgrades
*/


router.patch('/battle', async function (req, res) {
	const { attackers, defenders } = req.body;
	let attackerTotal = 0;
	let defenderTotal = 0;
	let attackerResult = 0;
	let defenderResult = 0;
	const spoils = [];


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
			console.log(unit.name);
		}
		else {
			// 4.5) if it is a "Upgrade" result, the upgrade is damaged, removed from the unit, and "dropped" onto the battlefield
			const hit = unit.upgrades[rand(unit.upgrades.length) - 1];
			console.log(hit.name);
			// unit.upgrades[hit].pop or something
			spoils.push(hit);
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

	res.status(200).send(`Attacker strength: ${attackerTotal}\nAttacker Hits: ${attackerResult}
	\nDefender strength: ${defenderTotal}\n Defender Hits: ${defenderResult}`);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~NEWS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~RESEARCH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   GET api/research/sciStats
// @Desc    Get global science state
// @access  Public
router.get('/sciState', async function (req, res) {
	routeDebugger('Sending server science state...');
	const state = {
		fundingCost: science.fundingCost,
		techCost: science.techCost
	};
	res.status(200).json(state);
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SITES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TEAM~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   PUT api/team/id
// @Desc    Update Existing Team
// @access  Public
router.put('/:id', validateObjectId, async (req, res) => {
	try {
		const id = req.params.id;

		const { error } = validateTeam(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const roles = req.body.roles;
		if (roles) {
			try {
				for (const currRole of roles) {
					const test2 = validateRoles(currRole);
					if (test2.error) return res.status(400).send(`Team Val Roles Error: ${test2.error.details[0].message}`);
				}
			}
			catch (err) {
				return res.status(400).send(`Team Val Roles Error: ${err.message}`);
			}
		}

		const team = await Team.findByIdAndUpdate(req.params.id,
			{ name: req.body.name,
				teamCode: req.body.teamCode,
				shortName: req.body.shortName,
				teamType: req.body.teamType,
				roles: req.body.roles,
				prTrack: req.body.prTrack,
				prLevel: req.body.prLevel,
				sciRate: req.body.sciRate
			},
			{ new: true, omitUndefined: true }
		);

		if (team != null) {
			res.json(team);
		}
		else {
			res.status(404).send(`The Team with the ID ${id} was not found!`);
		}
	}
	catch (err) {
		console.log(`Team Put Error: ${err.message}`);
		res.status(400).send(`Team Put Error: ${err.message}`);
	}
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TRADE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   POST api/trade
// @Desc    Post a new trade
// @access  Public
router.post('/', async function (req, res) {
	logger.info('POST Route: api/blueprints call made...');
	const { tradePartner, initiator } = req.body;
	/*
    if ( tradePartner.offer.length < 1 && initiator.offer.length < 1 ){
        res.status(400).send(`This trade is empty!`);
    }
    */
	let trade = new Trade(req.body);

	// get actual trade object and then push on their array
	let initiatorTeam = await Team.findById({ _id: initiator });
	trade = await trade.saveActivity(trade, `Trade Created By ${initiatorTeam.name}`);
	initiatorTeam.trades.push(trade._id);
	initiatorTeam = await initiatorTeam.save();

	trade.initiator.team = initiatorTeam;
	trade.tradePartner.team = await Team.findById({ _id: tradePartner });

	// nexusEvent.emit('updateTeam');
	routeDebugger(trade);
	res.status(200).json(trade);
});


// @route   PUT game/trade/modify
// @Desc    Modify a specific Trade
// @access  Public
router.put('/modify', async function (req, res) {
	const { initiator, tradePartner } = req.body;
	// console.log(req.body)
	let trade = await Trade.findById({ _id: req.body._id });
	let mName = '';

	if (initiator.modified === true) {// if the initiator modified the trade
		trade.initiator.ratified = true;
		trade.tradePartner.ratified = false;
		trade.initiator.modified = false;
		mName = trade.initiator.team.name;
	}
	else if (tradePartner.modified === true) { // if the partner modified the deal
		trade.tradePartner.modified = false;
		trade.tradePartner.ratified = true;
		trade.initiator.ratified = false;
		mName = trade.tradePartner.team.name;
	}
	else{
		res.status(400).send('Could not determine who modified this trade');
	}

	// save new trade deal over old one
	trade.initiator = initiator;
	trade.tradePartner = tradePartner;

	// set status flags
	trade.status.draft = false;
	trade.status.rejected = false;
	trade.status.deleted = false;
	trade.status.proposal = true;

	trade = await trade.saveActivity(trade, `Trade Modified By ${mName}`);
	res.status(200).send(`Trade deal modified successfully by ${mName}`);
});

// @route   POST api/trades/process
// @Desc    Create a new trade
// @access  Public
router.post('/process', async function (req, res) {
	resolveTrade(req, res);
});

// @route   PUT api/trades/reject
// @Desc    Reject a trade deal
// @access  Public
router.put('/reject', async function (req, res) {
	const { initiator, tradePartner } = req.body;
	let trade = await Trade.findById({ _id: req.body._id }).populate('initiator.team').populate('tradePartner.team');
	let mName = '';

	if (initiator.modified === true) {// if the initiator modified the trade
		trade.initiator.modified = false;
		mName = trade.initiator.team.name;
	}
	else if (tradePartner.modified === true) { // if the partner modified the deal
		trade.tradePartner.modified = false;
		mName = trade.tradePartner.team.name;
	}

	trade.initiator.ratified = false;
	trade.tradePartner.ratified = false;

	// set status flags
	trade.status.draft = false;
	trade.status.rejected = true;
	trade.status.proposal = false;
	trade = await trade.saveActivity(trade, `Trade Rejected By ${mName}`);

	res.status(200).send('Trade Deal Rejected');

});// router

// @route   DELETE api/trades/id
// @Desc    Delete a specific trade
// @access  Public
router.delete('/id', async function (req, res) {
	try{
		const removalTeam = await Team.findById({ _id: req.body.teamID });
		for (let i = 0; i < removalTeam.trades.length; i++) {
			if (removalTeam.trades[i] == req.body.tradeID) {
				removalTeam.trades.splice(i, 1);
				removalTeam.save();
			}
		}
		let trade = await Trade.findById({ _id: req.body._id });
		trade.status.deleted = true;
		trade = await trade.saveActivity(trade, `Trade Closed By ${removalTeam.name}`);

		res.status(200).send(`We killed trade: ${req.body.tradeID}`);
	}// try
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(400).send(`Error deleting trade: ${err}`);
	}// catch
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TREATY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// @route   PUT game/modify
// @Desc    Modify a treaty
// @access  Public
// EXPECTATIONS: "treaty": {<Treaty Object>}, "changes": [{"changeType": "name of change", data: "<W/E is changing>"}], "modifier": "<modifier team ID>"
/* "changes" methods and logic:
1) "name": replaces treaty's name with whatever "name" is paired with
2) "cost": replaces treaty's cost with whatever "cost" is paired with
3) "author": checks the treaties author array. if the changed author is not in the array, they will be
    added, then will check and add them to witnesses if they are absent. Else if they are already
    in the array, they will be removed from the authorship (but NOT from witness)
4) "witness": adds the desired team to the witness array only if they aren't in there already
5) "excluded":
6) "expiration": replaces treaty's name with whatever "expiration" is paired with
7) "alliance":
8) "clauses": replaces treaty's cost with whatever "clauses" is paired with
9) "violition": replaces treaty's cost with whatever "violition" is paired with
10) "status": NOT HERE making it's own thing
*/
router.put('/treaties/modify', async function (req, res) {
	let { treaty, changes, modifier } = req.body;
	if (treaty.status.draft === false) {
		res.status(400).send('Cannot modify a treaty that is in the proposal state');
	}
	try{
		let cNum = 0;
		let newAuthor;
		let newWitness;
		treaty = await Treaty.findById({ _id: treaty._id });// populate treaty
		modifier = await Team.findById({ _id: modifier });
		for (const element of changes) {
			switch(element.changeType) {
			case 'name':// change the name of the treaty
				treaty.name = element.data;
				cNum++;
				break;
			case 'cost':// adjust cost of treaty
				treaty.cost = element.data;
				cNum++;
				break;
			case 'author':// add authorship rights of this treaty for another team
				newAuthor = await Team.findById({ _id: element.data });
				// step 1) check to see if author is being removed or added to treaty
				if(!treaty.authors.includes(newAuthor._id)) {// if the treaty does not have this author
					treaty.authors.push(newAuthor._id); // add new author to treaty
					if(!treaty.witness.includes(newAuthor._id)) {
						treaty.witness.push(newAuthor._id); // add new author to treaty's witness array
					}
					if (!newAuthor.treaties.includes(treaty._id)) {// if the team treaty array does NOT have this treaty in it
						newAuthor.treaties.push(treaty._id);
					}
				}// if the treaty does not have this author
				else{
					const x = treaty.authors.indexOf(newAuthor._id);
					treaty.authors.splice(x, 1);// remove author from treaty array
				}
				newAuthor = await newAuthor.save();
				cNum++;
				break;
			case 'witness':// allow other teams to view this treaty
				newWitness = await Team.findById({ _id: element.data });
				if(!treaty.witness.includes(newWitness._id)) {// if witness is not in the treaty array yet
					treaty.witness.push(newWitness._id);
					newWitness.treaties.push(treaty._id);
					cNum++;
				}
				break;
			case 'excluded':// block country from ratifying this treaty
				// COME BACK AND DO THIS CODE YOU COWARD
				break;
			case 'expiration':// change the expiration date
				treaty.expiration = element.data;
				cNum++;
				break;
			case 'alliance':// add an alliance type to the treaty
				// once we figure out what alliances are n such we'll come back
				if(!treaty.alliances.includes(element.data)) {
					treaty.alliances.push(element.data);
				}
				else{
					const x = treaty.alliances.indexOf(element.data);
					treaty.alliances.splice(x, 1);// remove author from treaty array
				}
				break;
			case 'clauses':// change the clauses of the treaty
				treaty.clauses = element.data;
				cNum++;
				break;
			case 'violition':// change the violition of the treaty
				treaty.violition = element.data;
				cNum++;
				break;
			}// switch
		}// for
		treaty = await treaty.saveActivity(treaty, `${cNum} Elements of Treaty Modified `);
		res.status(200).send(`${cNum} Elements of Treaty Modified by ${modifier.name}`);
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(500).send(`Error modifying treaty: ${err}`);
	}// catch
});

// @route   PUT game/treaties/ratify
// @Desc    Ratify a treaty for your team
// @access  Public
// EXPECTATIONS: "treaty": {<Treaty Object>}, "ratifier": "<ID>"
// I am assuming that the person ratifying this treaty has access to it through witnessing, and am not handling any logic whether they
// are allowed to sign treaty (through the 'excluded' array property of the Treaty Obj)
router.put('/treaties/ratify', async function (req, res) {
	try {
		let { treaty, ratifier } = req.body;
		treaty = await Treaty.findById({ _id: treaty._id });// populate treaty
		treaty.signatories.push(ratifier);
		ratifier = await Team.findById({ _id: ratifier });
		ratifier.treaties.push(treaty._id);
		ratifier = await ratifier.save();

		treaty = await treaty.saveActivity(treaty, `Treaty Ratified By ${ratifier.name}`);
		res.status(200).send(`Treaty Ratified By ${ratifier.name}!`);
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(500).send(`Error ratifying treaty: ${err}`);
	}// catch
});

// @route   POST game/treaties/status
// @Desc    changes a status of a treaty to wither draft or proposal.... no idea if this is needed anymore?
// @access  Public
// EXPECTATIONS: "treaty": {<Treaty Object>}, "modifier": "<ID>", "status"
router.put('/treaties/status', async function (req, res) {
	let { treaty } = req.body;
	const { modifier, status } = req.body;
	try{
		treaty = await Treaty.findById({ _id: treaty._id });// populate treaty
		if(modifier != treaty.creator) {
			res.status(400).send('Cannot modify treaty status if you are not it\'s creator');
		}
		treaty.status.draft = false;
		treaty.status.proposal = false;
		treaty.status.deleted = false;

		switch(status) {
		case 'draft':
			treaty.status.draft = true;
			break;
		case 'proposal':
			treaty.status.proposal = true;
			break;
		}// switch(status)
		treaty = await treaty.saveActivity(treaty, `Treaty Status Changed ${modifier.name}`);
		res.status(200).send(`Treaty Status Changed ${modifier.name}!`);
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});
		res.status(400).send(`Error changing treaty status: ${err}`);
	}// catch
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~UPGRADES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// @route   GET game/upgrade/stat
// @Desc    get the total stat contribution of a specific stat from an upgrade array
// @access  Public
router.get('/upgrades/stat', async function (req, res) {
	const z = await upgradeValue(req.body.upgrades, req.body.desiredStat);
	res.status(200).send(`The result is: ${z}`);
});


router.put('/upgrade/add', async function (req, res) {
	let { upgrade, unit } = req.body;
	upgrade = await Upgrade.findById(upgrade);
	unit = await Military.findById(unit);
	await addUpgrade(upgrade, unit);
	res.status(200).send(`Added "${upgrade.name}" to unit "${unit.name}"`);
});

// @route   POST game/upgrade/stat
// @Desc    remove an upgrade from a unit
// @access  Public
router.put('/upgrade/remove', async function (req, res) {
	const response = await removeUpgrade(req.body.upgrade, req.body.unit);
	res.status(200).send(response);
});

router.post('/upgrade/build', async function (req, res) {
	const { code, team, facility } = req.body; // please give me these things

	try {
		let upgrade = await newUpgrade(code, team, facility); // just the facility ID
		upgrade = await upgrade.save();

		res.status(200).json(upgrade);
	}
	catch (err) {
		res.status(404).send(err); // This returns a really weird json... watch out for that
	}
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ZONES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~The Rest~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// @route   PUT game/military/deploy
// @Desc    Deploy a group of units for a country
// @access  Public
router.put('/military/deploy', async function (req, res) {
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

// @route   PUT game/repairAircraft
// @desc    Update aircraft to max health
// @access  Public
router.put('/repairAircraft', async function (req, res) {
	const aircraft = await Aircraft.findById(req.body._id);
	console.log(req.body);
	console.log(aircraft);
	let account = await Account.findOne({
		name: 'Operations',
		team: aircraft.team
	});
	if (account.balance < 2) {
		routeDebugger('Not enough funding...');
		res
			.status(402)
			.send(
				`No Funding! Assign more money to your operations account to repair ${aircraft.name}.`
			);
	}
	else {
		account = await banking.withdrawal(
			account,
			2,
			`Repairs for ${aircraft.name}`
		);
		await account.save();
		routeDebugger(account);

		aircraft.status.repair = true;
		aircraft.status.ready = false;
		await aircraft.save();

		routeDebugger(`${aircraft.name} put in for repairs...`);

		res.status(200).send(`${aircraft.name} put in for repairs...`);
		nexusEvent.emit('updateAircrafts');
	}
});

// @route   PUT game/research
// @Desc    Assign a research to a lab
// @access  Public
router.put('/research', async function (req, res) {
	routeDebugger('Updating facility...');
	const update = req.body;
	console.log(update);
	try {
		let facility = await Facility.findById(update._id);

		if (!facility) {
			res
				.status(404)
				.send(`The facility with the ID ${update._id} was not found!`);
		}
		else {
			if (facility.capability.research.active) {
				routeDebugger(
					`${facility.name} lab 0${update.index + 1} is being updated...`
				);
				facility.capability.research.funding.set(
					update.index,
					parseInt(update.funding)
				);
				facility.capability.research.projects.set(
					update.index,
					update.research
				);
				facility.capability.research.status.pending.set(update.index, true);
			}

			facility = await facility.save();
			console.log(facility);
			res
				.status(200)
				.send(
					`Research goals for ${facility.name} lab 0${update.index} have been updated!`
				);
			nexusEvent.emit('updateFacilities');
		}
	}
	catch (err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

// EXPECTATION:
router.put('/rename', async function (req, res) {
	let target;
	let originalName;
	switch (req.body.model) {
	case 'Facility':
		target = await Facility.findById(req.body._id);
		originalName = target.name;
		target.name = req.body.name;
		target = await target.save();
		break;
	case 'Aircraft':
		target = await Aircraft.findById(req.body._id);
		originalName = target.name;
		target.name = req.body.name;
		target = await target.save();
		break;
	case 'Squad':
		// this is untested
		target = await Squad.findById(req.body._id);
		originalName = target.name;
		target.name = req.body.name;
		target = await target.save();
		break;
	case 'Upgrade':
		// return once upgrades are finished
		break;
	default:
		res
			.status(200)
			.send('Unable to determine the type of Object you want to rename');
	}
	res.status(200).send(`Renamed '${originalName}' to '${target.name}'`);
});

module.exports = router;
