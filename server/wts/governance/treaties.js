

const nexusEvent = require('../../middleware/events/events');
const { Military } = require('../../models/military');
const { MilitaryMission } = require('../../models/report');
const { Team } = require('../../models/team');



async function treatyCheck(data) {
	let team = await Team.findById(data.approver).populate('trades');
	console.log(data.approved)
	const index = team.agreements.findIndex(el => el.with === data.approved && el.type === data.type)
	console.log(index)
	if (index > -1) {
		console.log(`${team.shortName} removing treaty`);
		team.agreements.splice(index, 1);
	}
	else {
		console.log(`${team.shortName} approving treaty`);
		const agreement = {
			type: data.type,
			with: data.approved
		};
		team.agreements.push(agreement);
	}

	team = await team.save();
	nexusEvent.emit('request', 'update', [ team ]); // Scott Note: Untested might not work

}


module.exports = { treatyCheck };