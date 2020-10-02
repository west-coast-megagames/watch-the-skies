const runDropAll = require('../dataInit/initDropAll');
const runBluePrintLoad = require('../dataInit/blueprintLoad');
const runZoneLoad = require('../dataInit/zoneLoad');
const runUserLoad = require('../dataInit/userLoad');
const runTeamLoad = require('../dataInit/teamLoad');
const runCountryLoad = require('../dataInit/countryLoad');
const runCitySiteLoad = require('../dataInit/citySiteLoad');
const runBaseFacilityLoad = require('../dataInit/baseFacilityLoad');

/*
const runAircraftLoad = require("../dataInit/aircraftLoad");

const runSpacecraftLoad = require("../dataInit/spacecraftLoad");
const runAccountLoad = require("../dataInit/accountLoad");
const runMilitaryLoad = require("../dataInit/militaryLoad");
const runSquadLoad = require("../dataInit/squadLoad");
const runArticleLoad = require("../dataInit/articleLoad");
const runResearchLoad = require("../dataInit/researchLoad");

*/
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging

async function fullInit (selStr) {
	let dropAllDone = false;
	let blueprintDone = false;
	let zoneDone = false;
	let userDone = false;
	let teamDone = false;
	let countryDone = false;
	let citySiteDone = false;
	let baseFacilityDone = false;
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

		countryDone = await runCountryLoad(true); // load Country fields from initCountry.json
		logger.debug(`Country Load Done: ${countryDone}`);

		citySiteDone = await runCitySiteLoad(true); // load expanded City Sites fields
		logger.debug(`City Sites Load Done: ${citySiteDone}`);

		baseFacilityDone = await runBaseFacilityLoad(true); // load expanded Base Facility fields
		logger.debug(`Base Facility Load Done: ${baseFacilityDone}`);

		userDone = await runUserLoad(true); // load expanded User fields
		logger.debug(`User Load Done: ${userDone}`);

		break;

		/*
    case "All":
    case "Spacecraft":
      let spacecraftDone = await runSpacecraftLoad(true); // load expanded Spacecraft fields
      logger.debug(`Spacecraft Sites Load Done: ${spacecraftDone}`);
      if (selStr != "All") {
        break;
      }

    case "All":
    case "Aircraft":
      let aircraftDone = await runAircraftLoad(true); // load expanded Aircraft fields
      logger.debug(`Aircraft Load Done: ${aircraftDone}`);
      if (selStr != "All") {
        break;
      }

    case "All":
    case "Accounts":
      let accountsDone = await runAccountLoad(true); // load expanded team accounts fields beyond simple reference from initAccounts.json
      logger.debug(`Accounts Load Done: ${accountsDone}`);
      if (selStr != "All") {
        break;
      }

    case "All":
    case "Military":
      let militaryDone = await runMilitaryLoad(true); // load expanded military fields initMilitary.json with gear
      logger.debug(`Military Load Done: ${militaryDone}`);
      if (selStr != "All") {
        break;
      }

    case "All":
    case "Squad":
      let squadDone = await runSquadLoad(true); // load expanded Squad fields initSquad.json with gear
      logger.debug(`Squad Load Done: ${squadDone}`);
      if (selStr != "All") {
        break;
      }

    case "All":
    case "Article":
      let articleDone = await runArticleLoad(true); // load expanded Article fields initArticle.json
      logger.debug(`Artilce Load Done: ${articleDone}`);
      if (selStr != "All") {
        break;
      }

    case "All":
    case "Research":
      let researchDone = await runResearchLoad(true); // load expanded Research fields initResearch.json
      logger.debug(`Research Load Done: ${researchDone}`);
      if (selStr != "All") {
        break;
      }

			*/

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

	case 'Country':
		countryDone = await runCountryLoad(true); // load Country fields from initCountry.json
		logger.debug(`Country Load Done: ${countryDone}`);

		break;

	case 'CitySite':
		citySiteDone = await runCitySiteLoad(true); // load expanded City Sites fields
		logger.debug(`City Sites Load Done: ${citySiteDone}`);

		break;

	case 'BaseFacility':
		baseFacilityDone = await runBaseFacilityLoad(true); // load expanded Base Facility fields
		logger.debug(`Base Facility Load Done: ${baseFacilityDone}`);

		break;

	case 'User':
		userDone = await runUserLoad(true); // load expanded User fields
		logger.debug(`User Load Done: ${userDone}`);

		break;

	default:
		logger.error(`Invalid Init Load Selection: ${selStr}`);
	}

	logger.info('initLoadAll Done');
	return true;
}

module.exports = fullInit;
