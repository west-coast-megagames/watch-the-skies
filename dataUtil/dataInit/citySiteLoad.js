const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initCitySite.json',
	'utf8'
);
const cityDataIn = JSON.parse(file);
const { convertToDms } = require('../systems/geo');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const teamArray = [];

async function runcitySiteLoad(runFlag) {
	try {
		if (!runFlag) return false;
		if (runFlag) {
			await loadTeams(); // get all teams once
			await deleteAllCitys(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runcitySiteLoad Error: ${err.message}`, { meta: err });

		return false;
	}
}

async function loadTeams() {
	const team = await axios.get(`${gameServer}api/team/type/National`);
	const tData = team.data;

	for await (const teams of tData) {
		teamArray.push({ _id: teams._id, name: teams.name });
	}
	logger.debug(`Number of National Teams Loaded: ${teamArray.length}`);
}

async function initLoad(doLoad) {
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of cityDataIn) {
		++recReadCount;
		await loadCity(data, recCounts);
	}

	logger.info(
		`City Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadCity(iData, rCounts) {
	try {

		const { data } = await axios.get(`${gameServer}init/initSites/code/${iData.code}`);

		if (!data.type) {
			switch (iData.subType) {
			case 'City':
				await newCity(iData, rCounts);
				break;

			default:
				logger.error(`Invalid City SubType In : ${iData.subType}`);
				++rCounts.loadErrCount;
			}
		}
		else {
			// Existing City here ... no longer doing updates so this is now counted as an error
			logger.error(
				`City skipped as code already exists in database: ${iData.name} ${iData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch City Error: ${err.message}`, { meta: err });

		return;
	}
}

async function deleteAllCitys() {
	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/sites/deleteAllCity/`);
		}
		catch (err) {
			logger.error(`Catch deleteAllCitys Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Citys succesfully deleted. (citySiteLoad');
		}
		else {
			logger.error('Some Error In Citys delete (deleteAllCitys):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAllCitys Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function newCity(cData, rCounts) {

	// New City(ground) Site here
	const newLatDMS = convertToDms(cData.lat, false);
	const newLongDMS = convertToDms(cData.lng, true);

	const CitySite = cData;
	CitySite.type = 'Ground';
	CitySite.geoDMS = {
		latDMS: newLatDMS,
		lngDMS: newLongDMS
	};
	CitySite.geoDecimal = {
		lat: cData.lat,
		lng: cData.lng
	};
	CitySite.serviceRecord = [];
	CitySite.tags = [];
	CitySite.status = [];

	if (cData.coastal) {
		CitySite.tags.push('coastal');
	}
	if (cData.capital) {
		CitySite.tags.push('capital');
	}

	const team = await axios.get(`${gameServer}init/initTeams/code/${cData.teamCode}`);
	const tData = team.data;

	if (!tData.type) {

		++rCounts.loadErrCount;
		logger.error(`New City Site Invalid Team: ${cData.name} ${cData.teamCode}`);
		return;
	}
	else {
		CitySite.team = tData._id;
	}

	const organization = await axios.get(`${gameServer}init/initOrganizations/code/${cData.organizationCode}`);
	const organizationData = organization.data;

	if (!organizationData.type) {

		++rCounts.loadErrCount;
		logger.error(`New City Site Invalid Organization: ${cData.name} ${cData.organizationCode}`);
		return;
	}
	else {
		CitySite.organization = organizationData._id;
		CitySite.zone = organizationData.zone;
	}

	CitySite.favor = [];
	// set favor for each national team
	let rand = 0;
	for (let j = 0; j < teamArray.length; ++j) {
		rand = Math.floor(Math.random() * 25);
		rand = Math.max(rand, 0); // don't go negative
		CitySite.favor.push({ team: { _id: teamArray[j]._id, name: teamArray[j].name }, favor: rand, status: '' });
	}

	try {
		await axios.post(`${gameServer}api/sites`, CitySite);
		++rCounts.loadCount;
		logger.debug(`${CitySite.name} add saved to City Site collection.`);
		if (cData.capital) {
			await axios.patch(`${gameServer}api/organizations/setCapital/${CitySite.organization}`);
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New City Site Save Error: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runcitySiteLoad;
