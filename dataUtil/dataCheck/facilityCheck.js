const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const typeList = ['Hanger', 'Crisis', 'Civilian', 'Research', 'Base', "Space"];

function inArray(array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkFacility(runFlag) {
	let fFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initFacilities/lean`);
		fFinds = data;
	}
	catch(err) {
		logger.error(`Facility Get Lean Error (facilityCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const facility of fFinds) {

		if (!Object.prototype.hasOwnProperty.call(facility, 'model')) {
			logger.error(
				`model missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'name')) {
			logger.error(`name missing for Facility ${facility._id}`);
		}
		else if (
			facility.name === '' ||
        facility.name == undefined ||
        facility.name == null
		) {
			logger.error(
				`name is blank for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'team')) {
			logger.error(
				`team missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'site')) {
			logger.error(
				`site missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'code')) {
			logger.error(
				`code missing for Facility ${facility.name} ${facility._id}`
			);
		}
		else if (
			facility.code === '' ||
        facility.code == undefined ||
        facility.code == null
		) {
			logger.error(
				`code is blank for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'upgrade')) {
			logger.error(
				`upgrade missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'buildings')) {
			logger.error(
				`buildings missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'status')) {
			logger.error(
				`status missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'hidden')) {
			logger.error(
				`hidden missing for Facility ${facility.name} ${facility._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(facility, 'type')) {
			logger.error(
				`type missing for Facility ${facility.name} ${facility._id}`
			);
		}
		else {
			if (!inArray(typeList, facility.type)) {
				logger.error(
					`Invalid type ${facility.type} for Facility ${facility.name} ${facility._id}`
				);
			}

			if (facility.type === 'Base') {
				// nothing to do here yet
			}

			if (facility.type === 'Research') {
				// nothing to do here yet
			}

			if (facility.type === 'Factory') {
				// nothing to do here yet
			}

			if (facility.type === 'Hanger') {
				// only have type field for Hanger currently
			}

			if (facility.type === 'Crisis') {
				// only have type field for Crisis currently
			}

			if (facility.type === 'Civilian') {
				// only have type field for Civilian currently
			}

			if (facility.type === 'Lab') {
				// nothing to do here yet
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initFacilities/validate/${facility._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error For ${facility.code} ${facility.name}: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Facility Validation Error For ${facility.code} ${facility.name} Error: ${err.message}`
			);
		}

	}

	runFlag = true;
	return runFlag;
}

module.exports = chkFacility;
