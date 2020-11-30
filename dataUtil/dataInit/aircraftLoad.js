const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initAircraft.json',
	'utf8'
);
const aircraftDataIn = JSON.parse(file);
// const mongoose = require('mongoose');
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

async function runaircraftLoad (runFlag) {
	try {
		// logger.debug("Jeff in runaircraftLoad", runFlag);
		if (!runFlag) return false;
		if (runFlag) {

			await deleteAllAircrafts(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runaircraftLoad Error: ${err.message}`, { meta: err });
		return false;
	}
}

async function initLoad (doLoad) {
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of aircraftDataIn) {
		++recReadCount;
		await loadAircraft(data, recCounts);
	}

	logger.info(
		`Aircraft Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadAircraft (iData, rCounts) {
	try {

		const { data } = await axios.get(`${gameServer}init/initAircrafts/name/${iData.name}`);

		if (!data.type) {
			await newAircraftCreate(iData, rCounts);
		}
		else {
			// Existing Aircraft here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Aircraft skipped as name already exists in database: ${iData.name}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Aircraft Error: ${err.message}`, { meta: err });
		return;
	}
}

async function deleteAllAircrafts (doLoad) {
	// logger.debug("Jeff in deleteAllAircrafts", doLoad);
	if (!doLoad) return;

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/aircrafts/deleteAll/`);
		}
		catch (err) {
			logger.error(`Catch deleteAllAircrafts Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Aircraft succesfully deleted. (aircraftLoad');
		}
		else {
			logger.error('Some Error In Aircraft delete (deleteAllAircraft):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAll Aircraft Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function newAircraftCreate (aData, rCounts) {

	// New Aircraft here
	const newAircraft = aData;
	newAircraft.serviceRecord = [];
	newAircraft.gameState = [];

	const blueprint = await axios.get(`${gameServer}init/initBlueprints/code/${aData.bpCode}`);
	const bpData = blueprint.data;

	if (!bpData.desc) {
		++rCounts.loadErrCount;
		logger.error(`New Aircraft Invalid Blueprint: ${aData.name} ${aData.bpCode}`);
		return;
	}
	else {
		newAircraft.stats = bpData.stats;
		newAircraft.type = bpData.type;
		newAircraft.blueprint = bpData._id;
	}

	const team = await axios.get(`${gameServer}init/initTeams/code/${aData.team}`);
	const tData = team.data;

	if (!tData.type) {
		++rCounts.loadErrCount;
		logger.error(`New Aircraft Invalid Team: ${aData.name} ${aData.team}`);
		return;
	}
	else {
		newAircraft.team = tData._id;
	}

	const country = await axios.get(`${gameServer}init/initCountries/code/${aData.country}`);
	const countryData = country.data;

	if (!countryData.type) {

		++rCounts.loadErrCount;
		logger.error(`New Aircraft Invalid Country: ${aData.name} ${aData.country}`);
		return;
	}
	else {
		newAircraft.country = countryData._id;
		newAircraft.zone = countryData.zone;
	}

	let baseSite = undefined;
	if (aData.base != '' && aData.base != 'undefined') {

		const base = await axios.get(`${gameServer}init/initFacilities/code/${aData.base}`);
		const bData = base.data;

		if (!bData.type) {
			++rCounts.loadErrCount;
			logger.error(`New Aircraft Invalid Base: ${aData.name} ${aData.base}`);
			return;
		}
		else if (bData.capability.airMission.capacity > 0) {
			newAircraft.origin = bData._id;
			baseSite = bData.site;
		}
		else {
			logger.error(`New Aircraft Base does not have positive airMission capacity. ${aData.base}`);
			return;
		}
	}

	if (aData.site != '' && aData.site != 'undefined') {
		const site = await axios.get(`${gameServer}init/initSites/code/${aData.site}`);
		const sData = site.data;

		if (!sData.type) {
			++rCounts.loadErrCount;
			logger.error(`New Aircraft has Invalid Site: ${aData.name} ${aData.site}`);
			return;
		}
		else {
			newAircraft.site = site._id;
		}
	}
	else {
		newAircraft.site = baseSite;
	}

	try {
		await axios.post(`${gameServer}api/aircrafts`, newAircraft);
		++rCounts.loadCount;
		logger.debug(`${newAircraft.name} add saved to Aircraft collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Aircraft Save Error: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runaircraftLoad;
