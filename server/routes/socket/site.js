const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { Site } = require('../../models/site');

module.exports = async function (client, req) {
	try {
		let message;
		const target = await Site.findById(req.data._id);
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		switch(req.action) {
		case('space'):
			switch(req.actionType) {
			case('geoPosition'):
				target.geoPosition(req.data.geoPosition);
				client.emit('alert', { type: 'success', message: `${target.name} moved geo-positions to ${target.geoDMS.latDMS} ${target.geoDMS.lngDMS}.` });
				break;
			default:
				message = `No ${req.actionType} action type for the action ${req.action} exists is in the ${req.route} route.`;
				throw new Error(message);
			}
			break;
		default:
			message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
	}
	catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		logger.error(error);
	}
};