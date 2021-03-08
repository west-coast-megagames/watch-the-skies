// const { Site } = require('../../models/site');
// const { Team } = require('../../models/team');
const { d6 } = require('../../util/systems/dice');
const nexusEvent = require('../../middleware/events/events');
// const { Upgrade } = require('../../models/upgrade');
const { Squad } = require('../../models/squad');
const { SquadAction } = require('../../models/report');

async function runSquadActions () {

	for (const squad of await Squad.find({ 'status.deployed': true })) { // find all the sites that are a warzone
		let cland = false;	// boolean for mission secrecy
		let surv = false;		// boolean for squad survival
		let succ = false;		// boolean for mission success
		let numRes = 0;			// number for iterating over array later

		const { site } = squad;
		const squads = await Squad.find({ site, missionType: 'Counter-Espionage' }).lean();
		// 1 Roll 2d6
		const result = d6() + d6() - squads.length;
		console.log(`The Result was ${result}`);
		if (result < 6) {
			numRes = 1;
		}
		else if (result > 5 && result < 9) {
			numRes = 2;
		}
		else if (result > 8) {
			numRes = 3;
		}

		for (let i = 0; i < numRes; i++) {
			switch (squad.mission.priorities[i]) {
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

		if (!cland) { // if the squad was detected, make a report for the target team
			console.log(`${squad.name} was detected`);
		}
		if (!surv) { // if the squad was killed or captured
			console.log(`${squad.name} was killed`);
		}
		if (succ) { // if the mission was succsessful
			// 3 resolve the mission based on the type
			console.log(`${squad.name} was successful in their mission`);
		}

		let squadReport = new SquadAction({
			team: squad.team,
			site: squad.site,
			missionType: squad.missionType,
			priorities: squad.mission.priorities,
			result: numRes
		}); // the report for the squad's team
		squadReport = squadReport.createTimestamp(squadReport);
		squadReport = await squadReport.save();

	}
	// nexusEvent.emit('updateMilitary');
	//	nexusEvent.emit('updateLogs');
}

module.exports = { runSquadActions };