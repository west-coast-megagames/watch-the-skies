const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { Aircraft } = require('../../models/aircraft');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		switch(req.action) {
		case('transfer'):
		// Deploy action expects UNITS & DESTINATION
			for (const _id of req.data.units) {
				try {
					const unit = await Aircraft.findById(_id);
					await unit.populateMe();
					const message = await unit.transfer(req.data.destination);
					client.emit('alert', { type: 'success', message });
				}
				catch (error) {
					logger.error(`SOCKET-${req.route} [${req.action}]: ${error.message}`, { meta: error.stack });
					client.emit('alert', { type: 'error', message: error.message ? error.message : error });
				}
			}
			break;
		default: {
			const message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
		}
	}
	catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		logger.error(error);
	}
};