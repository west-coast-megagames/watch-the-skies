const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initSpacecraft.json',
	'utf8'
);
const spacecraftDataIn = JSON.parse(file);
// const mongoose = require('mongoose');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function runSpacecraftLoad (runFlag) {
	try {
		// spacecraftDebugger("Jeff in runSpacecraftLoad", runFlag);
		if (!runFlag) return false;
		if (runFlag) {
			await deleteAllSpacecraft(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});

		return false;
	}
}

async function initLoad (doLoad) {
	if (!doLoad) return;
	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of spacecraftDataIn) {
		++recReadCount;
		await loadSpacecraft(data, recCounts);
	}

	logger.info(
		`Spacecraft Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadSpacecraft (iData, rCounts) {
	try {
		const { data } = await axios.get(`${gameServer}init/initSites/code/${iData.code}`);

		if (!data.type) {
			await newSpacecraft(iData, rCounts);
		}
		else {
			// Existing Spacecraft here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Spacecraft skipped as code already exists in database: ${iData.name} ${iData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Spacecraft Error: ${err.message}`, { meta: err });

		return;
	}
}

async function deleteAllSpacecraft (doLoad) {
	// logger.debug('Jeff in deleteAllSpacecrafts');
	if (!doLoad) return;

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/sites/deleteAllSpacecraft/`);
		}
		catch (err) {
			logger.error(`Catch deleteAllSpacecraft Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Spacecraft succesfully deleted. (spacecraftLoad');
		}
		else {
			logger.error('Some Error In Spacecraft delete (deleteAllSpacecraf - spacecraftLoad):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAllSpacecraft Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function newSpacecraft (sData, rCounts) {

	// New Spacecraft(space) Site here

	const SpaceSite = sData;
	SpaceSite.type = 'Space';
	SpaceSite.serviceRecord = [];
	SpaceSite.gameState = [];
	SpaceSite.subType = sData.shipType;
	SpaceSite.status = sData.status;
	SpaceSite.hidden = sData.hidden;
	SpaceSite.facilities = [];

	if (sData.teamCode) {
		const team = await axios.get(`${gameServer}init/initTeams/code/${sData.teamCode}`);
		const tData = team.data;

		if (!tData.type) {

			++rCounts.loadErrCount;
			logger.error(`New Spacecraft Site Invalid Team: ${sData.name} ${sData.teamCode}`);
			return;
		}
		else {
			SpaceSite.team = tData._id;
		}
	}
	else {
		++rCounts.loadErrCount;
		logger.error(`New Spacecraft Site Blank Team: ${sData.name} ${sData.teamCode}`);
		return;
	}

	if (sData.countryCode) {
		const country = await axios.get(`${gameServer}init/initCountries/code/${sData.countryCode}`);
		const countryData = country.data;

		if (!countryData.type) {

			++rCounts.loadErrCount;
			logger.error(`New Spacecraft Site Invalid Country: ${sData.name} ${sData.countryCode}`);
			return;
		}
		else {
			SpaceSite.country = countryData._id;
		}
	}
	else {
		++rCounts.loadErrCount;
		logger.error(`New Spacecraft Site Blank Country: ${sData.name} ${sData.countryCode}`);
		return;
	}

	let useZone = '';
	if (sData.siteCode) {
		const site = await axios.get(`${gameServer}init/initSites/code/${sData.siteCode}`);
		const siteData = site.data;

		if (!siteData.type) {

			++rCounts.loadErrCount;
			logger.error(`New Spacecraft Site Invalid Site: ${sData.name} ${sData.siteCode}`);
			return;
		}
		else {
			SpaceSite.site = siteData._id;

			// set zone based on Type
			switch (SpaceSite.subType) {
			// Lunar Orbit
			case 'Cruiser':
			case 'Battleship':
			case 'Hauler':
				useZone = 'LO';
				break;

			// Low Earth Orbit
			case 'Station':
				useZone = 'LE';
				break;

			// Middle Earth Orbit
			default:
				useZone = 'ME';
			}
		}
		if (useZone) {
			const zone = await axios.get(`${gameServer}init/initZones/code/${useZone}`);
			const zData = zone.data;

			if (zData.type) {
				SpaceSite.zone = zData._id;
			}
			else {
				++rCounts.loadErrCount;
				logger.error(`New Spacecraft Site Zone Assign is Invalid: ${sData.name} ${useZone}`);
				return;
			}
		}
		else {
			++rCounts.loadErrCount;
			logger.error(`New Spacecraft Site Zone Assign is Blank: ${sData.name}`);
			return;
		}
	}
	else {
		++rCounts.loadErrCount;
		logger.error(`New Spacecraft Site Blank Site Code: ${sData.name} ${sData.siteCode}`);
		return;
	}

	try {
		await axios.post(`${gameServer}api/sites`, SpaceSite);
		++rCounts.loadCount;
		logger.debug(`${SpaceSite.name} add saved to Spacecraft Site collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Spacecraft Site Save Error: ${err.message}`, { meta: err.stack });
	}
}


module.exports = runSpacecraftLoad;

/*


			spacecraft.facilities = [];

			if (loadError) {
				++rCounts.loadErrCount;
				logger.error(
					`Spacecraft skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
				);
				return;
			}
			else {
				try {
					const spacecraftSave = await spacecraft.save();
					++rCounts.loadCount;
					spacecraftDebugger(
						`${spacecraftSave.name} add saved to spacecraft collection.`
					);

					return;
				}
				catch (err) {
					++rCounts.loadErrCount;
					delFacilities(spacecraft.facilities);
					logger.error(`New Spacecraft Save Catch Error: ${err.message}`, {
						meta: err
					});
					return;
				}
			}
			*/