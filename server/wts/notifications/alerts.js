const EventEmitter = require('events');

class Event extends EventEmitter {}

const alertEvent = new Event();

let usaAlerts = [];
let count = 0;

// TODO: Evaluate if this socket route should be removed

function alerts (io) {
	io.of('/alert').on('connection', (USA) => {
		console.log(`United States ready to recieve alerts at ${USA.id}`);

		alertEvent.on('alert', () => {
			for (const msg of usaAlerts) {
				USA.emit('alert', msg);
			}
			usaAlerts = [];
		});

		USA.on('disconnect', () => console.log(`USA disconnected ${USA.id}`));
	});
}

async function setAlert ({ team_id, title, body }) {
	const { Team } = require ('../../models/team');

	const team = await Team.findOne({ _id: team_id });
	const { getTimeRemaining } = require('../gameClock/gameClock');
	const time = getTimeRemaining();
	console.log(`Setting ${title} alert for ${team.code}`);
	count++;
	const newAlert = { id: count, title, body, time: `${time.turn}`, team };

	if (team.code === 'USA') {
		usaAlerts.push(newAlert);
	}
	alertEvent.emit('alert');
}

module.exports = { alerts, setAlert };