const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initBaseFacility.json',
	'utf8'
);
const baseDataIn = JSON.parse(file);
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
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
		logger.error(`Catch runfacilityLoad Error: ${err.message}`, {
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
		`facility Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
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
				coastal: iData.coastal,
				type: iData.type,
				serviceRecord: [],
				baseDefenses: iData.baseDefenses,
				public: iData.public,
				capability: iData.capability
			};

			// John's additional settings
			const {
				research,
				airMission,
				storage,
				manufacturing,
				naval,
				ground
			} = newFacility.capability;

			if (research) {
				research.status.damage = [];
				research.status.pending = [];
				research.funding = [];
				if (research.capacity > 0) {
					for (let i = 0; i < research.capacity; i++) {
						research.status.damage.push(false);
						research.funding.push(0);

						research.status.pending.push(false);
					}

					research.active = true;

					research.sciRate = Math.floor(Math.random() * 26);

					research.sciBonus = 0;
				}
				else {
					research.capacity = 0;
					research.active = false;
					research.sciBonus = 0;
					research.sciRate = 0;
					research.projects = [];
				}
			}

			if (airMission) {
				if (airMission.capacity > 0) {
					airMission.active = true;
				}
				else {
					airMission.active = false;
					airMission.capacity = 0;
					airMission.aircraft = [];
					airMission.damage = [];
				}
			}

			if (storage) {
				if (storage.capacity > 0) {
					storage.active = true;
				}
				else {
					storage.active = false;
					storage.capacity = 0;
					storage.equipment = [];
					storage.damage = [];
				}
			}

			if (manufacturing) {
				if (manufacturing.capacity > 0) {
					manufacturing.active = true;
				}
				else {
					manufacturing.active = false;
					manufacturing.capacity = 0;
					manufacturing.equipment = [];
					manufacturing.damage = [];
				}
			}

			if (naval) {
				if (naval.capacity > 0) {
					naval.active = true;
				}
				else {
					naval.active = false;
					naval.capacity = 0;
					naval.fleet = [];
					naval.damage = [];
				}
			}

			if (ground) {
				if (ground.capacity > 0) {
					ground.active = true;
				}
				else {
					ground.active = false;
					ground.capacity = 0;
					ground.corps = [];
					ground.damage = [];
				}
			}

			// end of John's additional settings


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

				try {
					await axios.post(`${gameServer}api/facilities`, newFacility);
					++rCounts.loadCount;
					logger.debug(`${newFacility.name} add saved to Base Facility collection.`);

					return;
				}
				catch (err) {
					logger.error(`New Facility Save Error: ${err.message}`, {
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
			// all facilities not just bases
			// TODO: limit to just base type (?)
			await axios.patch(`${gameServer}api/facilities/deleteAll`);
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
