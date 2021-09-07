const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initOrganization.json',
	'utf8'
);
const organizationDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function runOrganizationLoad(runFlag) {
	if (!runFlag) return false;
	if (runFlag) await initLoad(runFlag);
	return true;
}

async function initLoad(doLoad) {
	if (!doLoad) return;

	// delete old data
	await deleteAllOrganization();

	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0, skipCount: 0 };

	for await (const data of organizationDataIn) {
		if (data.loadType === 'organization') {

			++recReadCount;
			await loadOrganization(data, recCounts);
		}
	}
	logger.info(
		`Organization Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Skipped: ${recCounts.skipCount}
                         Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);

	// cannot set borderedBy until all organization records are loaded to get the ID
	let brecReadCount = 0;
	const brecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0, skipCount: 0 };
	for await (const bData of organizationDataIn) {
		++brecReadCount;
		await setBorderedBy(bData, brecCounts);
	}
	logger.info(
		`Organization Load BorderedBy Counts Read: ${brecReadCount} Errors: ${brecCounts.loadErrCount} Skipped: ${brecCounts.skipCount}
                         Saved: ${brecCounts.loadCount} Updated: ${brecCounts.updCount}`
	);
}

async function loadOrganization(cData, rCounts) {
	let loadName = '';

	try {
		// logger.debug("Jeff here in loadOrganization ... Code", cData.code, "name ", cData.name);
		// console.log("Jeff here in loadOrganization ... Code", cData.code, "name ", cData.name);

		if (cData.loadFlag === 'false') {
			++rCounts.skipCount;
			logger.info(
				`Organization Skipped due to loadFlag false ${cData.code} ${cData.name}`
			);
			return; // don't load if flag is not true
		}

		loadName = cData.name;
		const { data } = await axios.get(`${gameServer}init/initOrganizations/code/${cData.code}`);

		if (!data.type) {
			const NewOrganization = {
				type: cData.type,
				code: cData.code,
				name: cData.name,
				unrest: cData.unrest,
				tags: [],
				formalName: cData.formalName,
				stats: cData.stats,
				serviceRecord: [],
				borderedBy_Ids: []
			};

			if (cData.coastal) {
				NewOrganization.tags.push('coastal');
			}
			if (cData.formalName === '') {
				NewOrganization.formalName = NewOrganization.name;
			}

			// make sure space settings are correct
			if (NewOrganization.type === 'Space') {
				NewOrganization.tags = [];
				NewOrganization.borderedBy = [];
				NewOrganization.capital = undefined;
			}

			const zone = await axios.get(`${gameServer}init/initZones/code/${cData.zone}`);
			const zData = zone.data;

			if (!zData.type) {

				++rCounts.loadErrCount;
				logger.error(`New Organization Invalid Zone: ${cData.name} ${cData.zone}`);
				return;
			}
			else {
				NewOrganization.zone = zData._id;
			}

			const team = await axios.get(`${gameServer}init/initTeams/code/${cData.teamCode}`);
			const tData = team.data;

			if (!tData.type) {

				++rCounts.loadErrCount;
				logger.error(`New Organization Invalid Team: ${cData.name} ${cData.teamCode}`);
				return;
			}
			else {
				NewOrganization.team = tData._id;
			}

			try {
				await axios.post(`${gameServer}api/organizations`, NewOrganization);
				++rCounts.loadCount;
				logger.debug(`${NewOrganization.name} add saved to Organization collection.`);
			}
			catch (err) {
				++rCounts.loadErrCount;
				logger.error(`Organization Save Error: ${err.message}`, { meta: err.stack });
			}

			return;
		}
		else {
		// Existing Organization here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Organization skipped as code already exists in database: ${loadName} ${cData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Organization Error: ${err.message}`, { meta: err.stack });
		return;
	}
}

async function deleteAllOrganization() {
	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/organizations/deleteAll`);
		}
		catch (err) {
			logger.error(`Catch deleteAllOrganization Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Organizations succesfully deleted. (organizationLoad');
		}
		else {
			logger.error('Some Error In Organizations delete (deleteAllOrganization):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAllOrganization Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function setBorderedBy(cData, rCounts) {
	// don't load if flag is not true
	/*
  logger.debug(
    `jeff 1 in setBorderedBy ... organization code ${cData.code} ... borderedBy ${cData.borderedBy}`
  );
  */

	try {
		if (cData.loadFlag === 'false') {
			logger.info(`Organization Skipped in borderedBy set loadFlag False ${cData.code}`);
			++rCounts.skipCount;
			return;
		}

		const { data } = await axios.get(`${gameServer}init/initOrganizations/code/${cData.code}`);

		if (!data.type) {
			++rCounts.skipCount;
			logger.info(`Organization Skipped not found for set borderedBy: ${cData.code}`);
			return;
		}

		if (data.type === 'Space') {
			logger.info(`Space Organization Skipped in borderedBy set ${cData.code}`);
			++rCounts.skipCount;
			return;
		}

		if (cData.borderedBy.length < 1) {
			logger.info(`Organization Skipped in borderedBy set array is empty ${cData.code}`);
			++rCounts.skipCount;
			return;
		}

		const currOrganizationId = data._id;
		const currOrganizationName = data.name;
		const borderedBy_Ids = [];
		for (let j = 0; j < cData.borderedBy.length; ++j) {
			/*
      logger.debug(
        `jeff 2 in setBorderedBy ... organization code ${cData.code} ... j ${j} borderedBy ${cData.borderedBy[j].code}`
      );
      */
			const bOrganization = await axios.get(`${gameServer}init/initOrganizations/code/${cData.borderedBy[j].code}`);
			const bData = bOrganization.data;

			if (!bData.type) {
				logger.error(
					`${cData.borderedBy[j].code} BorderedBy Organization Not Found for Current Organization 
					${currOrganizationName}`
				);
			}
			else {
				borderedBy_Ids.push(bData._id);
			}
		}

		/*
    logger.debug(
      `jeff 3 in setBorderedBy ... organization code ${cData.code} ... length in borderedBy ${cData.borderedBy.length} ...
      length of _Ids ${borderedBy_Ids.length}  ... length of record ${organization.borderedBy.length}`
    );
    */
		if (borderedBy_Ids.length > 0) {
			try {
				await axios.patch(`${gameServer}init/initOrganizations/borderedBy/${currOrganizationId}`, borderedBy_Ids);
				++rCounts.updCount;
				// logger.debug(`${loadName} update saved to organization collection.`);
				return;
			}
			catch (err) {
				++rCounts.loadErrCount;
				logger.error(`Organization borderedBy Update Save Error for ${currOrganizationName}: ${err.message}`, {
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

module.exports = runOrganizationLoad;
