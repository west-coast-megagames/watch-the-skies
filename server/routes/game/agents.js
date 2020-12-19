const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server
const routeDebugger = require('debug')('app:routes');

// Agent Model - Using Mongoose Model
const { Agent } = require('../../models/agent'); // Agent Model
const { Account } = require('../../models/account');
const { Team } = require('../../models/team');

// Game Systems - Used to run Game functions
// const nexusEvent = require('../../middleware/events/events');
const banking = require('../../wts/banking/banking');
const { runAgentActions } = require('../../wts/agents/agents');

// @route   PUT game/agents/deploy
// @Desc    Deploy an agent to a mission
// @access  Public
router.put('/deploy', async function (req, res) {
	const { destination, missionType, priority1, priority2, priority3 } = req.body;
	let { agent } = req.body;
	agent = await Agent.findById(agent);
	// console.log(req.body);
	const teamObj = await Team.findById(agent.team);
	let account = await Account.findOne({
		name: 'Operations',
		team: teamObj._id
	});
	routeDebugger(`${teamObj.name} is attempting to deploy.`);
	routeDebugger(
		`Deployment cost: $M$1 | Account Balance: $M${account.balance}`
	);

	if (account.balance < 1) {
		routeDebugger('Not enough funding to deploy agent...');
		res
			.status(402)
			.send(
				'Not enough funding! Assign 1 more megabuck to deploy agent.'
			);
	}
	else {
		agent.missionType = missionType;
		agent.status.deployed = true;
		agent.status.ready = false;
		agent.site = destination;
		agent.mission.priorities = [priority1, priority2, priority3];

		console.log(agent);
		account = await banking.withdrawal(
			account,
			1,
			`Sending ${agent.name} on a ${agent.missionType} mission...`
		);
		await account.save();
		await agent.save();
		res.status(200).send(`${agent.name} successfuly sent on a ${agent.missionType} mission`);
	}
}); // deploy

router.patch('/runAgents', async function (req, res) {
	await runAgentActions();
	res.status(200).send('Agent Actions Resolved');
});

router.patch('/resetAgents', async function (req, res) {
	for await (const unit of Agent.find()) {
		unit.status.destroyed = false;
		unit.status.deployed = false;
		unit.status.captured = false;
		unit.status.ready = true;
		console.log(`${unit.name} has been healed`);
		await unit.save();
	}
	res.send('Agents succesfully reset!');
	// nexusEvent.emit('updateMilitary');
});

module.exports = router;