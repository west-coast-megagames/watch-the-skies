const phaseChangeDebugging = require('debug')('app:phaseChange');

const { updatePR } = require('../pr/pr'); // IMPORT - updatePR function from the PR system
const { resolveMissions } = require('../intercept/missions'); // IMPORT - Intercept system
const banking = require('../banking/banking'); // IMPORT - Banking System
const { startResearch, assignKnowledgeCredit } = require('../research/research');
const { techCheck } = require('../../wts/research/technology');
const repairSequence = require('../construction/repair');

const { logger } = require('../../middleware/log/winston'); // IMPORT - Winston error logging

/* This file handles all the events triggered on phase change.
    Each phase has a function that handles that phase. */

async function teamPhase (turn) {
	phaseChangeDebugging(`Now changing to the team phase for ${turn}...`);
	setTimeout(async () => { await updatePR(); }, 2000); // PR is rolled (Finances) [Coded] | Income is given (Treasury, based on PR) [Implemented]
	setTimeout(async () => { await banking.automaticTransfer(); }, 4000); // Iterate through set-automatic transfers [Implemented]
	phaseChangeDebugging(`Done with team phase change for ${turn}!`);
	logger.info(`Turn ${turn} team phase has begun...`);
	return 0;
}

async function actionPhase (turn) {
	phaseChangeDebugging(`Now changing to the action phase for ${turn}...`);
	await resolveMissions(); // Resolve Interceptions that have been sent [coded]
	setTimeout(async () => { await repairSequence(); }, 14000);
	phaseChangeDebugging(`Done with action phase change for ${turn}!`);
	logger.info(`Turn ${turn} action phase has begun...`);
}

async function freePhase (turn) {
	phaseChangeDebugging(`Now changing to the FREE phase ${turn}...`);
	/*
	await startResearch(); // Resolve available research...
	await assignKnowledgeCredit();
	await techCheck(); // Checks the availibility of new research...
	*/
	phaseChangeDebugging(`Done with FREE phase change for ${turn}!`);
	logger.info(`Turn ${turn} free phase has begun...`);
	return 0;
}

/* Things that still need to be coded for phase changes

    - Research Progresses [SCIENCE SYSTEM - v0.1.3]
    - Generation of the Gray market [SCIENCE SYSTEM v0.1.3]

    - Military Maintenence [GLOBAL CONFLICT SYSTEM - vUNKNOWN]

    - Upgrades Progress (Interceptors/Units) - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Repair Units - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Building Progress (Interceptors/Bases) [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
*/

module.exports = { teamPhase, actionPhase, freePhase };