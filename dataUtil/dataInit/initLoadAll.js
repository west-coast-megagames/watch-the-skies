const runDropAll = require('../dataInit/initDropAll');
const runBluePrintLoad = require('../dataInit/blueprintLoad');
const runZoneLoad = require('../dataInit/zoneLoad');
const runTeamLoad = require('../dataInit/teamLoad');
const runOrganizationLoad = require('../dataInit/organizationLoad');
const runCitySiteLoad = require('../dataInit/citySiteLoad');
const runBaseFacilityLoad = require('../dataInit/baseFacilityLoad');
const runSpacecraftLoad = require('../dataInit/spacecraftLoad');
const runSpaceFacilityLoad = require('../dataInit/spaceFacilityLoad');
const runAircraftLoad = require('../dataInit/aircraftLoad');
const runAccountLoad = require('../dataInit/accountLoad');
const runMilitaryLoad = require('../dataInit/militaryLoad');
const runSquadLoad = require('../dataInit/squadLoad');
const runArticleLoad = require('../dataInit/articleLoad');
const runResearchLoad = require('../dataInit/researchLoad');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging

async function fullInit(selStr) {
	let dropAllDone = false;
	let blueprintDone = false;
	let zoneDone = false;
	let teamDone = false;
	let organizationDone = false;
	let citySiteDone = false;
	let baseFacilityDone = false;
	let spacecraftDone = false;
	let spaceFacilityDone = false;
	let aircraftDone = false;
	let accountsDone = false;
	let militaryDone = false;
	let squadDone = false;
	let articleDone = false;
	let researchDone = false;
	switch (selStr) {


	// only one case ALL now to work with eslint no fallthrough and no duplicate case
	// not as pretty
	case 'All':
		dropAllDone = await runDropAll(true); // drop all tables
		logger.debug(`Drop All Done: ${dropAllDone}`);

		blueprintDone = await runBluePrintLoad(true); // load BluePrint fields from json
		logger.debug(`BluePrint Init Done: ${blueprintDone}`);

		zoneDone = await runZoneLoad(true); // load Zone fields from initZone.json
		logger.debug(`Zone Init Done: ${zoneDone}`);

		teamDone = await runTeamLoad(true); // load Team fields from initTeams.json
		logger.debug(`Team Load Done: ${teamDone}`);

		organizationDone = await runOrganizationLoad(true); // load Organization fields from initOrganization.json
		logger.debug(`Organization Load Done: ${organizationDone}`);

		citySiteDone = await runCitySiteLoad(true); // load expanded City Sites fields
		logger.debug(`City Sites Load Done: ${citySiteDone}`);

		baseFacilityDone = await runBaseFacilityLoad(true); // load expanded Base Facility fields
		logger.debug(`Base Facility Load Done: ${baseFacilityDone}`);

		spacecraftDone = await runSpacecraftLoad(true); // load expanded Spacecraft fields
		logger.debug(`Spacecraft Sites Load Done: ${spacecraftDone}`);

		spaceFacilityDone = await runSpaceFacilityLoad(true); // load expanded Space Facility fields
		logger.debug(`Space Facility Load Done: ${spaceFacilityDone}`);

		aircraftDone = await runAircraftLoad(true); // load expanded Aircraft fields
		logger.debug(`Aircraft Load Done: ${aircraftDone}`);

		accountsDone = await runAccountLoad(true); // load expanded team accounts fields beyond simple reference from initAccounts.json
		logger.debug(`Accounts Load Done: ${accountsDone}`);

		militaryDone = await runMilitaryLoad(true); // load expanded military fields initMilitary.json with gear
		logger.debug(`Military Load Done: ${militaryDone}`);

		squadDone = await runSquadLoad(true); // load expanded Squad fields initSquad.json with gear
		logger.debug(`Squad Load Done: ${squadDone}`);

		articleDone = await runArticleLoad(true); // load expanded Article fields initArticle.json
		logger.debug(`Artilce Load Done: ${articleDone}`);

		researchDone = await runResearchLoad(true); // load expanded Research fields initResearch.json
		logger.debug(`Research Load Done: ${researchDone}`);

		break;

	case 'DropAll':
		dropAllDone = await runDropAll(true); // drop all tables
		logger.debug(`Drop All Done: ${dropAllDone}`);

		break;

	case 'BluePrint':
		blueprintDone = await runBluePrintLoad(true); // load BluePrint fields from json
		logger.debug(`BluePrint Init Done: ${blueprintDone}`);

		break;

	case 'Zone':
		zoneDone = await runZoneLoad(true); // load Zone fields from initZone.json
		logger.debug(`Zone Init Done: ${zoneDone}`);

		break;

	case 'Team':
		teamDone = await runTeamLoad(true); // load Team fields from initTeams.json
		logger.debug(`Team Load Done: ${teamDone}`);

		break;

	case 'Organization':
		organizationDone = await runOrganizationLoad(true); // load Organization fields from initOrganization.json
		logger.debug(`Organization Load Done: ${organizationDone}`);

		break;

	case 'CitySite':
		citySiteDone = await runCitySiteLoad(true); // load expanded City Sites fields
		logger.debug(`City Sites Load Done: ${citySiteDone}`);

		break;

	case 'BaseFacility':
		baseFacilityDone = await runBaseFacilityLoad(true); // load expanded Base Facility fields
		logger.debug(`Base Facility Load Done: ${baseFacilityDone}`);

		break;

	case 'Spacecraft':
		spacecraftDone = await runSpacecraftLoad(true); // load expanded Spacecraft fields
		logger.debug(`Spacecraft Sites Load Done: ${spacecraftDone}`);

		break;

	case 'SpaceFacility':
		spaceFacilityDone = await runSpaceFacilityLoad(true); // load expanded Space Facility fields
		logger.debug(`Space Facility Load Done: ${spaceFacilityDone}`);

		break;

	case 'Aircraft':
		aircraftDone = await runAircraftLoad(true); // load expanded Aircraft fields
		logger.debug(`Aircraft Load Done: ${aircraftDone}`);

		break;

	case 'Accounts':
		accountsDone = await runAccountLoad(true); // load expanded team accounts fields beyond simple reference from initAccounts.json
		logger.debug(`Accounts Load Done: ${accountsDone}`);

		break;

	case 'Military':
		militaryDone = await runMilitaryLoad(true); // load expanded military fields initMilitary.json with gear
		logger.debug(`Military Load Done: ${militaryDone}`);

		break;

	case 'Squad':
		squadDone = await runSquadLoad(true); // load expanded Squad fields initSquad.json with gear
		logger.debug(`Squad Load Done: ${squadDone}`);

		break;

	case 'Article':
		articleDone = await runArticleLoad(true); // load expanded Article fields initArticle.json
		logger.debug(`Artilce Load Done: ${articleDone}`);

		break;

	case 'Research':
		researchDone = await runResearchLoad(true); // load expanded Research fields initResearch.json
		logger.debug(`Research Load Done: ${researchDone}`);

		break;

	default:
		logger.error(`Invalid Init Load Selection: ${selStr}`);
	}

	logger.info('initLoadAll Done');
	return true;
}

module.exports = fullInit;
