const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initBaseFacility.json',
	'utf8'
);
const baseDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
const { addArrayValue } = require('../middleware/util/arrayCalls');
require('winston-mongodb');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function runfacilityLoad(runFlag) {
	try {
		// logger.debug("Jeff in runfacilityLoad", runFlag);
		if (!runFlag) return false;
		if (runFlag) {
			await deleteAllBases();
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch Base runfacilityLoad Error: ${err.message}`, {
			meta: err
		});

		return false;
	}
}

async function initLoad(doLoad) {
	if (!doLoad) return;
	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of baseDataIn) {
		if (data.loadType === 'baseFacility') {
			++recReadCount;

			await loadBase(data, recCounts);
		}
	}

	logger.info(
		`Base Facility Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadBase(iData, rCounts) {
	let loadName = '';

	try {

		loadName = iData.name;
		const { data } = await axios.get(`${gameServer}init/initFacilities/code/${iData.code}`);

		if (!data.type) {
			// New Base here
			const newFacility = {
				name: iData.name,
				code: iData.code,
				type: iData.type,
				serviceRecord: [],
				buildings: [],
				tags: [],
				status: []
			};

			if (iData.coastal) {
				newFacility.tags.push('coastal');
			}

			if (iData.teamCode != '') {
				const team = await axios.get(`${gameServer}init/initTeams/code/${iData.teamCode}`);
				const tData = team.data;

				if (!tData.type) {

					++rCounts.loadErrCount;
					logger.error(`New Base Facility Invalid Team: ${iData.name} ${iData.teamCode}`);
					return;
				}
				else {
					newFacility.team = tData._id;
				}
			}

			if (iData.siteCode != '') {
				const site = await axios.get(`${gameServer}init/initSites/code/${iData.siteCode}`);
				const sData = site.data;

				if (!sData.type) {

					++rCounts.loadErrCount;
					logger.error(`New Base Facility has Invalid Site: ${iData.name} ${iData.siteCode}`);
					return;
				}
				else {
					newFacility.site = sData._id;
				}

				newFacility.capabilities = [];
	      // find buildings from blueprint code
				const blueprint = await axios.get(`${gameServer}init/initBlueprints/code/${iData.bpCode}`);
				const bpData = blueprint.data;
			
				if (!bpData.desc) {
					++rCounts.loadErrCount;
					logger.error(`New Base Facility Invalid Blueprint: ${iData.name} ${iData.bpCode}`);
					return;
				} else {
					for (const blds of bpData.buildings) {
						const bldBlueprint = await axios.get(`${gameServer}init/initBlueprints/code/${blds}`);
						const bldBpData = bldBlueprint.data;
						if (!bldBpData.desc) {
							++rCounts.loadErrCount;
							logger.error(`New Base Facility Invalid Building Blueprint: ${iData.name} ${iData.bpCode} {$blds}`);
							return;
					  } else {
							  const bldObj = { "type": bldBpData.type, "stats": bldBpData.stats, "damaged": false };
							  newFacility.buildings.push(bldObj);	
								await addArrayValue(newFacility.capabilities, bldBpData.type);
						}
					}
	      }

				try {
					await axios.post(`${gameServer}api/facilities`, newFacility);
					++rCounts.loadCount;
					logger.debug(`${newFacility.name} add saved to Base Facility collection.`);

					return;
				}
				catch (err) {
					logger.error(`New Base Facility Save Error: ${err.message}`, {
						meta: err.stack
					});

					++rCounts.loadErrCount;
					return;
				}
			}
		}
		else {
			// Existing Base Facility here ... no longer doing updates so this is now counted as an error
			logger.error(
				`Base Facility skipped as code already exists in database: ${loadName} ${iData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		logger.error(`Catch Base Error: ${err.message}`, { meta: err });

		++rCounts.loadErrCount;
		return;
	}
}

async function deleteAllBases() {
	// logger.debug("Jeff in deleteAllFacilitys", doLoad);

	try {
		let delErrorFlag = false;
		try {
			await axios.patch(`${gameServer}api/facilities/deleteAllBases`);
		}
		catch (err) {
			logger.error(`Catch deleteAllBases Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Facilities (Bases) succesfully deleted. (baseFacilityLoad');
		}
		else {
			logger.error('Some Error In Facilities (Bases) delete (deleteAllBases):');
		}
	}
	catch (err) {
		logger.error(`Catch deleteAllBases Error 2: ${err.message}`, { meta: err.stack });
	}
}


module.exports = runfacilityLoad;
