const { d8 } = require('../../util/systems/dice');
const prDebugging = require('debug')('app:prSystem');
const nexusEvent = require('../../middleware/events/events');
const { deposit } = require('../banking/banking');

async function updatePR () {
	const gameClock = require('../gameClock/gameClock');
	const { Team } = require('../../models/team');
	const { Account } = require('../../models/account');
	let { turnNum } = gameClock.getTimeRemaining();

	prDebugging(`Assingning turn ${turnNum} income!`);
	try {
		for await (let team of Team.find()) {   
			if (team.type === 'N') {
				let { _id, prTrack, prLevel } = team;
				prDebugging(`${team.name.toUpperCase()}`)
				// prDebugging(team)
				prDebugging(`Assigning income for ${team.shortName}...`);
				let account = await Account.findOne({ name: 'Treasury', 'team': _id });

				let prChange = rollPR(prLevel, prTrack, 0);
				account = await deposit(account, prChange.income, `Turn ${turnNum} income.`);
				team.prLevel = prChange.prLevel;
				account = await account.save();
				team = await team.save();
				prDebugging(`${team.shortName} has PR Level of ${team.prLevel}`);
				// prDebugging(account);
			}
		};
		nexusEvent.emit('updateAccounts');
		nexusEvent.emit('updateLogs');
	} catch (err) {
		prDebugging('Error:', err.message);
	};
}

function rollPR (currentPR, prTrack, prModifier) {
	const gameClock = require('../gameClock/gameClock');
	let { turnNum } = gameClock.getTimeRemaining();
	let prRoll = d8();
	let prLevel = currentPR;

	prDebugging(`Current PR: ${currentPR}`);
	prDebugging(`PR Roll: ${prRoll}`);


	if (turnNum > 1) {
		if (prRoll < currentPR) {
			prLevel = currentPR + prModifier - Math.floor(((currentPR - prRoll) / 1.5));
		} else if (prRoll > currentPR) {
			prLevel = currentPR + prModifier + 1;
		} else {
			prLevel = currentPR + prModifier;
		}

		prLevel = prLevel > 8 ? 8 : prLevel;
		prLevel = prLevel < 1 ? 1 : prLevel;
	}


	let income = prTrack[prLevel];

	prDebugging(`PR Level: ${prLevel}`);
	prDebugging(`Income: ${income}`);

	return { prLevel, income };
}

module.exports = { rollPR, updatePR };