const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server
const routeDebugger = require('debug')('app:routes');

// Squad Model - Using Mongoose Model
const { Squad } = require('../../models/squad'); // Squad Model
const { Account } = require('../../models/account');
const { Team } = require('../../models/team');

// Game Systems - Used to run Game functions
// const nexusEvent = require('../../middleware/events/events');
const banking = require('../../wts/banking/banking');
const { runSquadActions } = require('../../wts/squads/squads');

// @route   PUT game/squads/deploy
// @Desc    Deploy an squad to a mission
// @access  Public
router.put('/deploy', async function (req, res) {
	const { destination, missionType, priority1, priority2, priority3 } = req.body;
	let { squad } = req.body;
	squad = await Squad.findById(squad);
	// console.log(req.body);
	const teamObj = await Team.findById(squad.team);
	let account = await Account.findOne({
		name: 'Operations',
		team: teamObj._id
	});
	routeDebugger(`${teamObj.name} is attempting to deploy.`);
	routeDebugger(
		`Deployment cost: $M$1 | Account Balance: $M${account.balance}`
	);

	if (account.balance < 1) {
		routeDebugger('Not enough funding to deploy squad...');
		res
			.status(402)
			.send(
				'Not enough funding! Assign 1 more megabuck to deploy squad.'
			);
	}
	else {
		squad.missionType = missionType;
		squad.status.deployed = true;
		squad.status.ready = false;
		squad.site = destination;
		squad.mission.priorities = [priority1, priority2, priority3];

		console.log(squad);
		account = await banking.withdrawal(
			account,
			1,
			`Sending ${squad.name} on a ${squad.missionType} mission...`
		);
		await account.save();
		await squad.save();
		res.status(200).send(`${squad.name} successfuly sent on a ${squad.missionType} mission`);
	}
}); // deploy

router.patch('/runSquads', async function (req, res) {
	await runSquadActions();
	res.status(200).send('Squad Actions Resolved');
});

router.patch('/resetSquads', async function (req, res) {
	for await (const unit of Squad.find()) {
		unit.status.destroyed = false;
		unit.status.deployed = false;
		unit.status.captured = false;
		unit.status.ready = true;
		console.log(`${unit.name} has been healed`);
		await unit.save();
	}
	res.send('Squads succesfully reset!');
	// nexusEvent.emit('updateMilitary');
});

module.exports = router;