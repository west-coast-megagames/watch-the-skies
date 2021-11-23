const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const typeVals = ['Raid', 'Assault', 'Infiltration', 'Envoy', 'Science'];

function inArray(array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkSquad(runFlag) {
	let sFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initSquads/lean`);
		sFinds = data;
	}
	catch(err) {
		logger.error(`Squad Get Lean Error (squadCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const squad of sFinds) {

		if (!Object.prototype.hasOwnProperty.call(squad, 'model')) {
			logger.error(`model missing for Squad ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'zone')) {
			logger.error(`zone missing for Squad ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'team')) {
			logger.error(`team missing for Squad ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'organization')) {
			logger.error(`organization missing for Squad ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'origin')) {
			logger.error(`origin missing for Squad ${squad.name} ${squad._id}`);
		}
		else if (
			squad.origin === '' ||
				squad.origin == undefined ||
				squad.origin == null
		) {
			logger.error(`origin is null for Squad ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'site')) {
			logger.error(`site missing for Squad ${squad.name} ${squad._id}`);
		}
		else if (
			squad.site === '' ||
				squad.site == undefined ||
				squad.site == null
		) {
			logger.error(`site is null for Squad ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'name')) {
			logger.error(`name missing for Squad ${squad.name} ${squad._id}`);
		}
		else if (squad.name === '' || squad.name == undefined || squad.name == null) {
			logger.error(`name is blank for Squad ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'status')) {
			logger.error(`Squad status is missing ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'tags')) {
			logger.error(`Squad tags is missing ${squad.name} ${squad._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'type')) {
			logger.error(`type missing for Squad ${squad.name} ${squad._id}`);
		}
		else if (!inArray(typeVals, squad.type)) {
			logger.error(
				`Invalid type ${squad.type} for Squad ${squad.name} ${squad._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'rollBonus')) {
			logger.error(`rollBonus missing for squad ${squad.name} ${squad._id}`);
		}
		else if (isNaN(squad.rollBonus)) {
			logger.error(
				`Squad ${squad.name} ${squad._id} rollBonus is not a number ${squad.rollBonus}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(squad, 'upgrades')) {
			logger.error(`upgrades missing for squad ${squad.name} ${squad._id}`);
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initSquads/validate/${squad._id}`);
			if (!valMessage.data.type) {
				logger.error(`Squad Validation Error: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Squad Validation Error For ${squad.name} ${squad._id} Error: ${err.message}`
			);
		}
	}

	runFlag = true;

	return runFlag;
}

module.exports = chkSquad;
