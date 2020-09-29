const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initCountry.json',
	'utf8'
);
const countryDataIn = JSON.parse(file);
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

async function runCountryLoad (runFlag) {
	if (!runFlag) return false;
	if (runFlag) await initLoad(runFlag);
	return true;
}

async function initLoad (doLoad) {
	if (!doLoad) return;

	// delete old data
	await deleteAllCountry();

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0, skipCount: 0 };

	for await (const data of countryDataIn) {
		if (data.loadType === 'country') {

			++recReadCount;
			await loadCountry(data, recCounts);
		}
	}
	logger.info(
		`Country Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Skipped: ${recCounts.skipCount}
                         Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);

	// cannot set borderedBy until all country records are loaded to get the ID
	let brecReadCount = 0;
	const brecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0, skipCount: 0 };
	for await (const bData of countryDataIn) {
		/*
    logger.debug(
      `jeff in 2nd loop ... country code ${bData.code} ... borderedBy ${bData.borderedBy}`);
    */
		++brecReadCount;
		await setBorderedBy(bData, brecCounts);
	}
	logger.info(
		`Country Load BorderedBy Counts Read: ${brecReadCount} Errors: ${brecCounts.loadErrCount} Skipped: ${brecCounts.skipCount}
                         Saved: ${brecCounts.loadCount} Updated: ${brecCounts.updCount}`
	);
}

async function loadCountry (cData, rCounts) {
	let loadName = '';

	try {
		// logger.debug("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);
		// console.log("Jeff here in loadCountry ... Code", cData.code, "name ", cData.name);

		if (cData.loadFlag === 'false') {
			++rCounts.skipCount;
			logger.info(
				`Country Skipped due to loadFlag false ${cData.code} ${cData.name}`
			);
			return; // don't load if flag is not true
		}

		loadName = cData.name;
		const { data } = await axios.get(`${gameServer}init/initCountries/code/${cData.code}`);

		if (!data.type) {
			// New Country here
			switch (cData.type) {
			case 'Ground':
				await newGround(cData, rCounts);
				break;

			case 'Space':
				await newSpace(cData, rCounts);
				break;

			default:
				logger.error(
					`Country save skipped due to invalid type: ${loadName} ${cData.type}`
				);
				++rCounts.loadErrCount;
				break;
			}

			return;
		}
		else {
		// Existing Country here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Country skipped as code already exists in database: ${loadName} ${cData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Country Error: ${err.message}`, { meta: err.stack });
		return;
	}
}

