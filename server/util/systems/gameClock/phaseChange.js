const { updatePR } = require('../banking/pr');
const phaseChangeDebugging = require('debug')('app:phaseChange');
const intercept = require('../intercept/intercept');

/* Things that happen on Phase Changes Change
    - Research Progresses [SCIENCE SYSTEM - v0.1.3]
    - Military Maintenence [GLOBAL CONFLICT SYSTEM - vUNKNOWN]
    - Upgrades Progress (Interceptors/Units) - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Repair Units - [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Building Progress (Interceptors/Bases) [GOVERNANCE BUILDING SYSTEM - vUNKNOWN]
    - Generation of the Gray market [SCIENCE SYSTEM v0.1.3]
*/

function teamPhase(turn) {
    phaseChangeDebugging(`Now changing to the team phase for ${turn}...`)
    updatePR(); // PR is rolled (Finances) [Coded] | Income is given (Treasury, based on PR) [coded]
    intercept.resolveInterceptions(); // Resolve Interceptions that have been sent [coded]
    phaseChangeDebugging(`Done with team phase change for ${turn}!`)
    return 0;
};

function actionPhase(turn) {
    phaseChangeDebugging(`Now changing to the action phase for ${turn}...`)
    phaseChangeDebugging(`Done with action phase change for ${turn}!`)
};

function freePhase(turn) {
    phaseChangeDebugging(`Now changing to the FREE phase ${turn}...`)
    phaseChangeDebugging(`Done with FREE phase change for ${turn}!`)
    return 0;
};

module.exports = { teamPhase, actionPhase, freePhase };