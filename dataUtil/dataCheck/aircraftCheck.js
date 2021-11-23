const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const typeVals = ['Interceptor', 'Transport', 'Decoy', 'Fighter'];

function inArray(array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkAircraft(runFlag) {
	let aFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initAircrafts/lean`);
		aFinds = data;
	}
	catch(err) {
		logger.error(`Aircraft Get Lean Error (zoneCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const aircraft of aFinds) {

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'team')) {
			logger.error(
				`Team missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'zone')) {
			logger.error(
				`Zone missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'organization')) {
			logger.error(
				`Organization missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		const skipSiteCheck = false;
		// assume all types should have a site/origin

		if (!skipSiteCheck) {
			if (!Object.prototype.hasOwnProperty.call(aircraft, 'origin')) {
				logger.error(
					`origin missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else if (
				aircraft.origin === '' ||
					aircraft.origin == undefined ||
					aircraft.origin == null
			) {
				logger.error(`origin is null for Aircraft ${aircraft.name} ${aircraft._id}`);
			}

			if (!Object.prototype.hasOwnProperty.call(aircraft, 'site')) {
				logger.error(
					`site missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else if (
				aircraft.site === '' ||
					aircraft.site == undefined ||
					aircraft.site == null
			) {
				logger.error(`site is null for Aircraft ${aircraft.name} ${aircraft._id}`);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'serviceRecord')) {
			logger.error(
				`serviceRecord missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'model')) {
			logger.error(
				`model missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'location')) {
			logger.error(
				`location missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(aircraft.location, 'lat')) {
				logger.error(
					`location.lat missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.location, 'lng')) {
				logger.error(
					`locaton.lng missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'type')) {
			logger.error(
				`type missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}
		else if (!inArray(typeVals, aircraft.type)) {
			logger.error(
				`Invalid type ${aircraft.type} for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'name')) {
			logger.error(`name missing for Aircraft ${aircraft._id}`);
		}
		else if (
			aircraft.name === '' ||
        aircraft.name == undefined ||
        aircraft.name == null
		) {
			logger.error(`name is blank for Aircraft ${aircraft._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'mission')) {
			logger.error(
				`mission missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'status')) {
			logger.error(
				`status missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'upgrades')) {
			logger.error(
				`upgrades missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'blueprint')) {
			logger.error(
				`blueprint missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'systems')) {
			logger.error(
				`systems missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(aircraft.systems, 'cockpit')) {
				logger.error(
					`systems.cockpit missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else {
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.cockpit, 'active')) {
					logger.error(
						`systems.cockpit.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.cockpit, 'damaged')) {
					logger.error(
						`systems.cockpit.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.systems, 'engine')) {
				logger.error(
					`systems.engine missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else {
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.engine, 'active')) {
					logger.error(
						`systems.engine.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.engine, 'damaged')) {
					logger.error(
						`systems.engine.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
			}

			if (!Object.prototype.hasOwnProperty.call(aircraft.systems, 'weapon')) {
				logger.error(
					`systems.weapon missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else {
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.weapon, 'active')) {
					logger.error(
						`systems.weapon.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.weapon, 'damaged')) {
					logger.error(
						`systems.weapon.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.systems, 'sensor')) {
				logger.error(
					`systems.sensor missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else {
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.sensor, 'active')) {
					logger.error(
						`systems.sensor.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.sensor, 'damaged')) {
					logger.error(
						`systems.sensor.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
			}

			if (!Object.prototype.hasOwnProperty.call(aircraft.systems, 'utility')) {
				logger.error(
					`systems.utility missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else {
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.utility, 'active')) {
					logger.error(
						`systems.utility.active missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(aircraft.systems.utility, 'damaged')) {
					logger.error(
						`systems.utility.damaged missing for Aircraft ${aircraft.name} ${aircraft._id}`
					);
				}
			}
		}

		if (!Object.prototype.hasOwnProperty.call(aircraft, 'stats')) {
			logger.error(
				`stats missing for Aircraft ${aircraft.name} ${aircraft._id}`
			);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'hull')) {
				logger.error(
					`stats.hull missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			else if (aircraft.stats.hull <= 0) {
				logger.error(
					`stats.hull less than or equal to zero for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'hullMax')) {
				logger.error(
					`stats.hullMax missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'attack')) {
				logger.error(
					`stats.attack missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'penetration')) {
				logger.error(
					`stats.penetration missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'armor')) {
				logger.error(
					`stats.armor missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'evade')) {
				logger.error(
					`stats.evade missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'detection')) {
				logger.error(
					`stats.detection missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'range')) {
				logger.error(
					`stats.range missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(aircraft.stats, 'cargo')) {
				logger.error(
					`stats.cargo missing for Aircraft ${aircraft.name} ${aircraft._id}`
				);
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initAircrafts/validate/${aircraft._id}`);
			if (!valMessage.data.type) {
				logger.error(`Aircraft Validation Error: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Aircraft Validation Error For ${aircraft.code} ${aircraft.name} Error: ${err.message}`
			);
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkAircraft;
