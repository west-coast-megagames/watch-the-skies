const { Team } = require ('../../../models/team')
const EventEmitter = require('events');

class Event extends EventEmitter {}

const alertEvent = new Event();

let usaAlerts = [];
let count = 0;

function alerts (io) {
    io.of('/alert').on('connection', (USA) => {
        console.log(`United States ready to recieve alerts at ${USA.id}`);

        alertEvent.on('alert', () => {
            for (let msg of usaAlerts) {
                USA.emit('alert', msg)
            }
            usaAlerts = [];
          });

        USA.on('disconnect', () => console.log(`USA disconnected ${USA.id}`));
    });
};

async function setAlert({ teamID, title, body }) {

    let team = await Team.findOne({ _id: teamID });
    let { getTimeRemaining } = require('../gameClock/gameClock')
    let time = getTimeRemaining();
    console.log(`Setting ${title} alert for ${team.teamCode}`);
    count++;
    let newAlert = { id: count, title, body, time: `${time.turn}`, team };

    if (team.teamCode === 'USA') {
        usaAlerts.push(newAlert);
    }
    alertEvent.emit('alert');
}

module.exports = { alerts, setAlert };