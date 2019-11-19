const rollPR = require('../banking/pr');
const turnChangeDebugging = require('debug')('app:turnChange');
const intercept = require('../intercept/intercept');
const { transfer, deposit, withdrawl } = require('../banking/banking');

// Mongoose Object Models
const { Team } = require('../../../models/team');

/* Things that happen on Turn Change
    - PR is rolled (Finances) [Coded]
    - Income is given (Treasury, based on PR) [coded]
    - Research Progresses
    - Military Maintenence
    - Upgrades Progress (Interceptors/Units)
    - Repair Units
    - Building Progress (Interceptors/Bases)
    - Generation of the Gray market
*/

function turnChange(turn) {
    turnChangeDebugging(`Now changing turn to ${turn}!`)
    updatePR();
    intercept.resolveInterceptions();
    return 0;
}

async function updatePR() {
    const gameClock = require('../gameClock/gameClock');
    let { turnNum } = gameClock.getTimeRemaining();
    
    turnChangeDebugging(`Assingning turn ${turnNum} income!`);
    try {
        for await (let team of Team.find()) {   
            let { _id, name, prTrack, prLevel, accounts } = team;
            turnChangeDebugging(`Assigning income for ${name}...`);

            let prChange = rollPR(prLevel, prTrack, 0);
            accounts = deposit(accounts, 'Treasury', prChange.income, `Turn ${turnNum} income.`)
            team.prLevel = prChange.prLevel;
            team.accounts = accounts;
1
            team = await team.save()
        return 0;
        };
    } catch (err) {
        turnChangeDebugging('Error:', err.message);
    };
}

module.exports = turnChange;