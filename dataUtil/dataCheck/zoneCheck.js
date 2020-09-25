// Zone Model - Using Mongoose Model

const { Country } = require('../models/country');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

async function chkZone (runFlag) {
	// get countries once
	const cFinds = await Country.find();
	// zoneCheckDebugger(`jeff here length of cFinds ${cFinds.length}`);
	/*
	for (const zone of await Zone.find().lean()) {
		// do not need toObject with .lean()
		// let testPropertys = zone.toObject();

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

		if (!Object.prototype.hasOwnProperty.call(zone, 'model')) {
			logger.error(`model missing for zone ${zone.name} ${zone._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(zone, 'gameState')) {
			logger.error(`gameState missing for zone ${zone.name} ${zone._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(zone, 'serviceRecord')) {
			logger.error(`serviceRecord missing for Zone ${zone.name} ${zone._id}`);
		}
		else {
			for (let i = 0; i < zone.serviceRecord.length; ++i) {
				const lFind = await Log.findById(zone.serviceRecord[i]);
				if (!lFind) {
					logger.error(
						`Zone ${zone.name} ${zone._id} has an invalid serviceRecord reference ${i}: ${zone.serviceRecord[i]}`
					);
				}
			}
		}

		// should be at least one country in the zone
		let countryCount = 0;
		const zoneId = zone._id.toHexString();
		countryLoop: for (let j = 0; j < cFinds.length; ++j) {
			const cZoneId = cFinds[j].zone.toHexString();
			if (cZoneId === zoneId) {
				++countryCount;
			}
			// only need one
			if (countryCount > 0) {
				break countryLoop;
			}
		}

		if (zone.type === 'Space') {
			try {
				const { error } = await validateSpaceZone(zone);
				if (error) {
					logger.error(
						`Zone Space Validation Error For ${zone.code} ${zone.name} Error: ${error.details[0].message}`
					);
				}
			}
			catch (err) {
				logger.error(
					`Zone Space Validation Error For ${zone.code} ${zone.name} Error: ${err.details[0].message}`
				);
			}
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(zone, 'terror')) {
				logger.error(`Terror missing for zone ${zone.name} ${zone._id}`);
			}
			else if (isNaN(zone.terror)) {
				logger.error(
					`Zone ${zone.name} ${zone._id} terror is not a number ${zone.terror}`
				);
			}

			try {
				const { error } = await validateGroundZone(zone);
				if (error) {
					logger.error(
						`Zone Ground Validation Error For ${zone.code} ${zone.name} Error: ${error.details[0].message}`
					);
				}
			}
			catch (err) {
				logger.error(
					`Zone Ground Validation Error For ${zone.code} ${zone.name} Error: ${err.details[0].message}`
				);
			}
	*/

	runFlag = true;
	return runFlag;
}

module.exports = chkZone;
