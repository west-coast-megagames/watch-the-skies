const Team = require('../../../models/team');
const { Finances, createFinance } = require('../../../models/gov/finance');
const rollPR = require('../../systems/finance/pr');

/* Things that happen on Turn Change
    - PR is rolled (Finances)
    - Income is given (Treasury, based on PR)
    - Research Progresses
    - Military Maintenence
    - Upgrades Progress (Interceptors/Units)
    - Repair Units
    - Building Progress (Interceptors/Bases)
    - Generation of the Gray market
*/

function turnChange(turn) {
    console.log(`Now changing turn to ${turn}!`)
    updatePR();
    return 0;
}

async function updatePR() {
    const gameClock = require('../gameClock/gameClock');
    let { turnNum } = gameClock();
    
    console.log(`Assingning turn ${turnNum} income!`);
    try {
        for await (const team of Team.find().select('_id prTrack')) {   
            let { _id, prTrack } = team;
            let lastTurn = turnNum - 1;
            let finances = await Finances.findOne({ teamID: `${_id}`, 'timestamp.turnNum': `${lastTurn}`  });

            console.log(finances);

            let prChange = rollPR(finances.prScore, prTrack, 0);

            finances = createFinance(finances, prChange, _id);
        }
        return 0;
    } catch (err) {
        console.log('Error:', err.message);
    };
}

module.exports = turnChange;