const phaseChangeDebugging = require('debug')('app:phaseChange');

const { resolveMissions } = require('../intercept/missions'); // IMPORT - Intercept system
const { runMilitary } = require('../military/military');
// const { startResearch, assignKnowledgeCredit } = require('../research/research');
// const { techCheck } = require('../../wts/research/technology');
const clock = require('./gameClock');

const { logger } = require('../../middleware/log/winston'); // IMPORT - Winston error logging
const nexusEvent = require('../../middleware/events/events');
const { Team } = require('../../models/team');
const { Report } = require('../../models/report');

/* This file handles all the events triggered on phase change.
    Each phase has a function that handles that phase. */


// FUNCTION - teamPhase
// ARGS - Void | RETURN 0
// DESC - Does initial calculations at the start of the phase, then reports them to players
async function teamPhase(lastPhase) {
	phaseChangeDebugging(`Now changing to the team phase for ${clock.currentTurn}...`);
	// PR is rolled (Finances) [Coded] | Income is given (Treasury, based on PR) [Implemented]
	setTimeout(async () => {
		for await (const team of Team.find()) {
			if (team.type === 'National') await team.endTurn();
		}
	}, 2000);
	// Iterate through set-automatic transfers [Implemented]
	// setTimeout(async () => { await banking.automaticTransfer(); }, 4000);
	phaseChangeDebugging(`Done with team phase change for ${clock.currentTurn}!`);
	logger.info(`Turn ${clock.currentTurn} team phase has begun...`);
	return 0;
}

async function actionPhase(lastPhase) {
	phaseChangeDebugging(`Now changing to the action phase for ${clock.currentTurn}...`);
	await resolveMissions(); // Resolve Interceptions that have been sent [coded]
	// nexusEvent.emit('updateAircrafts'); // TODO re-add update broadcasts
	// nexusEvent.emit('updateSites');

	const reports = await Report.find()
		.where('timestamp.turn').equals(lastPhase.turn)
		.where('timestamp.phase').equals(lastPhase.phase);
	const update = [];
	if (reports.length > 0) {
		for (let report of reports) {
			report = await report.populateMe();
			update.push(report);
		}
		nexusEvent.emit('request', 'update', update);
	}
	phaseChangeDebugging(`Done with action phase change for ${clock.currentTurn}!`);
	logger.info(`Turn ${clock.currentTurn} action phase has begun...`);
}

async function freePhase(lastPhase) {
	phaseChangeDebugging(`Now changing to the FREE phase ${clock.currentTurn}...`);
	await runMilitary(); // Resolve all Battles
	// await startResearch(); // Resolve available research...
	// await assignKnowledgeCredit();
	// await techCheck(); // Checks the availibility of new research...
	phaseChangeDebugging(`Done with FREE phase change for ${clock.currentTurn}!`);
	logger.info(`Turn ${clock.currentTurn} free phase has begun...`);
	return 0;
}

nexusEvent.on('phaseChange', (data) => {
	switch(data.phase) {
	case ('Team Phase'):
		teamPhase(data.lastPhase);
		break;
	case ('Action Phase'):
		actionPhase(data.lastPhase);
		break;
	case ('Free Phase'):
		freePhase(data.lastPhase);
		break;
	default:
		throw new Error(`${data.phase} is not a phase...`);
	}
});

/* Things that still need to be coded for phase changes

    - Research Progresses [SCIENCE SYSTEM - v0.1.3]
    - Generation of the Gray market [SCIENCE SYSTEM v0.1.3]

    - Military Maintenence [GLOBAL CONFLICT SYSTEM - vUNKNOWN]

    - Upgrades Progress (Interceptors/Units) - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Repair Units - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Building Progress (Interceptors/Bases) [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
*/

module.exports = { teamPhase, actionPhase, freePhase };