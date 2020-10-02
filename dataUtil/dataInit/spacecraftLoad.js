const fs = require('fs');
const config = require('config');
const file = fs.readFileSync(
	config.get('initPath') + 'init-json/initSpacecraft.json',
	'utf8'
);
const spacecraftDataIn = JSON.parse(file);
// const mongoose = require('mongoose');
const spacecraftDebugger = require('debug')('app:spacecraftLoad');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');
const { convertToDms } = require('../systems/geo');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);

// Spacecraft Model - Using Mongoose Model
const { SpaceSite, validateSpace } = require('../models/site');
const { Country } = require('../models/country');
const { Team } = require('../models/team');
const { Facility } = require('../models/facility');
const { Zone } = require('../models/zone');
const { Site } = require('../models/site');
const {
	loadFacilitys,
	facilitys
} = require('../wts/construction/facilities/facilities');
const { delFacilities } = require('../wts/util/construction/deleteFacilities');
const { validUnitType } = require('../wts/util/construction/validateUnitType');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runSpacecraftLoad (runFlag) {
	try {
		// spacecraftDebugger("Jeff in runSpacecraftLoad", runFlag);
		if (!runFlag) return false;
		if (runFlag) {
			await loadFacilitys(); // load wts/json/facilities/facilitys.json data into array

			await deleteAllSpacecraft(runFlag);
			await initLoad(runFlag);
		}
		return true;
	}
	catch (err) {
		logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
			meta: err
		});

		return false;
	}
}

async function initLoad (doLoad) {
	if (!doLoad) return;
	let recReadCount = 0;
	const recCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for (const data of spacecraftDataIn) {
		++recReadCount;
		await loadSpacecraft(data, recCounts);
	}

	logger.info(
		`Spacecraft Load Counts Read: ${recReadCount} Errors: ${recCounts.loadErrCount} Saved: ${recCounts.loadCount} Updated: ${recCounts.updCount}`
	);
}

