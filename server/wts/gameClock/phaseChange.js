const phaseChangeDebugging = require('debug')('app:phaseChange');

const { resolveMissions } = require('../intercept/missions'); // IMPORT - Intercept system
const { runMilitary } = require('../military/military');
// const { startResearch, assignKnowledgeCredit } = require('../research/research');
// const { techCheck } = require('../../wts/research/technology');
const repairSequence = require('../construction/repair');
const clock = require('./gameClock');

const { logger } = require('../../middleware/log/winston'); // IMPORT - Winston error logging
const nexusEvent = require('../../middleware/events/events');
const { Team } = require('../../models/team');

/* This file handles all the events triggered on phase change.
    Each phase has a function that handles that phase. */

async function teamPhase() {
	phaseChangeDebugging(`Now changing to the team phase for ${clock.currentTurn}...`);
	// setTimeout(async () => { Scott disabled this cause it is broken
	// 	for await (const team of Team.find()) {
	// 		if (team.type === 'National') await team.endTurn();
	// 	}
	// }, 2000); // PR is rolled (Finances) [Coded] | Income is given (Treasury, based on PR) [Implemented]
	// setTimeout(async () => { await banking.automaticTransfer(); }, 4000); // Iterate through set-automatic transfers [Implemented]
	phaseChangeDebugging(`Done with team phase change for ${clock.currentTurn}!`);
	logger.info(`Turn ${clock.currentTurn} team phase has begun...`);
	return 0;
}

async function actionPhase() {
	phaseChangeDebugging(`Now changing to the action phase for ${clock.currentTurn}...`);
	await resolveMissions(); // Resolve Interceptions that have been sent [coded]
	await runMilitary(); // Resolve all Battles
	setTimeout(async () => { await repairSequence(); }, 14000);
	// nexusEvent.emit('updateAircrafts'); // TODO re-add update broadcasts
	// nexusEvent.emit('updateSites');
	// nexusEvent.emit('updateReports');
	phaseChangeDebugging(`Done with action phase change for ${clock.currentTurn}!`);
	logger.info(`Turn ${clock.currentTurn} action phase has begun...`);
}

async function freePhase() {
	phaseChangeDebugging(`Now changing to the FREE phase ${clock.currentTurn}...`);
	// await startResearch(); // Resolve available research...
	// await assignKnowledgeCredit();
	// await techCheck(); // Checks the availibility of new research...
	phaseChangeDebugging(`Done with FREE phase change for ${clock.currentTurn}!`);
	logger.info(`Turn ${clock.currentTurn} free phase has begun...`);
	return 0;
}

nexusEvent.on('phaseChange', (phase) => {
	switch(phase) {
	case ('Team Phase'):
		teamPhase();
		break;
	case ('Action Phase'):
		actionPhase();
		break;
	case ('Free Phase'):
		freePhase();
		break;
	default:
		throw new Error(`${phase} is not a phase...`);
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