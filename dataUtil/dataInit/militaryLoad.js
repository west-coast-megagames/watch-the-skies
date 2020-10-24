const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initMilitary.json',
	'utf8'
);
const militaryDataIn = JSON.parse(file);
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

async function runMilitaryLoad (runFlag) {
	try {
		if (!runFlag) return false;
		if (runFlag) {
			await deleteAllMilitarys(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runMilitaryLoad Error: ${err.message}`, { meta: err.stack });
		return false;
	}
}

async function initLoad (doLoad) {
	// militaryLoadDebugger("Jeff in initLoad", doLoad, militaryDataIn.length);
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of militaryDataIn) {
		++recReadCount;
		await loadMilitary(data, recCounts);
	}

	logger.info(
		`Military Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadMilitary (iData, rCounts) {
	try {
		const { data } = await axios.get(`${gameServer}init/initMilitaries/name/${iData.name}`);

		if (!data.type) {
			switch (iData.type) {
			case 'Fleet':
				await createFleet(iData, rCounts);
				break;

			case 'Corps':
				await createCorps(iData, rCounts);
				break;

			default:
				++rCounts.loadErrCount;
				logger.error(
					'Invalid Military Load Type:',
					iData.type,
					'name: ',
					iData.name
				);
			}
		}
		else {
			// Existing Military here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Military skipped as name already exists in database: ${iData.name}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Military Error: ${err.message}`, { meta: err.stack });
		return;
	}
}

async function deleteAllMilitarys (doLoad) {
	if (!doLoad) return;

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/military/deleteAll/`);
		}
		catch (err) {
			logger.error(`Catch deleteAll Military Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Military succesfully deleted. (militaryLoad');
		}
		else {
			logger.error('Some Error In Military delete (deleteAll militaryLoad):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAll Military Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function createFleet (iData, rCounts) {
	// New Fleet/Military here
	const newFleet = iData;
	newFleet.serviceRecord = [];
	newFleet.gameState = [];

	if (iData.team != '') {
		const team = await axios.get(`${gameServer}init/initTeams/code/${iData.team}`);
		const tData = team.data;

		if (!tData.type) {
			++rCounts.loadErrCount;
			logger.error(`New Fleet Military Invalid Team: ${iData.name} ${iData.team}`);
			return;
		}
		else {
			newFleet.team = tData._id;
		}
	}
	else {
		newFleet.team = undefined;
	}

	if (iData.country != '') {
		const country = await axios.get(`${gameServer}init/initCountries/code/${iData.country}`);
		const countryData = country.data;

		if (!countryData.type) {

			++rCounts.loadErrCount;
			logger.error(`New Fleet Military Invalid Country: ${iData.name} ${iData.country}`);
			return;
		}
		else {
			newFleet.country = countryData._id;
			newFleet.zone = countryData.zone;
		}
	}
	else {
		newFleet.country = undefined;
		newFleet.zone = undefined;
	}

	if (iData.origin != '') {
		const base = await axios.get(`${gameServer}init/initFacilities/code/${iData.origin}`);
		const bData = base.data;

		if (!bData.type) {
			++rCounts.loadErrCount;
			logger.error(`New Fleet Military Invalid Base: ${iData.name} ${iData.origin}`);
			return;
		}
		else if (bData.capability.naval.capacity > 0) {
			newFleet.origin = bData._id;
			newFleet.site = bData.site;
		}
		else {
			++rCounts.loadErrCount;
			logger.error(`New Fleet Military Base does not have positive naval capacity: ${iData.name} ${iData.origin}`);
			return;
		}
	}
	else {
		newFleet.origin = undefined;
		newFleet.site = undefined;
	}

	newFleet.upgrade = [];

	try {
		await axios.post(`${gameServer}api/military`, newFleet);
		++rCounts.loadCount;
		logger.debug(`${newFleet.name} add saved to Fleet Military collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Fleet Military Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function createCorps (iData, rCounts) {
	// New Corps/Military here
	const newCorps = iData;
	newCorps.serviceRecord = [];
	newCorps.gameState = [];

	if (iData.team != '') {
		const team = await axios.get(`${gameServer}init/initTeams/code/${iData.team}`);
		const tData = team.data;

		if (!tData.type) {
			++rCounts.loadErrCount;
			logger.error(`New Corps Military Invalid Team: ${iData.name} ${iData.team}`);
			return;
		}
		else {
			newCorps.team = tData._id;
		}
	}
	else {
		newCorps.team = undefined;
	}

	if (iData.country != '') {
		const country = await axios.get(`${gameServer}init/initCountries/code/${iData.country}`);
		const countryData = country.data;

		if (!countryData.type) {

			++rCounts.loadErrCount;
			logger.error(`New Corps Military Invalid Country: ${iData.name} ${iData.country}`);
			return;
		}
		else {
			newCorps.country = countryData._id;
			newCorps.zone = countryData.zone;
		}
	}
	else {
		newCorps.country = undefined;
		newCorps.zone = undefined;
	}

	if (iData.origin != '') {
		const base = await axios.get(`${gameServer}init/initFacilities/code/${iData.origin}`);
		const bData = base.data;

		if (!bData.type) {
			++rCounts.loadErrCount;
			logger.error(`New Corps Military Invalid Base: ${iData.name} ${iData.origin}`);
			return;
		}
		else if (bData.capability.ground.capacity > 0) {
			newCorps.origin = bData._id;
			newCorps.site = bData.site;
		}
		else {
			++rCounts.loadErrCount;
			logger.error(`New Corps Military Base does not have positive ground capacity: ${iData.name} ${iData.origin}`);
			return;
		}
	}
	else {
		newCorps.origin = undefined;
		newCorps.site = undefined;
	}

	newCorps.upgrade = [];
	try {
		await axios.post(`${gameServer}api/military`, newCorps);
		++rCounts.loadCount;
		logger.debug(`${newCorps.name} add saved to Corps Military collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Corps Military Save Error: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runMilitaryLoad;
