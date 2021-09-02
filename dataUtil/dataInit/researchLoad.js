const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initResearch.json',
	'utf8'
);
const researchDataIn = JSON.parse(file);
// const mongoose = require('mongoose');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const teamArray = [];

async function runResearchLoad(runFlag) {
	try {
		if (!runFlag) return false;
		if (runFlag) {
			await loadTeams(); // get all teams once

			await deleteAllResearchs(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`runResearchLoad Catch Error ${err.message}`, { meta: err });
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
	// logger.debug("Jeff in initLoad", doLoad, researchDataIn.length);
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of researchDataIn) {
		++recReadCount;
		await loadResearch(data, recCounts);
	}

	logger.info(
		`Research Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadResearch(iData, rCounts) {
	try {

		const { data } = await axios.get(`${gameServer}init/initResearch/code/${iData.code}`);

		if (!data.type) {
			switch (iData.type) {
			case 'Knowledge':
				await createKnowledge(iData, rCounts);
				break;

			case 'Analysis':
				await createAnalysis(iData, rCounts);
				break;

			case 'Technology':
				if (iData.teamCode === 'All') {
					for (let j = 0; j < teamArray.length; ++j) {
						await createTechnology(iData, teamArray[j], rCounts);
					}
				}
				else {
					const tData = await axios.get(`${gameServer}init/initTeams/code/${iData.teamCode}`);
					const team = tData.data;
					if (!team) {
						logger.error = `Research Load Team Error, New Technology: ${iData.name} Team: ${iData.teamCode} `;
					}
					else {
						await createTechnology(iData, team._id, rCounts);
					}
				}

				break;

			default:
				logger.error(`Invalid Research Type In : ${iData.subType}`);
				++rCounts.loadErrCount;
			}
		}
		else {
			// Existing Research here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Research skipped as code already exists in database: ${iData.name} ${iData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Research Error: ${err.message}`, { meta: err });

		return;
	}
}

async function deleteAllResearchs(doLoad) {
	if (!doLoad) return;

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/research/deleteAll/`);
		}
		catch (err) {
			logger.error(`Catch deleteAll Researcj Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Research succesfully deleted. (researchLoad');
		}
		else {
			logger.error('Some Error In Research delete (deleteAll  researchLoad):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAll Research Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function createTechnology(iData, teamId, rCounts) {
	// New Tech Research here
	const techResearch = iData;
	techResearch.team = teamId;
	techResearch.researchHistory = [];

	try {
		await axios.post(`${gameServer}api/research`, techResearch);
		++rCounts.loadCount;
		logger.debug(`${techResearch.name} ${iData.teamCode} add saved to Technology Research collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Technology Research Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function createKnowledge(iData, rCounts) {
	// New Knowledge Research here
	const knowledgeResearch = iData;

	const teamCode = iData.credit;
	if (iData.credit != '') {
		const tData = await axios.get(`${gameServer}init/initTeams/code/${iData.credit}`);
		const team = tData.data;
		if (!team) {
			logger.error(
				`Knowledge Research Load Credit Team Error, New Research: ${iData.name}, Credit Team: ${teamCode}`
			);
		}
		else {
			knowledgeResearch.credit = team._id;
			logger.info(
				`Knowledge Research Load Credit Team Found, New Research: ${iData.name}, Credit Team: ${teamCode}`
			);
		}
	}

	knowledgeResearch.teamProgress = [];
	// set teamProgress for each national team
	let rand = 0;
	for (let j = 0; j < teamArray.length; ++j) {
		rand = Math.floor(Math.random() * 2);
		rand = Math.max(rand, 0); // don't go negative
		knowledgeResearch.teamProgress.push({ team: teamArray[j], progress: rand });

	}

	try {
		await axios.post(`${gameServer}api/research`, knowledgeResearch);
		++rCounts.loadCount;
		logger.debug(`${knowledgeResearch.name} ${iData.teamCode} add saved to Knowledge Research collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Knowledge Research Save Error: ${err.message}`, { meta: err.stack });
	}

}

async function createAnalysis(iData, rCounts) {
	// New Analysis Research here
	const analysisResearch = iData;
	analysisResearch.salvage = [];

	if (iData.teamCode != '') {
		const tData = await axios.get(`${gameServer}init/initTeams/code/${iData.teamCode}`);
		const team = tData.data;
		if (!team) {
			logger.error(
				`Analysis Research Load Team Error, New Research: ${iData.name}, Team: ${iData.teamCode}`
			);
		}
		else {
			analysisResearch.team = team._id;
			logger.info(
				`Analysis Research Load Team Found, New Research: ${iData.name}, Team: ${iData.teamCode}`
			);
		}
	}

	try {
		await axios.post(`${gameServer}api/research`, analysisResearch);
		++rCounts.loadCount;
		logger.debug(`${analysisResearch.name} ${iData.teamCode} add saved to Analysis Research collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Analysis Research Save Error: ${err.message}`, { meta: err.stack });
	}

}

module.exports = runResearchLoad;
