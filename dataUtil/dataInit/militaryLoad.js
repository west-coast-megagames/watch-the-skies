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
const { validUnitType } = require('../util/validateUnitType');

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function runMilitaryLoad(runFlag) {
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

async function initLoad(doLoad) {
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

async function loadMilitary(iData, rCounts) {
	try {
		const { data } = await axios.get(`${gameServer}init/initMilitaries/name/${iData.name}`);
		// type is now on the blueprint
		const blueprint = await axios.get(`${gameServer}init/initBlueprints/code/${iData.bpCode}`);
		const bpData = blueprint.data;

		if (!data.type) {
			if (!bpData.desc) {
				++rCounts.loadErrCount;
				logger.error(`New Military Invalid Blueprint: ${iData.name} ${iData.bpCode}`);
				return;
			}

			switch (bpData.type) {
			case 'Fleet':
				await createFleet(iData, rCounts, bpData);
				break;

			case 'Corps':
				await createCorps(iData, rCounts, bpData);
				break;

			default:
				++rCounts.loadErrCount;
				logger.error(
					'Invalid Military Load Type:',
					bpData.type,
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

async function deleteAllMilitarys(doLoad) {
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

async function createFleet(iData, rCounts, bpData) {
	// New Fleet/Military here
	const newFleet = iData;
	newFleet.serviceRecord = [];
	newFleet.blueprint = bpData._id;
	newFleet.stats = bpData.stats;
	newFleet.type = bpData.type;
	newFleet.status = [];

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

	if (iData.organization != '') {
		const organization = await axios.get(`${gameServer}init/initOrganizations/code/${iData.organization}`);
		const organizationData = organization.data;

		if (!organizationData.type) {

			++rCounts.loadErrCount;
			logger.error(`New Fleet Military Invalid Organization: ${iData.name} ${iData.organization}`);
			return;
		}
		else {
			newFleet.organization = organizationData._id;
			newFleet.zone = organizationData.zone;
		}
	}
	else {
		newFleet.organization = undefined;
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

	const upgrades = await findUpgrades(bpData.upgrades, 'Fleet', iData.name, newFleet.team, newFleet.origin);
	newFleet.upgrades = upgrades;

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

async function createCorps(iData, rCounts, bpData) {
	// New Corps/Military here
	const newCorps = iData;
	newCorps.serviceRecord = [];
	newCorps.blueprint = bpData._id;
	newCorps.stats = bpData.stats;
	newCorps.type = bpData.type;
	newCorps.status = [];

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

	if (iData.organization != '') {
		const organization = await axios.get(`${gameServer}init/initOrganizations/code/${iData.organization}`);
		const organizationData = organization.data;

		if (!organizationData.type) {

			++rCounts.loadErrCount;
			logger.error(`New Corps Military Invalid Organization: ${iData.name} ${iData.organization}`);
			return;
		}
		else {
			newCorps.organization = organizationData._id;
			newCorps.zone = organizationData.zone;
		}
	}
	else {
		newCorps.organization = undefined;
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

	const upgrades = await findUpgrades(bpData.upgrades, 'Corps', iData.name, newCorps.team, newCorps.origin);
	newCorps.upgrades = upgrades;

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
			logger.error(`New ${unitType} Military Upgrade Save Error: ${err.message}`, { meta: err.stack });
		}
	}
	return upgIds;
}

module.exports = runMilitaryLoad;
