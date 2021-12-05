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
const { validUnitType } = require('../util/validateUnitType');
const { inArray } = require('../middleware/util/arrayCalls');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


async function runSquadLoad(runFlag) {
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

async function initLoad(doLoad) {
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

async function loadSquad(iData, rCounts) {

	try {
		const { data } = await axios.get(`${gameServer}init/initSquads/name/${iData.name}`);
    // type is now on the blueprint
    const blueprint = await axios.get(`${gameServer}init/initBlueprints/code/${iData.bpCode}`);
    const bpData = blueprint.data;

		if (!data.type) {
			if (!bpData.desc) {
				++rCounts.loadErrCount;
				logger.error(`New Squad Invalid Blueprint: ${iData.name} ${iData.bpCode}`);
				return;
			}

			// New Squad/Squad here
			const newSquad = iData;
			//newSquad.serviceRecord = [];
			newSquad.tags = [];
			newSquad.status = [];
			newSquad.status.push('ready');
			newSquad.blueprint = bpData._id;
	    newSquad.stats = bpData.stats;
	    newSquad.type = bpData.type;

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

			if (iData.organization != '') {
				const organization = await axios.get(`${gameServer}init/initOrganizations/code/${iData.organization}`);
				const organizationData = organization.data;

				if (!organizationData.type) {

					++rCounts.loadErrCount;
					logger.error(`New Squad Invalid Organization: ${iData.name} ${iData.organization}`);
					return;
				}
				else {
					newSquad.organization = organizationData._id;
					newSquad.zone = organizationData.zone;
				}
			}
			else {
				newSquad.organization = undefined;
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
				else if (await inArray(bData.capabilities, 'garrison')) {
					newSquad.origin = bData._id;
					newSquad.site = bData.site;
				}
				else {
					++rCounts.loadErrCount;
					logger.error(`New Squad Base does not have garrison capabilities: ${iData.name} ${iData.origin}`);
					return;
				}
			}
			else {
				newSquad.origin = undefined;
				newSquad.site = undefined;
			}

			const upgrades = await findUpgrades(bpData.upgrades, 'Squad', iData.name, newSquad.team, newSquad.origin);
	    newSquad.upgrades = upgrades;

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

async function deleteAllSquads(doLoad) {
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
			logger.error(`New ${unitType} Squad Upgrade Save Error: ${err.message}`, { meta: err.stack });
		}
	}
	return upgIds;
}

module.exports = runSquadLoad;
