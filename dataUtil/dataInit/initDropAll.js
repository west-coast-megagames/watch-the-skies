const gameServer = require('../config/config').gameServer;
const axios = require('axios');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging

async function dropAll (doDrop) {
	if (!doDrop) return;

	// drop all tables
	/*
  await Site.deleteMany();
  await Account.deleteMany();
  await Aircraft.deleteMany();
  await Upgrade.deleteMany();
  await Facility.deleteMany();
  await Military.deleteMany();
  await Research.deleteMany();
  await Log.deleteMany();
  await Squad.deleteMany();
  await User.deleteMany();
  await Article.deleteMany();
  await LogError.deleteMany();
	await LogInfo.deleteMany();
	*/

	try {
		await axios.patch(`${gameServer}api/blueprints/deleteAll`);
		logger.info('Delete of All blueprints done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll blueprints in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/zones/deleteAll`);
		logger.info('Delete of All zones done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Zones in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/team/deleteAll`);
		logger.info('Delete of All teams done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Teams in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/country/deleteAll`);
		logger.info('Delete of All Country done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Country in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/user/deleteAll`);
		logger.info('Delete of All users done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Users in initDropAll: ${err.message}`, { meta: err.stack });
	}

	return true;
}

module.exports = dropAll;
