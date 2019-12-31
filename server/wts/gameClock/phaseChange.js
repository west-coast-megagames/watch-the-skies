const phaseChangeDebugging = require('debug')('app:phaseChange');
const { updatePR } = require('../pr/pr'); // IMPORT - updatePR function from the PR system
const intercept = require('../intercept/intercept'); // IMPORT - Intercept system
const banking = require('../banking/banking'); // IMPORT - Banking System

const { logger } = require('../../middleware/winston'); // IMPORT - Winston error logging

/* This file handles all the events triggered on phase change.
    Each phase has a function that handles that phase. */

async function teamPhase(turn) {
    phaseChangeDebugging(`Now changing to the team phase for ${turn}...`);
    await updatePR(); // PR is rolled (Finances) [Coded] | Income is given (Treasury, based on PR) [Implemented]
    await banking.automaticTransfer(); // Iterate through set-automatic transfers [Implemented]
    phaseChangeDebugging(`Done with team phase change for ${turn}!`);
    logger.info(`Turn ${turn} team phase has begun...`);
    return 0;
};

function actionPhase(turn) {
    phaseChangeDebugging(`Now changing to the action phase for ${turn}...`)
    intercept.resolveInterceptions(); // Resolve Interceptions that have been sent [coded]
    phaseChangeDebugging(`Done with action phase change for ${turn}!`)
    logger.info(`Turn ${turn} action phase has begun...`);
};

function freePhase(turn) {
    phaseChangeDebugging(`Now changing to the FREE phase ${turn}...`)
    phaseChangeDebugging(`Done with FREE phase change for ${turn}!`)
    logger.info(`Turn ${turn} free phase has begun...`);
    return 0;
};

/* Things that still need to be coded for phase changes

    - Research Progresses [SCIENCE SYSTEM - v0.1.3]
    - Generation of the Gray market [SCIENCE SYSTEM v0.1.3]

    - Military Maintenence [GLOBAL CONFLICT SYSTEM - vUNKNOWN]
    
    - Upgrades Progress (Interceptors/Units) - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Repair Units - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Building Progress (Interceptors/Bases) [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
*/

module.exports = { teamPhase, actionPhase, freePhase };