const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const typeVals = ['Fleet', 'Corps'];

function inArray (array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkMilitary (runFlag) {
	let mFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initMilitaries/lean`);
		mFinds = data;
	}
	catch(err) {
		logger.error(`Military Get Lean Error (militaryCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const military of mFinds) {

		if (!Object.prototype.hasOwnProperty.call(military, 'model')) {
			logger.error(
				`model missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'gameState')) {
			logger.error(
				`gameState missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'name')) {
			logger.error(
				`name missing for Military ${military.name} ${military._id}`
			);
		}
		else if (
			military.name === '' ||
        military.name == undefined ||
        military.name == null
		) {
			logger.error(
				`name is blank for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'team')) {
			logger.error(
				`team missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'zone')) {
			logger.error(
				`zone missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'country')) {
			logger.error(
				`country missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'site')) {
			logger.error(
				`site missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'origin')) {
			logger.error(
				`origin missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'status')) {
			logger.error(
				`status missing for Military ${military.name} ${military._id}`
			);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(military.status, 'deployed')) {
				logger.error(
					`status.deployed missing for Military ${military.name} ${military._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(military.status, 'damaged')) {
				logger.error(
					`status.damaged missing for Military ${military.name} ${military._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(military.status, 'destroyed')) {
				logger.error(
					`status.destroyed missing for Military ${military.name} ${military._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(military.status, 'repair')) {
				logger.error(
					`status.repair missing for Military ${military.name} ${military._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(military.status, 'secret')) {
				logger.error(
					`status.secret missing for Military ${military.name} ${military._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'hidden')) {
			logger.error(
				`hidden missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'upgrades')) {
			logger.error(
				`upgrades missing for military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'serviceRecord')) {
			logger.error(
				`serviceRecord missing for Military ${military.name} ${military._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(military, 'type')) {
			logger.error(
				`type missing for Military ${military.name} ${military._id}`
			);
		}
		else {
			if (!inArray(typeVals, military.type)) {
				logger.error(
					`Invalid type ${military.type} for Military ${military.name} ${military._id}`
				);
			}
			if (military.type === 'Fleet' || military.type === 'Corps') {
				if (!Object.prototype.hasOwnProperty.call(military, 'stats')) {
					logger.error(
						`stats missing for Military ${military.name} ${military._id}`
					);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(military.stats, 'health')) {
						logger.error(
							`stats.health missing for Military ${military.name} ${military._id}`
						);
					}
					if (!Object.prototype.hasOwnProperty.call(military.stats, 'healthMax')) {
						logger.error(
							`stats.healthMax missing for Military ${military.name} ${military._id}`
						);
					}
					if (!Object.prototype.hasOwnProperty.call(military.stats, 'attack')) {
						logger.error(
							`stats.attack missing for Military ${military.name} ${military._id}`
						);
					}
					if (!Object.prototype.hasOwnProperty.call(military.stats, 'defense')) {
						logger.error(
							`stats.defense missing for Military ${military.name} ${military._id}`
						);
					}
					if (!Object.prototype.hasOwnProperty.call(military.stats, 'localDeploy')) {
						logger.error(
							`stats.localDeploy missing for Military ${military.name} ${military._id}`
						);
					}
					if (!Object.prototype.hasOwnProperty.call(military.stats, 'globalDeploy')) {
						logger.error(
							`stats.globalDeploy missing for Military ${military.name} ${military._id}`
						);
					}
					if (!Object.prototype.hasOwnProperty.call(military.stats, 'invasion')) {
						logger.error(
							`stats.invasion missing for Military ${military.name} ${military._id}`
						);
					}
				}
			}
			else {
				logger.error(
					`Invalid Type ${military.type} for Military ${military.name} ${military._id}`
				);
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initMilitaries/validate/${military._id}`);
			if (!valMessage.data.type) {
				logger.error(`Military Validation Error: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Military Validation Error For ${military.name} ${military._id} Error: ${err.message}`
			);
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkMilitary;
