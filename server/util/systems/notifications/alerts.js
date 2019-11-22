let { Team } = require ('../../../models/team')

let usaAlerts = [];
let count = 0;

function alerts (io) {
    io.of('/alert').on('connection', (USA) => {
        console.log(`United States ready to recieve alerts at ${USA.id}`);

        setInterval(() => {
            for (let msg of usaAlerts) {
                USA.emit('alert', msg)
            }
            usaAlerts = [];
        }, 2000)

        USA.on('disconnect', () => console.log(`USA disconnected ${USA.id}`));
    });
};

async function setAlert({teamID, title, body }) {
    let team = await Team.findOne({ _id: teamID });
    let { getTimeRemaining } = require('../gameClock/gameClock')
    let time = getTimeRemaining();
    console.log(`Setting Alert ${title}`);
    let newAlert = { id: count, title, body, time: `${time.turn}`, team };

    if (team.teamCode === 'USA') {
        usaAlerts.push(newAlert);
    }
    
    count++;
}

module.exports = { alerts, setAlert };