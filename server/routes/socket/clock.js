const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const masterClock = require('../../wts/gameClock/gameClock');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		let message;
		switch(req.action) {
		case('getState'):
			nexusEvent.emit('request', 'clock', [ masterClock.getClockState() ]);
			break;
		case('play'):
			masterClock.unpause();
			nexusEvent.emit('request', 'clock', [ masterClock.getClockState() ]);
			break;
		case('pause'):
			masterClock.pause();
			nexusEvent.emit('request', 'clock', [ masterClock.getClockState() ]);
			break;
		case('skip'):
			masterClock.turnNum < 0 ? masterClock.startGame() : masterClock.nextPhase();
			nexusEvent.emit('request', 'clock', [ masterClock.getClockState() ]);
			break;
		case('revert'):
			masterClock.revertPhase();
			nexusEvent.emit('request', 'clock', [ masterClock.getClockState() ]);
			break;
		case('reset'):
			masterClock.reset();
			nexusEvent.emit('request', 'clock', [ masterClock.getClockState() ]);
			break;
		default:
			message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
	}
	catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		console.log(error);
	}
};