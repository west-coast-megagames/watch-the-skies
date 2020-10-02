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
const bodyParser = require('body-parser');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runfacilityLoad (runFlag) {
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

async function initLoad (doLoad) {
	if (!doLoad) return;
	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for (const data of baseDataIn) {
		if (data.loadType === 'baseFacility') {
			++recReadCount;

			await loadBase(data, recCounts);
		}
	}

	logger.info(
		`facility Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadBase (iData, rCounts) {
	let loadName = '';

	try {
		const facility = await Facility.findOne({ code: iData.code });

		loadName = iData.name;
		loadCode = iData.code;

		if (!facility) {
			// New Base here
			const facility = new Facility({
				name: iData.name,
				code: iData.code,
				siteCode: iData.siteCode,
				coastal: iData.coastal,
				type: iData.type
			});

			facility.serviceRecord = [];
			facility.gameState = [];

			const { error } = validateFacility(facility);
			if (error) {
				// logger.debug("New Facility Validate Error", iData.name, error.message);
				loadError = true;
				loadErrorMsg = 'Validation Error: ' + error.message;
				// return;
			}
			facility.baseDefenses = iData.baseDefenses;
			facility.public = iData.public;

			if (iData.teamCode != '') {
				const team = await Team.findOne({ teamCode: iData.teamCode });
				if (!team) {
					// logger.debug("Facility Load Team Error, New Base:", iData.name, " Team: ", iData.teamCode);
					loadError = true;
					loadErrorMsg = 'Team Not Found: ' + iData.teamCode;
				}
				else {
					facility.team = team._id;
					// logger.debug("Facility Load Team Found, Base:", iData.name, " Team: ", iData.countryCode, "Team ID:", team._id);
				}
			}

			if (iData.countryCode != '') {
				const country = await Country.findOne({ code: iData.countryCode });
				if (!country) {
					// logger.debug("Facility Load Country Error, New Base:", iData.name, " Country: ", iData.countryCode);
					loadError = true;
					loadErrorMsg = 'Country Not Found: ' + iData.countryCode;
				}
				else {
					facility.country = country._id;
					facility.zone = country.zone;
					// logger.debug("Facility Load Country Found, New Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
				}
			}

			if (iData.siteCode != '') {
				const site = await Site.findOne({ siteCode: iData.siteCode });
				if (!site) {
					// logger.debug("Spacecraft Load Site Error, New Spacecraft:", iData.name, " Site: ", iData.siteCode);
					loadError = true;
					loadErrorMsg = 'Site Not Found: ' + iData.siteCode;
				}
				else {
					facility.site = site._id;
					facility.zone = site.zone;
					// logger.debug("Spacecraft Load Site Found, New Spacecraft:", iData.name, " Site: ", iData.siteCode, "Site ID:", site._id);
				}
			}

			facility.capability = {};
			facility.capability = iData.capability;

			// John's additional settings
			const {
				research,
				airMission,
				storage,
				manufacturing,
				naval,
				ground
			} = facility.capability;

			research.status.damage = [];
			research.status.pending = [];
			research.funding = [];
			if (research.capacity > 0) {
				for (let i = 0; i < research.capacity; i++) {
					research.status.damage.set(i, false);

					research.funding.set(i, 0);

					research.status.pending.set(i, false);
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

			if (airMission.capacity > 0) {
				airMission.active = true;
			}
			else {
				airMission.active = false;
				airMission.capacity = 0;
				airMission.aircraft = [];
				airMission.damage = [];
			}

			if (storage.capacity > 0) {
				storage.active = true;
			}
			else {
				storage.active = false;
				storage.capacity = 0;
				storage.equipment = [];
				storage.damage = [];
			}

			if (manufacturing.capacity > 0) {
				manufacturing.active = true;
			}
			else {
				manufacturing.active = false;
				manufacturing.capacity = 0;
				manufacturing.equipment = [];
				manufacturing.damage = [];
			}

			if (naval.capacity > 0) {
				naval.active = true;
			}
			else {
				naval.active = false;
				naval.capacity = 0;
				naval.fleet = [];
				naval.damage = [];
			}

			if (ground.capacity > 0) {
				ground.active = true;
			}
			else {
				ground.active = false;
				ground.capacity = 0;
				ground.corps = [];
				ground.damage = [];
			}

			// end of John's additional settings

			if (loadError) {
				logger.error(
					`Base skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
				);
				++rCounts.loadErrCount;
				return;
			}
			else {
				try {
					const facilitySave = await facility.save();
					++rCounts.loadCount;
					logger.debug(
						`${facilitySave.name} add saved to facility collection.`
					);
					return;
				}
				catch (err) {
					logger.error(`New Facility Save Error: ${err.message}`, {
						meta: err
					});

					++rCounts.loadErrCount;
					return;
				}
			}
		}
		else {
			// Existing Base here ... update
			const id = facility._id;

			facility.name = iData.name;
			facility.code = iData.code;
			facility.siteCode = iData.siteCode;
			facility.baseDefenses = iData.baseDefenses;
			facility.public = iData.public;
			facility.coastal = iData.coastal;
			facility.type = iData.type;

			if (iData.teamCode != '') {
				const team = await Team.findOne({ teamCode: iData.teamCode });
				if (!team) {
					// logger.debug("Facility Load Team Error, Update Base:", iData.name, " Team: ", iData.teamCode);
					loadError = true;
					loadErrorMsg = 'Team Not Found: ' + iData.teamCode;
				}
				else {
					facility.team = team._id;
					// logger.debug("Facility Load Update Team Found, Base:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
				}
			}

			if (iData.countryCode != '') {
				const country = await Country.findOne({ code: iData.countryCode });
				if (!country) {
					// logger.debug("Facility Load Country Error, Update Base:", iData.name, " Country: ", iData.countryCode);
					loadError = true;
					loadErrorMsg = 'Country Not Found: ' + iData.countryCode;
				}
				else {
					facility.country = country._id;
					facility.zone = country.zone;
					// logger.debug("Facility Load Country Found, Update Base:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
				}
			}

			if (iData.siteCode != '') {
				const site = await Site.findOne({ siteCode: iData.siteCode });
				if (!site) {
					// logger.debug("Spacecraft Load Site Error, New Spacecraft:", iData.name, " Site: ", iData.siteCode);
					loadError = true;
					loadErrorMsg = 'Site Not Found: ' + iData.siteCode;
				}
				else {
					facility.site = site._id;
					facility.zone = site.zone;
					// logger.debug("Spacecraft Load Site Found, New Spacecraft:", iData.name, " Site: ", iData.siteCode, "Site ID:", site._id);
				}
			}

			const { error } = validateFacility(facility);
			if (error) {
				// logger.debug("Facility Update Validate Error", iData.name, error.message);
				loadError = true;
				loadErrorMsg = 'Validation Error: ' + error.message;
				// return
			}

			facility.capability = {};
			facility.capability = iData.capability;
			if (loadError) {
				logger.error(
					`Base Site skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
				);
				++rCounts.loadErrCount;
				return;
			}
			else {
				try {
					const facilitySave = await facility.save();
					++rCounts.updCount;
					logger.debug(
						`${facilitySave.name} update saved to facility collection.`
					);
					return;
				}
				catch (err) {
					logger.error(`Update Facility Save Error: ${err.message}`, {
						meta: err
					});
					++rCounts.loadErrCount;
					return;
				}
			}
		}
	}
	catch (err) {
		logger.error(`Catch Base Error: ${err.message}`, { meta: err });

		++rCounts.loadErrCount;
		return;
	}
}

async function deleteAllBases () {
	// logger.debug("Jeff in deleteAllFacilitys", doLoad);

	try {
		let delErrorFlag = false;
		try {
			// all facilities not just bases
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
