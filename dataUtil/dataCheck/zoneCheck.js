const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

async function chkZone (runFlag) {

	let zFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initZones/lean`);
		zFinds = data;
	}
	catch(err) {
		logger.error(`Zone Get Lean Error (zoneCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const zone of zFinds) {

		if (!Object.prototype.hasOwnProperty.call(zone, 'model')) {
			logger.error(`model missing for zone ${zone.name} ${zone._id}`);
		}
		else if (!zone.code === 'Zone') {
			logger.error(`Model is not 'Zone' ${zone.name} ${zone._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(zone, 'code')) {
			logger.error(`code missing for zone ${zone.name} ${zone._id}`);
		}
		else if (zone.code === '' || zone.code == undefined || zone.code == null) {
			logger.error(`code is blank for Zone ${zone.name} ${zone._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(zone, 'name')) {
			logger.error(`name missing for zone ${zone._id}`);
		}
		else if (zone.name === '' || zone.name == undefined || zone.name == null) {
			logger.error(`name is blank for Zone ${zone.code} ${zone._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(zone, 'gameState')) {
			logger.error(`gameState missing for zone ${zone.name} ${zone._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(zone, 'serviceRecord')) {
			logger.error(`serviceRecord missing for Zone ${zone.name} ${zone._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(zone, 'type')) {
			logger.error(`type missing for zone ${zone.name} ${zone._id}`);
		}
		else if (zone.type === '' || zone.type == undefined || zone.type == null) {
			logger.error(`type is blank for Zone ${zone.name} ${zone._id}`);
		}

		if (zone.type === 'Space') {
			try {
				/*
				nothing to test beyond type
				*/
			}
			catch (err) {
				logger.error(
					`Zone Space Validation Error For ${zone.code} ${zone.name} Error: ${err.details[0].message}`
				);
			}
		}
		else if (zone.type === 'Ground') {
			if (!Object.prototype.hasOwnProperty.call(zone, 'terror')) {
				logger.error(`Terror missing for zone ${zone.name} ${zone._id}`);
			}
			else if (isNaN(zone.terror)) {
				logger.error(
					`Zone ${zone.name} ${zone._id} terror is not a number ${zone.terror}`
				);
			}
		}
		else {
			logger.error(`Invalid Type for 'Zone' ${zone.name} ${zone._id}`);
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initZones/validate/${zone._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Zone Validation Error For ${zone.code} ${zone.name} Error: ${err.message}`
			);
		}

	}

	runFlag = true;
	return runFlag;
}

module.exports = chkZone;
