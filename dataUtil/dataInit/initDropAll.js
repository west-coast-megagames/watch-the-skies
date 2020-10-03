const gameServer = require('../config/config').gameServer;
const axios = require('axios');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging

async function dropAll (doDrop) {
	if (!doDrop) return;

	// drop all tables
	/*

  await Account.deleteMany();
  await Upgrade.deleteMany();
  await Military.deleteMany();
  await Research.deleteMany();
  await Log.deleteMany();
  await Squad.deleteMany();
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
		await axios.patch(`${gameServer}api/countries/deleteAll`);
		logger.info('Delete of All Country done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Country in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/sites/deleteAll`);
		logger.info('Delete of All Sites done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Sites in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/facilities/deleteAll`);
		logger.info('Delete of All Facilities done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Facilities in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/aircrafts/deleteAll`);
		logger.info('Delete of All Aircraft done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Aircraft in initDropAll: ${err.message}`, { meta: err.stack });
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
