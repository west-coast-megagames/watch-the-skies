const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

async function chkUpgrade(runFlag) {
	let uFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initUpgrades/lean`);
		uFinds = data;
	}
	catch(err) {
		logger.error(`Upgrade Get Lean Error (upgradeCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const upgrade of uFinds) {

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'team')) {
			logger.error(
				`team link missing for Upgrade ${upgrade.name} ${upgrade._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'manufacturer')) {
			logger.error(
				`Manufacturer link missing for Upgrade ${upgrade.name} ${upgrade._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'model')) {
			logger.error(`model missing for Upgrade ${upgrade.name} ${upgrade._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'serviceRecord')) {
			logger.error(
				`serviceRecord missing for Upgrade ${upgrade.name} ${upgrade._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'name')) {
			logger.error(`name missing for Upgrade ${upgrade.name} ${upgrade._id}`);
		}
		else if (
			upgrade.name === '' ||
        upgrade.name == undefined ||
        upgrade.name == null
		) {
			logger.error(
				`name is blank for Upgrade ${upgrade.name} ${upgrade._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'code')) {
			logger.error(`code missing for Upgrade ${upgrade.name} ${upgrade._id}`);
		}
		else if (
			upgrade.code === '' ||
        upgrade.code == undefined ||
        upgrade.code == null
		) {
			logger.error(
				`code is blank for Upgrade ${upgrade.name} ${upgrade._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'cost')) {
			logger.error(`cost missing for Upgrade ${upgrade.name} ${upgrade._id}`);
		}
		else if (isNaN(upgrade.cost)) {
			logger.error(
				`Upgrade ${upgrade.name} ${upgrade._id} cost is not a number ${upgrade.cost}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'buildTime')) {
			logger.error(
				`buildTime missing for upgrade ${upgrade.name} ${upgrade._id}`
			);
		}
		else if (isNaN(upgrade.buildTime)) {
			logger.error(
				`upgrade ${upgrade.name} ${upgrade._id} buildTime is not a number ${upgrade.buildTime}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'buildCount')) {
			logger.error(
				`buildCount missing for upgrade ${upgrade.name} ${upgrade._id}`
			);
		}
		else if (isNaN(upgrade.buildCount)) {
			logger.error(
				`upgrade ${upgrade.name} ${upgrade._id} buildCount is not a number ${upgrade.buildCount}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'desc')) {
			logger.error(`desc missing for upgrade ${upgrade.name} ${upgrade._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'prereq')) {
			logger.error(`prereq missing for upgrade ${upgrade.name} ${upgrade._id}`);
		}
		else {
			for (let j = 0; j < upgrade.prereq.length; ++j) {
				if (!Object.prototype.hasOwnProperty.call(upgrade.prereq[j], 'type')) {
					logger.error(
						`prereq.type ${j} missing for upgrade ${upgrade.name} ${upgrade._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(upgrade.prereq[j], 'code')) {
					logger.error(
						`prereq.code ${j} missing for upgrade ${upgrade.name} ${upgrade._id}`
					);
				}
			}
		}

		if (!Object.prototype.hasOwnProperty.call(upgrade, 'status')) {
			logger.error(`status missing for upgrade ${upgrade.name} ${upgrade._id}`);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(upgrade.status, 'building')) {
				logger.error(
					`status.building missing for upgrade ${upgrade.name} ${upgrade._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(upgrade.status, 'salvage')) {
				logger.error(
					`status.salvage missing for upgrade ${upgrade.name} ${upgrade._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(upgrade.status, 'damaged')) {
				logger.error(
					`status.damaged missing for upgrade ${upgrade.name} ${upgrade._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(upgrade.status, 'destroyed')) {
				logger.error(
					`status.destroyed missing for upgrade ${upgrade.name} ${upgrade._id}`
				);
			}

			if (!Object.prototype.hasOwnProperty.call(upgrade.status, 'storage')) {
				logger.error(
					`status.storage missing for upgrade ${upgrade.name} ${upgrade._id}`
				);
			}

			if (upgrade.status.building) {
				logger.info(
					`upgrade Status Is Building For ${upgrade.name} ${upgrade._id}`
				);
			}
		}

		/* not yet (???)
    if (!Object.prototype.hasOwnProperty.call(upgrade, "militaryStats")) {
      logger.error(
        `militaryStats missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      //don't take it down to stats fields as they are only present if value assigned (no defaults)
    }

    if (!Object.prototype.hasOwnProperty.call(upgrade, "facilityStats")) {
      logger.error(
        `facilityStats missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      //don't take it down to stats fields as they are only present if value assigned (no defaults)
    }

    if (!Object.prototype.hasOwnProperty.call(upgrade, "aircraftStats")) {
      logger.error(
        `aircraftStats missing for upgrade ${upgrade.name} ${upgrade._id}`
      );
    } else {
      //don't take it down to stats fields as they are only present if value assigned (no defaults)
		}
		jeff */

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initUpgrades/validate/${upgrade._id}`);
			if (!valMessage.data.desc) {
				logger.error(`Validation Error ${upgrade.code} ${upgrade.name} Upgrade: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Upgrade Validation Error For ${upgrade.code} ${upgrade.name} Error: ${err.message}`
			);
		}

	}

	runFlag = true;
	return runFlag;
}

module.exports = chkUpgrade;
