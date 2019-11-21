const { d8 } = require('../intercept/dice');
const prDebugging = require('debug')('app:prSystem');
const { deposit } = require('../banking/banking')

const { Team } = require('../../../models/team');

async function updatePR() {
    const gameClock = require('../gameClock/gameClock');
    let { turnNum } = gameClock.getTimeRemaining();
    
    prDebugging(`Assingning turn ${turnNum} income!`);
    try {
        for await (let team of Team.find()) {   
            let { _id, name, prTrack, prLevel, accounts } = team;
            prDebugging(`Assigning income for ${name}...`);

            let prChange = rollPR(prLevel, prTrack, 0);
            accounts = deposit(accounts, 'Treasury', prChange.income, `Turn ${turnNum} income.`)
            team.prLevel = prChange.prLevel;
            team.accounts = accounts;
            
            team = await team.save()
        };
    } catch (err) {
        prDebugging('Error:', err.message);
    };
}

function rollPR(currentPR, prTrack, prModifier) {
    let prRoll = d8();
    let prLevel = 0

    prDebugging(`Current PR: ${currentPR}`)
    prDebugging(`PR Roll: ${prRoll}`);

    if (prRoll < currentPR) {
        prLevel = currentPR + prModifier - Math.floor(((currentPR - prRoll) / 1.5));
    } else if (prRoll > currentPR) {
        prLevel = currentPR + prModifier + 1;
    } else {
        prLevel = currentPR + prModifier
    }

    prLevel = prLevel > 8 ? 8 : prLevel;
    prLevel = prLevel < 1 ? 1 : prLevel;

    let income = prTrack[prLevel - 1];

    prDebugging(`PR Level: ${prLevel}`);
    prDebugging(`Income: ${income}`)

    return { prLevel, income }
}

module.exports = { rollPR, updatePR };