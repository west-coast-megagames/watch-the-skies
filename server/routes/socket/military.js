// const nexusEvent = require('../../middleware/events/events');
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { generateIntel } = require('../../models/intel');
// const masterClock = require('../../wts/gameClock/gameClock');

const { Military } = require('../../models/military');
const { Site } = require('../../models/site');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		let message;
		switch(req.action) {
		// MISSION <<socket action>> for the MILITARY <<Socket Route>>
		case('mission'):
			// Deploy action expects UNITS & ASSSIGNMENT
			for (const _id of req.data.units) {
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
			break;
		// ACTION <<socket action>> for the MILITARY <<Socket Route>>
		case('action'):
			for (const _id of req.data.units) {
				let unit = await Military.findById(_id);
				await unit.populateMe();
				// Switch for the Military Actions, triggered off of the TYPE of action being done
				switch (req.type) {
				case('aid'): // Aid Action Trigger
					// unit = await unit.aid(req.data.target)
					client.emit('alert', { type: 'info', message: `Our military is not prepaired to aid the local populace until D10` });
					break;
				case('equip'): // Equip Action Trigger
					unit = await unit.upgrade(req.data.upgradesAdd, req.data.upgradesRemove);
					client.emit('alert', { type: 'success', message: `${unit.name} equip completed.` });
					break;
				case('recon'): // Recon Action Trigger
					let target = await generateIntel(unit.team, req.data.target);
					await target.recon(req.data.target, `${unit.name} recon action at ${target}`);
					client.emit('alert', { type: 'success', message: `${unit.name} did at ${unit.site.name}.` });
					break;
				case('recall'): // Recon Action Trigger
					unit = await unit.recall();
					client.emit('alert', { type: 'success', message: `${unit.name} recalled.` });
					break;``
				case('repair'): // Repair Action Trigger
					unit = await unit.repair(req.data.upgrades);
					client.emit('alert', { type: 'success', message: `${unit.name} repaired.` });
					break;
				case('transfer'): // Transfer Action Trigger
					unit = await unit.transfer(req.data.destination);
					client.emit('alert', { type: 'success', message: `${unit.name} transferred to ${unit.site.name}.` });
					break;
				case('mobilize'): // Mobilize Action Trigger
					// Makes the unit capable of doing MISSIONS by moving its status to MOBILIZED
					unit = await unit.mobilize();
					client.emit('alert', { type: 'success', message: `${unit.name} has been mobilized.` });
					break;
				case('deploy'): // Deploy Action Trigger - THIS IS NO LONGER AN ACTION!!!
					unit = await unit.deploy(req.data.destination);
					client.emit('alert', { type: 'success', message: `${unit.name} deployed to ${unit.site.name}.` });
					break;
				default: // ERROR - No ACTION of this TYPE in the MILITARY <<socket route>>
					message = `No ${req.type} in the '${req.action}' action the ${req.route} route.`;
					throw new Error(message);
				}
			}
			break;
		// RESET <<Socket Action>> for the MILITARY <<Socket Route>>
		case('reset'):
			// pass control method type for a unit
			for (const _id of req.data.units) {
				let unit = await Military.findById(_id);
				await unit.populateMe();
				unit = await unit.reset(req.data.type);
				client.emit('alert', { type: 'success', message: `${unit.name} reset ${req.data.type}` });
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