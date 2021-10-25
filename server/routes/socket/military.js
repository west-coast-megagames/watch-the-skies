// const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
// const masterClock = require('../../wts/gameClock/gameClock');

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


					// 	socket.emit('request', { route: 'military', action: 'mission', data: { assignment: { target: props.target._id, type: 'Invade'}, units: units, }});
					if (req.data.assignment.type === 'Invade') {
						console.log('Invade Time!');
						const target = await Site.findById(req.data.assignment.target).populate('country').populate('zone'); // Finds deployment target in the DB
						target.status.push('warzone');
						await target.save();
					}

					client.emit('alert', { type: 'success', message: `${unit.name} participating in ${req.data.assignment.type}.` });
				}
				catch (error) {
					logger.error(`SOCKET-${req.route} [${req.action}]: ${error.message}`, { meta: error.stack });
					client.emit('alert', { type: 'error', message: error.message ? error.message : error });
				}
			}
			break;
		case('action'):
			for (const _id of req.data.units) {
				let unit = await Military.findById(_id);
				switch (req.data.type) {
				case('mobilize'):
					// Makes the unit capable of doing MISSIONS by moving its status to MOBILIZED
					// TODO - Call mobilize method
					await unit.populateMe();
					unit = await unit.mobilize();
					client.emit('alert', { type: 'success', message: `${unit.name} has been mobilized.` });
					break;
				case('transfer'):
					await unit.populateMe();
					unit = await unit.transfer(req.data.destination);
					client.emit('alert', { type: 'success', message: `${unit.name} transferred to ${unit.site.name}.` });
					break;
				case('deploy'):
					await unit.populateMe();
					unit = await unit.deploy(req.data.destination);
					client.emit('alert', { type: 'success', message: `${unit.name} deployed to ${unit.site.name}.` });
					break;
				default:
					message = `No ${req.type} in the '${req.action}' action the ${req.route} route.`;
					throw new Error(message);
				}
			}
			break;
		case('control'):
			// pass control method type for a unit
			try {
				let unit = await Military.findById(req.data.id);
				await unit.populateMe();
				unit = await unit.control(req.data.type);
				client.emit('alert', { type: 'success', message: `${unit.name} control reset ${req.data.type}` });
			}
			catch (error) {
				logger.error(`SOCKET-${req.route} [${req.action}]: ${error.message}`, { meta: error.stack });
				client.emit('alert', { type: 'error', message: error.message ? error.message : error });
			}
			break;
		default:
			message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
	}
	catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		logger.error(`SOCKET-${req.route}: ${error.message}`, { meta: error.stack });
	}
};