async function deleteAllCountry () {
	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/countries/deleteAll`);
		}
		catch (err) {
			logger.error(`Catch deleteAllCountry Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Countries succesfully deleted. (countryLoad');
		}
		else {
			logger.error('Some Error In Countrys delete (deleteAllCountry):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAllCountry Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function newGround (cData, rCounts) {

	const GroundCountry = {
		type: cData.type,
		code: cData.code,
		name: cData.name,
		unrest: cData.unrest,
		coastal: cData.coastal,
		formalName: cData.formalName,
		stats: cData.stats,
		gameState: [],
		serviceRecord: [],
		borderedBy_Ids: []
	};

	if (cData.formalName === '') {
		GroundCountry.formalName = GroundCountry.name;
	}

	let { data } = await axios.get(`${gameServer}init/initZones/code/${cData.zone}`);

	if (!data.type) {

		++rCounts.loadErrCount;
		logger.error(`New Ground Country Invalid Zone: ${cData.name} ${cData.zone}`);
		return;
	}
	else {
		GroundCountry.zone = data._id;
	}

	const team = await axios.get(`${gameServer}init/initTeams/teamCode/${cData.teamCode}`);
	data = team.data;

	if (!data.teamType) {

		++rCounts.loadErrCount;
		logger.error(`New Ground Country Invalid Team: ${cData.name} ${cData.teamCode}`);
		return;
	}
	else {
		GroundCountry.team = data._id;
	}

	try {
		await axios.post(`${gameServer}api/countries`, GroundCountry);
		++rCounts.loadCount;
		logger.debug(`${GroundCountry.name} add saved to Ground Country collection.`);

	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Ground Country Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function newSpace (cData, rCounts) {
	const SpaceCountry = {
		type: cData.type,
		code: cData.code,
		name: cData.name,
		unrest: cData.unrest,
		formalName: cData.formalName,
		stats: cData.stats,
		gameState: [],
		serviceRecord: []
	};

	if (cData.formalName === '') {
		SpaceCountry.formalName = SpaceCountry.name;
	}

	let { data } = await axios.get(`${gameServer}init/initZones/code/${cData.zone}`);

	if (!data.type) {

		++rCounts.loadErrCount;
		logger.error(`New Ground Country Invalid Zone: ${cData.name} ${cData.zone}`);
		return;
	}
	else {
		SpaceCountry.zone = data._id;
	}

	const team = await axios.get(`${gameServer}init/initTeams/teamCode/${cData.teamCode}`);
	data = team.data;

	if (!data.teamType) {

		++rCounts.loadErrCount;
		logger.error(`New Space Country Invalid Team: ${cData.name} ${cData.teamCode}`);
		return;
	}
	else {
		SpaceCountry.team = data._id;
	}

	try {
		await axios.post(`${gameServer}api/countries`, SpaceCountry);
		++rCounts.loadCount;
		logger.debug(`${SpaceCountry.name} add saved to Space Country collection.`);

	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Space Country Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function setBorderedBy (cData, rCounts) {
	// don't load if flag is not true
	if (cData.loadFlag === 'false') return;

	/*
  logger.debug(
    `jeff 1 in setBorderedBy ... country code ${cData.code} ... borderedBy ${cData.borderedBy}`
  );
  */

	try {
		const { data } = await axios.get(`${gameServer}init/initCountries/code/${cData.code}`);

		if (!data.type) {
			++rCounts.skipCount;
			logger.info(`Country Skipped not found for set borderedBy: ${cData.code}`);
			return;
		}

		if (data.type === 'Space') {
			logger.info(`Space Country Skipped in borderedBy set ${cData.code}`);
			++rCounts.skipCount;
			return;
		}

		const currCountryId = data._id;
		const currCountryName = data.name;
		const borderedBy_Ids = [];
		for (let j = 0; j < cData.borderedBy.length; ++j) {
			/*
      logger.debug(
        `jeff 2 in setBorderedBy ... country code ${cData.code} ... j ${j} borderedBy ${cData.borderedBy[j].code}`
      );
      */
			const bCountry = await axios.get(`${gameServer}init/initCountries/code/${cData.borderedBy[j].code}`);
			const bData = bCountry.data;

			if (!bData.type) {
				logger.error(
					`${cData.borderedBy[j].code} BorderedBy Country Not Found for Current Country 
					${currCountryName}`
				);
			}
			else {
				borderedBy_Ids.push(bData._id);
			}
		}

		/*
    logger.debug(
      `jeff 3 in setBorderedBy ... country code ${cData.code} ... length in borderedBy ${cData.borderedBy.length} ...
      length of _Ids ${borderedBy_Ids.length}  ... length of record ${country.borderedBy.length}`
    );
    */
		if (borderedBy_Ids.length > 0) {
			try {
				await axios.patch(`${gameServer}init/initCountries/borderedBy/${currCountryId}`, borderedBy_Ids);
				++rCounts.updCount;
				// logger.debug(`${loadName} update saved to country collection.`);
				return;
			}
			catch (err) {
				++rCounts.loadErrCount;
				logger.error(`Country borderedBy Update Save Error for ${currCountryName}: ${err.message}`, {
					meta: err.stack
				});
				return;
			}
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch setBorderedBy Error 1: ${err.message}`, {
			meta: err.stack
		});
	}
}

module.exports = runCountryLoad;