async function loadSpacecraft (iData, rCounts) {
	let loadError = false;
	let loadErrorMsg = '';
	let loadName = '';
	let loadCode = '';
	try {
		const spacecraft = await SpaceSite.findOne({ name: iData.name });

		loadName = iData.name;
		loadCode = iData.code;

		if (!spacecraft) {
			// New Spacecraft here
			const spacecraft = new SpaceSite({
				name: iData.name,
				siteCode: iData.code
			});
			spacecraft.gameState = [];
			spacecraft.serviceRecord = [];

			if (iData.teamCode != '') {
				const team = await Team.findOne({ teamCode: iData.teamCode });
				if (!team) {
					// spacecraftDebugger("Spacecraft Load Team Error, New Spacecraft:", iData.name, " Team: ", iData.teamCode);
					loadError = true;
					loadErrorMsg = 'Team Not Found: ' + iData.teamCode;
				}
				else {
					spacecraft.team = team._id;
					// spacecraftDebugger("Spacecraft Load Team Found, Spacecraft:", iData.name, " Team: ", iData.countryCode, "Team ID:", team._id);
				}
			}

			const { error } = validateSpace(spacecraft);
			if (error) {
				// spacecraftDebugger("New Spacecraft Validate Error", iData.name, error.message);
				loadError = true;
				loadErrorMsg = 'Validation Error: ' + error.message;
				// return;
			}

			spacecraft.subType = iData.shipType;
			spacecraft.status = iData.status;
			spacecraft.hidden = iData.hidden;

			if (iData.countryCode != '') {
				const country = await Country.findOne({ code: iData.countryCode });
				if (!country) {
					// spacecraftDebugger("Spacecraft Load Country Error, New Spacecraft:", iData.name, " Country: ", iData.countryCode);
					loadError = true;
					loadErrorMsg = 'Country Not Found: ' + iData.countryCode;
				}
				else {
					spacecraft.country = country._id;
					// spacecraft.zone = country.zone;
					// spacecraftDebugger("Spacecraft Load Country Found, New Spacecraft:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
				}
			}

			useZone = '';
			if (iData.siteCode != '') {
				const site = await Site.findOne({ siteCode: iData.siteCode });
				if (!site) {
					// spacecraftDebugger("Spacecraft Load Site Error, New Spacecraft:", iData.name, " Site: ", iData.siteCode);
					loadError = true;
					loadErrorMsg = 'Site Not Found: ' + iData.siteCode;
				}
				else {
					spacecraft.site = site._id;

					// set zone based on Type
					switch (spacecraft.subType) {
					case 'Spacecraft':
						useZone = 'LO';
						break;

					case 'Station':
						useZone = 'LE';
						break;

					default:
						useZone = 'ME';
					}

					const zone = await Zone.findOne({ code: useZone });
					if (!zone) {
						loadError = true;
						loadErrorMsg = 'Zone Not Found: ' + useZone;
					}
					else {
						spacecraft.zone = zone._id;
					}

					// spacecraftDebugger("Spacecraft Load Site Found, New Spacecraft:", iData.name, " Country: ", iData.siteCode, "Site ID:", site._id);
				}
			}

			spacecraft.facilities = [];

			if (loadError) {
				++rCounts.loadErrCount;
				logger.error(
					`Spacecraft skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
				);
				return;
			}
			else {
				try {
					const spacecraftSave = await spacecraft.save();
					++rCounts.loadCount;
					spacecraftDebugger(
						`${spacecraftSave.name} add saved to spacecraft collection.`
					);

					return;
				}
				catch (err) {
					++rCounts.loadErrCount;
					delFacilities(spacecraft.facilities);
					logger.error(`New Spacecraft Save Catch Error: ${err.message}`, {
						meta: err
					});
					return;
				}
			}
		}
		else {
			// Existing Spacecraft here ... update
			const id = spacecraft._id;

			spacecraft.name = iData.name;
			spacecraft.siteCode = iData.code;
			spacecraft.baseDefenses = iData.baseDefenses;
			spacecraft.subType = iData.shipType;
			spacecraft.status = iData.status;
			spacecraft.stats = iData.stats;
			spacecraft.hidden = iData.hidden;

			if (iData.teamCode != '') {
				const team = await Team.findOne({ teamCode: iData.teamCode });
				if (!team) {
					// spacecraftDebugger("Spacecraft Load Team Error, Update Spacecraft:", iData.name, " Team: ", iData.teamCode);
					loadError = true;
					loadErrorMsg = 'Team Not Found: ' + iData.teamCode;
				}
				else {
					spacecraft.team = team._id;
					// spacecraftDebugger("Spacecraft Load Update Team Found, Spacecraft:", iData.name, " Team: ", iData.teamCode, "Team ID:", team._id);
				}
			}

			if (iData.countryCode != '') {
				const country = await Country.findOne({ code: iData.countryCode });
				if (!country) {
					// spacecraftDebugger("Spacecraft Load Country Error, Update Spacecraft:", iData.name, " Country: ", iData.countryCode);
					loadError = true;
					loadErrorMsg = 'Country Not Found: ' + iData.countryCode;
				}
				else {
					spacecraft.country = country._id;
					// spacecraft.zone = country.zone;
					// spacecraftDebugger("Spacecraft Load Country Found, Update Spacecraft:", iData.name, " Country: ", iData.countryCode, "Country ID:", country._id);
				}
			}

			useZone = '';
			if (iData.siteCode != '') {
				const site = await Site.findOne({ siteCode: iData.siteCode });
				if (!site) {
					// spacecraftDebugger("Spacecraft Load Site Error, New Spacecraft:", iData.name, " Site: ", iData.siteCode);
					loadError = true;
					loadErrorMsg = 'Site Not Found: ' + iData.siteCode;
				}
				else {
					spacecraft.site = site._id;

					// set zone based on Type
					switch (spacecraft.subType) {
					case 'Spacecraft':
						useZone = 'LO';
						break;

					case 'Station':
						useZone = 'LE';
						break;

					default:
						useZone = 'ME';
					}

					const zone = await Zone.findOne({ code: useZone });
					if (!zone) {
						loadError = true;
						loadErrorMsg = 'Zone Not Found: ' + useZone;
					}
					else {
						spacecraft.zone = zone._id;
					}

					// spacecraftDebugger("Spacecraft Load Site Found, New Spacecraft:", iData.name, " Country: ", iData.siteCode, "Site ID:", site._id);
				}
			}

			const { error } = validateSpace(spacecraft);
			if (error) {
				// spacecraftDebugger("Spacecraft Update Validate Error", iData.name, error.message);
				loadError = true;
				loadErrorMsg = 'Validation Error: ' + error.message;
				// return
			}

			spacecraft.facilities = [];

			if (loadError) {
				logger.error(
					`Spacecraft skipped due to errors: ${loadCode} ${loadName} ${loadErrorMsg}`
				);
				++rCounts.loadErrCount;
				return;
			}
			else {
				try {
					const spacecraftSave = await spacecraft.save();
					spacecraftDebugger(
						`${spacecraftSave.name}  add saved to spacecraft collection.`
					);
					++rCounts.updCount;

					return;
				}
				catch (err) {
					logger.error(
						`Update Spacecraft Save Error: ${err.message}, { meta: err }`
					);

					++rCounts.loadErrCount;
					return;
				}
			}
		}
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`Catch Spacecraft Error: ${err.message}`, { meta: err });
		return;
	}
}

async function deleteAllSpacecraft (doLoad) {
	spacecraftDebugger('Jeff in deleteAllSpacecrafts', doLoad);
	if (!doLoad) return;

	try {
		for await (const spacecraft of SpaceSite.find({ subType: 'Space' })) {
			const id = spacecraft._id;
			try {
				let spacecraftDel = await Spacecraft.findByIdAndRemove(id);
				if ((spacecraftDel = null)) {
					spacecraftDebugger(`The Spacecraft with the ID ${id} was not found!`);
				}
			}
			catch (err) {
				spacecraftDebugger('Spacecraft Delete All Error:', err.message);
			}
		}
		spacecraftDebugger('All Spacecrafts succesfully deleted!');
	}
	catch (err) {
		spacecraftDebugger(`Delete All Spacecrafts Catch Error: ${err.message}`);
		logger.error(`Delete All Spacecrafts Catch Error: ${err.message}`, {
			meta: err
		});
	}
}

module.exports = runSpacecraftLoad;
