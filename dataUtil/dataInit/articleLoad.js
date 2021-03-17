const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initArticle.json',
	'utf8'
);
const articleDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function runArticleLoad (runFlag) {
	try {
		if (!runFlag) return false;
		if (runFlag) {
			await deleteAllArticles(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runArticleLoad Error: ${err.message}`, { meta: err });
		return false;
	}
}

async function initLoad (doLoad) {
	if (!doLoad) return;

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of articleDataIn) {
		++recReadCount;
		await loadArticle(data, recCounts);
	}
	logger.info(
		`Article Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadArticle (iData, rCounts) {
	try {
		// there is no article key field or updates ... just new ones
		// New Article/Article here
		const newArticle = {
			timestamp: iData.timestamp,
			headline: iData.headline,
			body: iData.articleBody,
			likes: iData.likes,
			tags: iData.tags,
			imageSrc: iData.imageSrc,
			date: Date.now(),
			agency: iData.publisher
		};
		newArticle.gameState = [];

		if (iData.publisher != '') {
			const team = await axios.get(`${gameServer}init/initTeams/code/${iData.publisher}`);
			const tData = team.data;

			if (!tData.type) {

				++rCounts.loadErrCount;
				logger.error(`New Article Invalid Team: ${iData.headline} ${iData.publisher}`);
				return;
			}
			else {
				newArticle.publisher = tData._id;
			}
		}
		else {
			newArticle.publisher = undefined;
		}

		if (iData.location != '') {
			const site = await axios.get(`${gameServer}init/initSites/code/${iData.location}`);
			const sData = site.data;

			if (!sData.type) {
				++rCounts.loadErrCount;
				logger.error(`New Article has Invalid Location/Site: ${iData.headline} ${iData.location}`);
				return;
			}
			else {
				newArticle.location = sData._id;
				newArticle.dateline = sData.dateline;
			}
		}
		else {
			newArticle.location = undefined;
			newArticle.dateline = undefined;
		}

		try {
			await axios.post(`${gameServer}api/articles`, newArticle);
			++rCounts.loadCount;
			logger.debug(`${newArticle.headline} add saved to Article collection.`);
		}
		catch (err) {
			++rCounts.loadErrCount;
			logger.error(`New Article Save Error: ${err.message}`, { meta: err.stack });
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Article Error: ${err.message}`, { meta: err });
		return;
	}
}

async function deleteAllArticles (doLoad) {
	if (!doLoad) return;

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/articles/deleteAll/`);
		}
		catch (err) {
			logger.error(`Catch deleteAll Articles Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Articles succesfully deleted. (articleLoad');
		}
		else {
			logger.error('Some Error In Article delete (deleteAll articleLoad):');
		}
	}
	catch (err) {
		logger.error(`Delete All Articles Catch Error 2: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runArticleLoad;
