const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const masterClock = require('../../wts/gameClock/gameClock');

const { Military } = require('../../models/military');
const { Site } = require('../../models/site');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		let message;
		switch(req.action) {
		case('mission'):
			// Deploy action expects UNITS & ASSSIGNMENT
			for (const _id of req.data.units) {
				try {
				let unit = await Military.findById(_id);
					await unit.populateMe();
					unit = await unit.mission(req.data.assignment);

					if (req.data.assignment.type === 'Invade') {
						const site = await Site.findById(req.data.assignment.target);
						await site.warzone();
					}

					client.emit('alert', { type: 'success', message: `${unit.name} participating in ${req.data.assignment.type}.` });
				} catch (error) {
					logger.error(`SOCKET-${req.route} [${req.action}]: ${err.message}`, { meta: err.stack });
					client.emit('alert', { type: 'error', message: error.message ? error.message : error });
				}
			}
			break;
		case('mobilize'):
			// Makes the unit capable of doing MISSIONS by moving its status to MOBILIZED
			for (const _id of req.data.units) {
				try {
				let unit = await Military.findById(_id);
					// TODO - Call mobilize method
					await unit.populateMe();
					unit = await unit.mobilize();
					client.emit('alert', { type: 'success', message: `${unit.name} has been mobilized.` });
				} catch (error) {
					logger.error(`SOCKET-${req.route} [${req.action}]: ${error.message}`, { meta: error.stack });
					client.emit('alert', { type: 'error', message: error.message ? error.message : error });
				}
			}
			break;
		case('deploy'):
			// Deploy action expects UNITS & DESTINATION
			for (const _id of req.data.units) {
				try {
					let unit = await Military.findById(_id);
					await unit.populateMe();
					unit = await unit.deploy(req.data.destination);
					client.emit('alert', { type: 'success', message: `${unit.name} deployed to {unit.site.name once populated}.` });
				} catch (error) {
					logger.error(`SOCKET-${req.route} [${req.action}]: ${error.message}`, { meta: error.stack });
					client.emit('alert', { type: 'error', message: error.message ? error.message : error });
				}
			}
			break;
		default:
			message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
	} catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		logger.error(`SOCKET-${req.route}: ${error.message}`, { meta: error.stack });
	}
};