const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initTeams.json',
	'utf8'
);
const teamDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const express = require('express');
const bodyParser = require('body-parser');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runTeamLoad (runFlag) {
	try {
		if (!runFlag) return false;
		if (runFlag) await initLoad(runFlag);
		return true;
	}
	catch (err) {
		logger.error(`Catch runTeamLoad Error: ${err.message}`, { meta: err });
		return false;
	}
}

async function initLoad (doLoad) {
	if (!doLoad) return;

	// delete old data
	await deleteAllTeams();

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of teamDataIn) {
		if (data.loadType == 'team') {
			if (data.loadFlag == 'true') {
				++recReadCount;
				await loadTeam(data, recCounts);
			}
		}
	}

	logger.info(
		`Team Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);

	return;
}

async function loadTeam (tData, rCounts) {
	try {

		const { data } = await axios.get(`${gameServer}init/initTeams/teamCode/${tData.code}`);

		if (!data.teamType) {
			switch (tData.teamType) {
			case 'N':
				await newNational(tData, rCounts);
				break;
			case 'A':
				await newAlien(tData, rCounts);
				break;
			case 'C':
				await newControl(tData, rCounts);
				break;
			case 'P':
				await newNPC(tData, rCounts);
				break;
			case 'M':
				await newMedia(tData, rCounts);
				break;
			default:
				logger.error(`Invalid Team Type In : ${tData.teamType}`);
				++rCounts.loadErrCount;
			}
		}
		else {
		// Existing Team here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Team skipped as code already exists in database: ${tData.name} ${tData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		logger.error(`Catch Team Error: ${err.message}`, { meta: err });
		++rCounts.loadErrCount;
		return;
	}
}

async function deleteAllTeams () {

	try {
		let delErrorFlag = false;

		try {
			await axios.patch(`${gameServer}api/team/deleteAll`);
		}
		catch (err) {
			logger.error(`Catch deleteAllTeams Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Teams succesfully deleted. (teamLoad');
		}
		else {
			logger.error('Some Error In Teams delete all (teamLoad)');
		}
	}
	catch (err) {
		logger.error(`deleteAllTeams Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function newNational (tData, rCounts) {

	// New National Team here
	const NationalTeam = {
		teamCode: tData.code,
		name: tData.name,
		shortName: tData.shortName,
		teamType: tData.teamType,
		gameState: [],
		serviceRecord: [],
		trades: [],
		treaties: [],
		prTrack: tData.prTrack,
		roles: tData.roles,
		prLevel: tData.prLevel,
		agents: tData.agents
	};

	try {
		await axios.post(`${gameServer}api/team`, NationalTeam);
		++rCounts.loadCount;
		logger.debug(`${NationalTeam.name} add saved to National Team collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New National Team Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function newAlien (tData, rCounts) {

	const AlienTeam = {
		teamCode: tData.code,
		name: tData.name,
		shortName: tData.shortName,
		teamType: tData.teamType,
		gameState: [],
		serviceRecord: [],
		trades: [],
		treaties: [],
		prTrack: tData.prTrack,
		roles: tData.roles,
		prLevel: tData.prLevel,
		agents: tData.agents
	};

	try {
		await axios.post(`${gameServer}api/team`, AlienTeam);
		++rCounts.loadCount;
		logger.debug(`${AlienTeam.name} add saved to Alien Team collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Alien Team Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function newMedia (tData, rCounts) {
	const MediaTeam = {
		teamCode: tData.code,
		name: tData.name,
		shortName: tData.shortName,
		teamType: tData.teamType,
		gameState: [],
		serviceRecord: [],
		trades: [],
		treaties: [],
		prTrack: tData.prTrack,
		roles: tData.roles,
		prLevel: tData.prLevel,
		agents: tData.agents
	};

	try {
		await axios.post(`${gameServer}api/team`, MediaTeam);
		++rCounts.loadCount;
		logger.debug(`${MediaTeam.name} add saved to Media Team collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Media Team Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function newControl (tData, rCounts) {
	const ControlTeam = {
		teamCode: tData.code,
		name: tData.name,
		shortName: tData.shortName,
		teamType: tData.teamType,
		gameState: [],
		serviceRecord: [],
		trades: [],
		treaties: [],
		prTrack: tData.prTrack,
		roles: tData.roles,
		prLevel: tData.prLevel,
		agents: tData.agents
	};

	try {
		await axios.post(`${gameServer}api/team`, ControlTeam);
		++rCounts.loadCount;
		logger.debug(`${ControlTeam.name} add saved to Control Team collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Control Team Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function newNPC (tData, rCounts) {
	const NpcTeam = {
		teamCode: tData.code,
		name: tData.name,
		shortName: tData.shortName,
		teamType: tData.teamType,
		gameState: [],
		serviceRecord: [],
		trades: [],
		treaties: [],
		prTrack: tData.prTrack,
		roles: tData.roles,
		prLevel: tData.prLevel,
		agents: tData.agents
	};

	try {
		await axios.post(`${gameServer}api/team`, NpcTeam);
		++rCounts.loadCount;
		logger.debug(`${NpcTeam.name} add saved to NPC Team collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New NPC Team Save Error: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runTeamLoad;
