const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initZone.json',
	'utf8'
);

const gameServer = require('../config/config').gameServer;
const zoneDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const axios = require('axios');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runZoneLoad (runFlag) {
	if (!runFlag) return false;
	if (runFlag) await initLoad(runFlag);
	return true;
}

async function initLoad (doLoad) {
	if (!doLoad) return;

	// delete all records every time

	// Delete now regardless of loadFlag
	await deleteAllZones();

	let zoneRecReadCount = 0;
	const zoneRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of zoneDataIn) {
		// for (let i = 0; i < refDataIn.length; ++i ) {
		if (data.loadType == 'zone') {
			if (data.loadFlag === 'true') {
				++zoneRecReadCount;
				await loadZone(
					data.name,
					data.code,
					data.loadFlag,
					data.terror,
					data.type,
					zoneRecCounts
				);
			}
		}
	}

	logger.info(
		`Zone Load Counts Read: ${zoneRecReadCount} Errors: ${zoneRecCounts.loadErrCount} Saved: ${zoneRecCounts.loadCount} Updated: ${zoneRecCounts.updCount}`
	);

	return;
}

async function loadZone (zName, zCode, zLoadFlg, zTerror, zType, rCounts) {
	let loadName = '';

	try {
		// for testing purposes
		let randomTerror = 0;
		if (zTerror < 300) {
			randomTerror = Math.floor(Math.random() * 251);
			logger.info(`load terror value ${zTerror} replaced by random value for testing ${randomTerror} for zone ${zName}`);
		}
		else {
			randomTerror = zTerror;
		}

		const { data } = await axios.get(`${gameServer}api/zones/code/${zCode}`);
		console.log(data);
		loadName = zName;

		if (!data.type) {
			// New Zone here
			if (zLoadFlg === 'false') return; // don't load if not true

			let SpaceZone = {};
			let GroundZone = {};
			switch (zType) {
			case 'Space':
				SpaceZone = {
					code: zCode,
					name: zName,
					serviceRecord: [],
					gameState: [],
					type: 'Space'
				};

				try {
					const response = await axios.post(`${gameServer}api/zones`, SpaceZone);
					logger.info(`resonse from post of Spacezone ${response.data}`);
					++rCounts.loadCount;
					logger.debug(`${SpaceZone.name} add saved to Space zones collection.`);
				}
				catch (err) {
					++rCounts.loadErrCount;
					logger.error(`New Space Zone Save Error: ${err.message}`, { meta: err.stack });
				}
				break;

			case 'Ground':
				GroundZone = {
					code: zCode,
					name: zName,
					terror: randomTerror, // zTerror
					serviceRecord: [],
					gameState: [],
					type: 'Ground'
				};
				try {
					const response = await axios.post(`${gameServer}api/zones`, GroundZone);
					logger.info(`resonse from post of Groundzone ${response}`);
					++rCounts.loadCount;
					logger.debug(`${GroundZone.name} add saved to Ground zones collection.`);
				}
				catch (err) {
					++rCounts.loadErrCount;
					logger.error(`New Ground Zone Save Error: ${err.message}`, { meta: err });
				}
				break;

			default:
				logger.error(
					`Zone skipped due to invalid Type: ${loadName} ${zType}`
				);
				++rCounts.loadErrCount;
			}
			return;
		}
		else {
			// Existing Zone here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Zone skipped as code already exists in database: ${loadName} ${zCode}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		logger.error(`Catch Zone Error: ${err.message}`, { meta: err });
		++rCounts.loadErrCount;
		return;
	}
}

async function deleteAllZones () {
	try {
		let delErrorFlag = false;

		try {
			const res = await axios.patch(`${gameServer}api/zones/deleteAll`);
			logger.info(`Delete of All zones done. ${res}`);
		}
		catch (err) {
			logger.error(`Catch deleteAllZones Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Zones succesfully deleted.');
		}
		else {
			logger.error('Some Error In Zones delete all');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAllZones Error 2: ${err.message}`, { meta: err });
	}
}

module.exports = runZoneLoad;
