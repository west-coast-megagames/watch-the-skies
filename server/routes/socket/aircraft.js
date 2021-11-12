const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { Aircraft } = require('../../models/aircraft');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		let message;
		switch(req.action) {
		case('action'):
			for (const _id of req.data.aircraft) {
				let unit = await Aircraft.findById(_id);
				await unit.populateMe();
				// Switch for the Military Actions, triggered off of the TYPE of action being done
				switch (req.type) {
				case('repair'): // Repair Action Trigger
					unit = await unit.repair(req.data.upgrades);
					client.emit('alert', { type: 'success', message: `${unit.name} repaired.` });
					break;
				case('patrol'): // Patrol Action Trigger
					client.emit('alert', { type: 'success', message: `Patrol not hooked up on backend!` });
					break;
				case('recon'): // recon Action Trigger
					client.emit('alert', { type: 'success', message: `recon not hooked up on backend!` });
					break;
				case('transport'): // transport Action Trigger
					client.emit('alert', { type: 'success', message: `transport not hooked up on backend!` });
					break;
				case('transfer'): // Transfer Action Trigger
					message = await unit.transfer(req.data.destination);
					client.emit('alert', { type: 'success', message });
					break;
				default: // ERROR - No ACTION of this TYPE in the MILITARY <<socket route>>
					message = `No ${req.type} in the '${req.action}' action the ${req.route} route.`;
					throw new Error(message);
				}
			}
			break;
		case('reset'):
			// pass control method type for a unit
			for (const _id of req.data.units) {
				let unit = await Aircraft.findById(_id);
				await unit.populateMe();
				unit = await unit.reset(req.data.type);
				client.emit('alert', { type: 'success', message: `${unit.name} reset ${req.data.type}` });
			}
			break;
		default: {
			message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
		}
	}
	catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		logger.error(error);
	}
};