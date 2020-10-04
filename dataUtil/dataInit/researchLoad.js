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
const bodyParser = require('body-parser');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const teamArray = [];

async function runResearchLoad (runFlag) {
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

async function loadTeams () {
	const team = await axios.get(`${gameServer}api/team/type/N`);
	const tData = team.data;

	for await (const teams of tData) {
		teamArray.push({ _id: teams._id, name: teams.name });
	}
	logger.debug(`Number of National Teams Loaded: ${teamArray.length}`);
}

async function initLoad (doLoad) {
	// logger.debug("Jeff in initLoad", doLoad, researchDataIn.length);
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for (const data of researchDataIn) {
		++recReadCount;
		await loadResearch(data, recCounts);
	}

	logger.info(
		`Research Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadResearch (iData, rCounts) {
	try {
		const research = await Research.findOne({ name: iData.name });
		if (!research) {
			switch (iData.type) {
			case 'Technology':
				if (iData.teamCode === 'All') {
					for (let j = 0; j < teamArray.length; ++j) {
						await createTechnology(iData, teamArray[j], rCounts);
					}
				}
				else {
					const team = Team.find({ teamCode: iData.teamCode });
					if (team) {
						await createTechnology(iData, team._id, rCounts);
					}
				}
				break;

			case 'Knowledge':
				await createKnowledge(iData, rCounts);
				break;

			default:
				++rCounts.loadErrCount;
				logger.error(
					`Invalid Research Load Type: ${iData.type} name: ${iData.name}`
				);
			}
		}
		else {
			// no updates here
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Research Catch Error ${err.message}`, { meta: err });
		return;
	}
}

async function deleteAllResearchs (doLoad) {
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

async function createTechnology (iData, teamId, rCounts) {
	const loadError = false;
	const loadErrorMsg = '';
	let loadName = '';
	// New Tech Research here
	const techResearch = new TechResearch({
		name: iData.name,
		code: iData.code,
		level: iData.level,
		field: iData.field,
		progress: iData.progress,
		desc: iData.desc,
		team: teamId
	});

	loadName = iData.name;
	techResearch.prereq = iData.prereq;
	techResearch.unlocks = iData.unlocks;
	techResearch.breakthrough = iData.breakthrough;
	techResearch.theoretical = iData.theoretical;
	techResearch.gameState = [];

	/*
  let { error } = validateResearch(techResearch);
  if (error) {
    loadError = true;
    loadErrorMsg = "Validation Error: " + error.message;
  }
  */

	if (loadError) {
		logger.error(
			`Technology Research skipped due to errors: ${loadName} ${loadErrorMsg}`
		);
		++rCounts.loadErrCount;
		return;
	}
	else {
		try {
			const techResearchSave = await techResearch.save();

			++rCounts.loadCount;
			logger.info(
				`${techResearchSave.name} add saved to research collection for team id ${teamId}`
			);
		}
		catch (err) {
			++rCounts.loadErrCount;
			logger.error(`New Tech Research Save Error ${err.message}`, {
				meta: err
			});
			return;
		}
	}
}

async function createKnowledge (iData, rCounts) {
	const loadError = false;
	const loadErrorMsg = '';
	let loadName = '';

	// New Knowledge Research here
	const knowledgeResearch = new KnowledgeResearch({
		name: iData.name,
		code: iData.code,
		level: iData.level,
		field: iData.field,
		progress: iData.progress,
		desc: iData.desc
	});

	loadName = iData.name;
	knowledgeResearch.prereq = iData.prereq;
	knowledgeResearch.unlocks = iData.unlocks;
	knowledgeResearch.breakthrough = iData.breakthrough;
	knowledgeResearch.gameState = [];

	if (iData.credit != '') {
		const team = await Team.findOne({ teamCode: iData.credit });
		if (!team) {
			logger.error(
				`Knowledge Research Load Credit Team Error, New Research: ${iData.name}, Credit Team: ${iData.credit}`
			);
		}
		else {
			knowledgeResearch.credit = team._id;
			logger.info(
				`Knowledge Research Load Credit Team Found, New Research: ${iData.name}, Credit Team: ${iData.credit}`
			);
		}
	}

	knowledgeResearch.teamProgress = [];
	// set teamProgress for each national team
	for (let j = 0; j < teamArray.length; ++j) {
		rand = Math.floor(Math.random() * 2);
		rand = Math.max(rand, 0); // don't go negative
		knowledgeResearch.teamProgress.push({ team: teamArray[j], progress: rand });
	}

	/*
  let { error } = validateResearch(corps);
  if (error) {
    loadError = true;
    loadErrorMsg = "Validation Error: " + error.message;
  }
  */

	if (loadError) {
		logger.error(
			`Knowledge Research skipped due to errors: ${loadName} ${loadErrorMsg}`
		);
		++rCounts.loadErrCount;
		return;
	}
	else {
		try {
			const knowledgeResearchSave = await knowledgeResearch.save();

			++rCounts.loadCount;
			logger.info(
				`${knowledgeResearchSave.name} add saved to research collection`
			);
		}
		catch (err) {
			++rCounts.loadErrCount;
			logger.error(`New Knowledge Research Save Error ${err.message}`, {
				meta: err
			});
			return;
		}
	}
}

module.exports = runResearchLoad;
