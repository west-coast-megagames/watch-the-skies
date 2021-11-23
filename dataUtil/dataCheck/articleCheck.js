const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

async function chkArticle(runFlag) {

	let aFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initArticles/lean`);
		aFinds = data;
	}
	catch(err) {
		logger.error(`Article Get Lean Error (articleCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const article of aFinds) {


		if (!Object.prototype.hasOwnProperty.call(article, 'model')) {
			logger.error(
				`model missing for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'date')) {
			logger.error(
				`date missing for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'timestamp')) {
			logger.error(
				`timestamp missing for Article ${article.headline} ${article._id}`
			);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(article.timestamp, 'turn')) {
				logger.error(
					`turn timestamp missing for Article ${article.headline} ${article._id}`
				);
			}

			if (!Object.prototype.hasOwnProperty.call(article.timestamp, 'phase')) {
				logger.error(
					`phase timestamp missing for Article ${article.headline} ${article._id}`
				);
			}

			if (!Object.prototype.hasOwnProperty.call(article.timestamp, 'turnNum')) {
				logger.error(
					`turnNum timestamp missing for Article ${article.headline} ${article._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(article.timestamp, 'clock')) {
				logger.error(
					`clock timestamp missing for Article ${article.headline} ${article._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'dateline')) {
			logger.error(
				`dateline missing for Article ${article.headline} ${article._id}`
			);
		}
		else if (
			article.dateline === '' ||
        article.dateline == undefined ||
        article.dateline == null
		) {
			logger.error(
				`dateline is blank for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'headline')) {
			logger.error(
				`headline missing for Article ${article.headline} ${article._id}`
			);
		}
		else if (
			article.headline === '' ||
        article.headline == undefined ||
        article.headline == null
		) {
			logger.error(
				`headline is blank for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'body')) {
			logger.error(
				`body missing for Article ${article.headline} ${article._id}`
			);
		}
		else if (
			article.body === '' ||
        article.body == undefined ||
        article.body == null
		) {
			logger.error(
				`body is blank for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'tags')) {
			logger.error(
				`tags missing for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'imageSrc')) {
			logger.error(
				`imageSrc missing for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'agency')) {
			logger.error(
				`agency missing for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'publisher')) {
			logger.error(
				`Publisher Field missing for Article ${article.headline} ${article._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(article, 'location')) {
			logger.error(
				`Location Field missing for Article ${article.headline} ${article._id}`
			);
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initArticles/validate/${article._id}`);
			if (!valMessage.data.headline) {
				logger.error(`Article Validation Error: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Article Validation Error For ${article.headline} ${article.agency} Error: ${err.message}`
			);
		}
	}
	runFlag = true;
	return runFlag;
}

module.exports = chkArticle;
