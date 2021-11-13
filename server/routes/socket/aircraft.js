const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling
const { Aircraft } = require('../../models/aircraft');
const { AirMission } = require('../../models/report');
const { Site } = require('../../models/site');
const randomCords = require('../../util/systems/lz');

const terror = require('../../wts/terror/terror');

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
		case('mission'):
			let result = '';
			let { aircrafts, target, mission } = req.data;
			for (let unit of aircrafts) {

				let aircraft = await Aircraft.findById(unit).populate('upgrades').populate('site').populate('origin').populate('team');

				if (mission === 'Interception' || mission === 'Escort' || mission === 'Recon Aircraft') {
					target = await Aircraft.findById(target).populate('upgrades').populate('site');
					aircraft.site = target.site._id;
					aircraft.location = randomCords(target.site.geoDecimal.lat, target.site.geoDecimal.lng);
				}
				else if (mission === 'Diversion' || mission === 'Transport' || mission === 'Recon Site' || mission === 'Patrol') {
					target = await Site.findById(target);
					aircraft.site = target._id;
					aircraft.location = randomCords(target.geoDecimal.lat, target.geoDecimal.lng);
				}

				if (aircraft.team.type === 'Alien') terror.alienActivity(aircraft.site, 'Air');

				result = `${aircraft.name} launching...`;
				aircraft.organization = target.organization;
				aircraft.zone = target.zone;
				aircraft.mission = mission;

				aircraft = await aircraft.launch(mission); // Changes attacker status
				result = `${result} ${aircraft.name} en route to attempt ${mission.toLowerCase()}.`;

				await AirMission.start(aircraft, target, mission);
				client.emit('alert', { type: 'success', message: result });
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