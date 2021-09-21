const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

async function chkBlueprint (runFlag) {
	let bFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initBlueprints/lean`);
		bFinds = data;
	}
	catch(err) {
		logger.error(`Blueprint Get Lean Error (blueprintCheck): ${err.message}`, { meta: err.stack });
		return false;
	}
	for await (const blueprint of bFinds) {
		// do not need toObject with .lean()
		// let testPropertys = blueprint.toObject();

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'code')) {
			logger.error(
				`code missing for blueprint ${blueprint.name} ${blueprint._id}`
			);
		}
		else if (
			blueprint.code === '' ||
        blueprint.code == undefined ||
        blueprint.code == null
		) {
			logger.error(
				`code is blank for Blueprint ${blueprint.name} ${blueprint._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'name')) {
			logger.error(`name missing for blueprint ${blueprint._id}`);
		}
		else if (
			blueprint.name === '' ||
        blueprint.name == undefined ||
        blueprint.name == null
		) {
			logger.error(
				`name is blank for Blueprint ${blueprint.code} ${blueprint._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'model')) {
			logger.error(
				`model missing for blueprint ${blueprint.name} ${blueprint._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'tags')) {
			logger.error(
				`tags missing for blueprint ${blueprint.name} ${blueprint._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'cost')) {
			logger.error(
				`cost missing for blueprint ${blueprint.name} ${blueprint._id}`
			);
		}
		else if (isNaN(blueprint.cost)) {
			logger.error(
				`Blueprint ${blueprint.name} ${blueprint._id} cost is not a number ${blueprint.cost}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'buildTime')) {
			logger.error(
				`buildTime missing for blueprint ${blueprint.name} ${blueprint._id}`
			);
		}
		else if (isNaN(blueprint.buildTime)) {
			logger.error(
				`Blueprint ${blueprint.name} ${blueprint._id} buildTime is not a number ${blueprint.buildTime}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'desc')) {
			logger.error(
				`desc missing for Blueprint ${blueprint.name} ${blueprint._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'prereq')) {
			logger.error(
				`prereq missing for Blueprint ${blueprint.name} ${blueprint._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'hidden')) {
			logger.error(
				`hidden missing for Blueprint ${blueprint.name} ${blueprint._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(blueprint, 'buildModel')) {
			logger.error(
				`buildModel missing for Blueprint ${blueprint.name} ${blueprint._id}`
			);
		}
		else {
			switch (blueprint.buildModel) {
			case 'facility':
				if (!Object.prototype.hasOwnProperty.call(blueprint, 'type')) {
					logger.error(
						`type missing for facility blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'status')) {
					logger.error(
						`status missing for facility blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'site')) {
					/*
            logger.error(
              `site missing for facility blueprint ${blueprint.name} ${blueprint._id}`
            );
            */
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'upgrades')) {
					logger.error(
						`upgrades missing for facility blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'capacity')) {
					logger.error(
						`capacity missing for facility blueprint ${blueprint.name} ${blueprint._id}`
					);
				}
				else if (isNaN(blueprint.capacity)) {
					logger.error(
						`Blueprint ${blueprint.name} ${blueprint._id} capacity is not a number ${blueprint.capacity}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'status')) {
					logger.error(
						`status missing for facility blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'unitType')) {
					logger.error(
						`unitType missing for facility blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (blueprint.type === 'Lab') {
					if (!Object.prototype.hasOwnProperty.call(blueprint, 'funding')) {
						logger.error(
							`funding missing for facility blueprint ${blueprint.name} ${blueprint._id}`
						);
					}

					if (!Object.prototype.hasOwnProperty.call(blueprint, 'sciRate')) {
						logger.error(
							`sciRate missing for facility blueprint ${blueprint.name} ${blueprint._id}`
						);
					}
					else if (isNaN(blueprint.sciRate)) {
						logger.error(
							`Blueprint ${blueprint.name} ${blueprint._id} sciRate is not a number ${blueprint.sciRate}`
						);
					}

					if (!Object.prototype.hasOwnProperty.call(blueprint, 'sciBonus')) {
						logger.error(
							`sciBonus missing for facility blueprint ${blueprint.name} ${blueprint._id}`
						);
					}
					else if (isNaN(blueprint.sciBonus)) {
						logger.error(
							`Blueprint ${blueprint.name} ${blueprint._id} sciBonus is not a number ${blueprint.sciBonus}`
						);
					}
				}

				break;

			case 'military':
				if (!Object.prototype.hasOwnProperty.call(blueprint, 'type')) {
					logger.error(
						`type missing for military blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'upgrades')) {
					logger.error(
						`upgrades missing for military blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'stats')) {
					logger.error(
						`stats missing for military blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				break;

			case 'aircraft':
				if (!Object.prototype.hasOwnProperty.call(blueprint, 'type')) {
					logger.error(
						`type missing for aircraft blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'upgrades')) {
					logger.error(
						`upgrades missing for aircraft blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'stats')) {
					logger.error(
						`stats missing for aircraft blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				break;

			case 'upgrade':
				if (!Object.prototype.hasOwnProperty.call(blueprint, 'unitType')) {
					logger.error(
						`unitType missing for upgrade blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(blueprint, 'effects')) {
					logger.error(
						`effects missing for upgrade blueprint ${blueprint.name} ${blueprint._id}`
					);
				}

				break;

			default:
				logger.error(
					`Invalid Blueprint BuildModel:  ${blueprint.buildModel} for ${blueprint.name} ${blueprint._id}`
				);
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initBlueprints/validate/${blueprint._id}`);
			if (!valMessage.data.desc) {
				logger.error(`Validation Error For ${blueprint.code} ${blueprint.name}: ${valMessage.data.message}`);
			}
		}
		catch (err) {
			logger.error(
				`Blueprint Validation Error For ${blueprint.code} ${blueprint.name} Error: ${err.message}`
			);
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkBlueprint;
