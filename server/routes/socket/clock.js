const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling

const masterClock = require('../../wts/gameClock/gameClock');

module.exports = function (client, req) {
	logger.info(`${client.username} has made a ${req.action} request!`);
	let message;
	switch(req.action) {
	case('getState'):
		client.emit('clock', masterClock.getClockState());
		break;
	case('play'):
		masterClock.unpause();
		break;
	default:
		message = `No ${req.action} is in the ${req.route} route.`;
		client.emit('alert', { type: 'error', message });
		throw new Error(message);
	}
};