const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const masterClock = require('../../wts/gameClock/gameClock');

const { Military } = require('../../models/military');

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
					client.emit('alert', { type: 'success', message: `${unit.name} participating in ${assignment.type}.` });
				} catch (error) {
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
		console.log(error);
	}
};