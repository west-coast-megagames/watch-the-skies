const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initSquad.json',
	'utf8'
);
const squadDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runSquadLoad (runFlag) {
	try {
		// squadLoadDebugger("Jeff in runSquadLoad", runFlag);
		if (!runFlag) return false;
		if (runFlag) {
			await deleteAllSquads(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runSquadLoad Error: ${err.message}`, { meta: err.stack });
		return false;
	}
}

async function initLoad (doLoad) {
	// squadLoadDebugger("Jeff in initLoad", doLoad, squadDataIn.length);
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of squadDataIn) {
		++recReadCount;
		await loadSquad(data, recCounts);
	}

	logger.info(
		`Squad Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadSquad (iData, rCounts) {

	try {
		const { data } = await axios.get(`${gameServer}init/initSquads/name/${iData.name}`);

		if (!data.type) {
			// New Squad/Squad here
			const newSquad = iData;
			newSquad.serviceRecord = [];
			newSquad.gameState = [];

			if (iData.team != '') {
				const team = await axios.get(`${gameServer}init/initTeams/code/${iData.team}`);
				const tData = team.data;

				if (!tData.type) {
					++rCounts.loadErrCount;
					logger.error(`New Squad Invalid Team: ${iData.name} ${iData.team}`);
					return;
				}
				else {
					newSquad.team = tData._id;
				}
			}
			else {
				newSquad.team = undefined;
			}

			if (iData.country != '') {
				const country = await axios.get(`${gameServer}init/initCountries/code/${iData.country}`);
				const countryData = country.data;

				if (!countryData.type) {

					++rCounts.loadErrCount;
					logger.error(`New Squad Invalid Country: ${iData.name} ${iData.country}`);
					return;
				}
				else {
					newSquad.country = countryData._id;
					newSquad.zone = countryData.zone;
				}
			}
			else {
				newSquad.country = undefined;
				newSquad.zone = undefined;
			}

			if (iData.origin != '') {
				const base = await axios.get(`${gameServer}init/initFacilities/code/${iData.origin}`);
				const bData = base.data;

				if (!bData.type) {
					++rCounts.loadErrCount;
					logger.error(`New Squad Invalid Base: ${iData.name} ${iData.origin}`);
					return;
				}
				else if (bData.capability.ground.capacity > 0) {
					newSquad.origin = bData._id;
					newSquad.site = bData.site;
				}
				else {
					++rCounts.loadErrCount;
					logger.error(`New Squad Base does not have positive ground capacity: ${iData.name} ${iData.origin}`);
					return;
				}
			}
			else {
				newSquad.origin = undefined;
				newSquad.site = undefined;
			}

			newSquad.upgrade = [];

			try {
				await axios.post(`${gameServer}api/squad`, newSquad);
				++rCounts.loadCount;
				logger.debug(`${newSquad.name} add saved to Squad collection.`);
			}
			catch (err) {
				++rCounts.loadErrCount;
				logger.error(`New Squad Save Error: ${err.message}`, { meta: err.stack });
			}
		}
		else {
			// Existing Squad here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Squad skipped as name already exists in database: ${iData.name}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Squad Error: ${err.message}`, { meta: err.stack });
		return;
	}
}

async function deleteAllSquads (doLoad) {
	if (!doLoad) return;

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/squad/deleteAll/`);
		}
		catch (err) {
			logger.error(`Catch deleteAll Squad Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Squad succesfully deleted. (squadLoad');
		}
		else {
			logger.error('Some Error In Squad delete (deleteAll squadLoad):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAll Squad Error 2: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runSquadLoad;
