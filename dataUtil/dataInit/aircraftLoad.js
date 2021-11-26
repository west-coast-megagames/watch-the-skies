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
const { validUnitType } = require('../util/validateUnitType');
const { inArray } = require('../middleware/util/arrayCalls');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function runaircraftLoad(runFlag) {
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

async function initLoad(doLoad) {
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

async function loadAircraft(iData, rCounts) {
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

async function deleteAllAircrafts(doLoad) {
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

async function newAircraftCreate(aData, rCounts) {

	// New Aircraft here
	const newAircraft = aData;
	newAircraft.serviceRecord = [];
	newAircraft.location = {};
	newAircraft.tags = [];
	newAircraft.status = [];
	newAircraft.status.push('ready');
	newAircraft.status.push('action');
	newAircraft.status.push('mission');

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

	const organization = await axios.get(`${gameServer}init/initOrganizations/code/${aData.organization}`);
	const organizationData = organization.data;

	if (!organizationData.type) {

		++rCounts.loadErrCount;
		logger.error(`New Aircraft Invalid Organization: ${aData.name} ${aData.organization}`);
		return;
	}
	else {
		newAircraft.organization = organizationData._id;
		newAircraft.zone = organizationData.zone;
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
		else if (await inArray(bData.capabilities, 'hanger')) {
			newAircraft.origin = bData._id;
			baseSite = bData.site;
		}
		else {
			logger.error(`New Aircraft Base does not have hanger capabilities. ${aData.base}`);
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

	// set aircraft location based on site geoDecimal
	if (newAircraft.site != '' && newAircraft.site != 'undefined') {
		const site = await axios.get(`${gameServer}init/initSites/${newAircraft.site}`);
		const sData = site.data;

		if (!sData.code) {
			++rCounts.loadErrCount;
			logger.error(`New Aircraft has Invalid Site for location: ${aData.name} ${aData.site}`);
			return;
		}
		else {
			newAircraft.location.lat = sData.geoDecimal.lat;
			newAircraft.location.lng = sData.geoDecimal.lng;
		}
	}

	// get upgrades if we have a valid blueprint
	if (bpData.desc) {
		const upgrades = await findUpgrades(bpData.upgrades, newAircraft.type, newAircraft.name, newAircraft.team, newAircraft.origin);
		newAircraft.upgrades = upgrades;
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

async function findUpgrades(upgrades, unitType, unitName, team, facility) {
	const upgIds = [];
	for (const upg of upgrades) {
		const blueprint = await axios.get(`${gameServer}init/initBlueprints/code/${upg}`);
		const bpData = blueprint.data;

		if (!bpData.desc) {
			logger.error(`New ${unitType} Invalid Upgrade Blueprint: ${unitName} ${upg}`);
			continue;
		}

		if (!bpData.buildModel === 'upgrade') {
			logger.error(`New ${unitType} Upgrade Blueprint not an upgrade build model : ${unitName} ${upg}`);
			continue;
		}

		if (!validUnitType(bpData.unitType, unitType)) {
			logger.error(`New ${unitType} not valid for upgrade : ${unitName} ${upg}`);
			continue;
		}

		try {
			const upgradeBody = { code: upg, team: team, facility: facility,
				effects: bpData.effects, cost: bpData.cost, buildTime: bpData.buildTime,
				name: bpData.name, manufacturer: team, desc: bpData.desc,
				prereq: bpData.prereq };
			const newUpgrade = await axios.post(`${gameServer}init/initUpgrades/build`, upgradeBody);
			logger.debug(`New ${unitType} upgrade posted : ${unitName} ${upg} ${upgradeBody}`);
			const newUpg = newUpgrade.data;

			upgIds.push(newUpg._id);
		}
		catch (err) {
			logger.error(`New ${unitType} Aircraft Upgrade Save Error: ${err.message}`, { meta: err.stack });
		}
	}
	return upgIds;
}

module.exports = runaircraftLoad;
