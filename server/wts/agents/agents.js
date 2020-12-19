// const { Site } = require('../../models/site');
// const { Team } = require('../../models/team');
const { d6 } = require('../../util/systems/dice');
const nexusEvent = require('../../middleware/events/events');
// const { Upgrade } = require('../../models/upgrade');
const { Agent } = require('../../models/agent');
const { AgentAction } = require('../../models/report');

async function runAgentActions () {

	for (const agent of await Agent.find({ 'status.deployed': true })) { // find all the sites that are a warzone
		let cland = false;	// boolean for mission secrecy
		let surv = false;		// boolean for agent survival
		let succ = false;		// boolean for mission success
		let numRes = 0;			// number for iterating over array later

		const { site } = agent;
		const agents = await Agent.find({ site, missionType: 'Counter-Espionage' }).lean();
		// 1 Roll 2d6
		const result = d6() + d6() - agents.length;
		console.log(`The Result was ${result}`);
		if (result > 2 && result < 6) {
			numRes = 1;
		}
		else if (result > 5 && result < 9) {
			numRes = 2;
		}
		else if (result > 8) {
			numRes = 3;
		}

		for (let i = 0; i < numRes; i++) {
			switch (agent.mission.priorities[i]) {
			case 'clandestine':
				cland = true;
				break;
			case 'effectiveness':
				succ = true;
				break;
			case 'survivability':
				surv = true;
				break;
			}
		}

		if (!cland) { // if the agent was detected, make a report for the target team
			console.log(`${agent.name} was detected`);
		}
		if (!surv) { // if the agent was killed or captured
			console.log(`${agent.name} was killed`);
		}
		if (succ) { // if the mission was succsessful
			// 3 resolve the mission based on the type
			console.log(`${agent.name} was successful in their mission`);
		}

		let agentReport = new AgentAction({
			team: agent.team,
			site: agent.site,
			missionType: agent.missionType,
			priorities: agent.mission.priorities,
			result: numRes
		}); // the report for the agent's team
		agentReport = agentReport.createTimestamp(agentReport);
		agentReport = await agentReport.save();

	}
	// nexusEvent.emit('updateMilitary');
	//	nexusEvent.emit('updateLogs');
}

module.exports = { runAgentActions };