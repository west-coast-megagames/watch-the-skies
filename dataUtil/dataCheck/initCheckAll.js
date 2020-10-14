// const runBluePrintCheck = require("../dataCheck/blueprintCheck");
const runBlueprintCheck = require('../dataCheck/blueprintCheck');
const runZoneCheck = require('../dataCheck/zoneCheck');
const runTeamCheck = require('../dataCheck/teamCheck');
const runCountryCheck = require('../dataCheck/countryCheck');
const runFacilityCheck = require('../dataCheck/facilityCheck');
const runSiteCheck = require('../dataCheck/siteCheck');
const runUserCheck = require('../dataCheck/userCheck');
/*
const runUpgradeCheck = require("../dataCheck/upgradeCheck");
const runAircraftCheck = require("../dataCheck/aircraftCheck");
const runMilitaryCheck = require("../dataCheck/militaryCheck");
const runSquadCheck = require("../dataCheck/squadCheck");
const runArticleCheck = require("../dataCheck/articleCheck");
const runResearchCheck = require("../dataCheck/researchCheck");
const runAccountsCheck = require("../dataCheck/accountsCheck");
*/

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

async function fullInitCheck (selStr) {
	let blueprintCheckDone = false;
	let zoneCheckDone = false;
	let countryCheckDone = false;
	let teamCheckDone = false;
	let facilityCheckDone = false;
	let siteCheckDone = false;
	let userCheckDone = false;

	// only one case ALL now to work with eslint no fallthrough and no duplicate case
	// not as pretty
	switch (selStr) {
	case 'All':
		blueprintCheckDone = await runBlueprintCheck(true); // check blueprint records
		logger.info(`Blueprint Check Done: ${blueprintCheckDone}`);

		zoneCheckDone = await runZoneCheck(true); // check zone records
		logger.info(`Zone Check Done: ${zoneCheckDone}`);

		teamCheckDone = await runTeamCheck(true); // check team records
		logger.info(`Team Check Done: ${teamCheckDone}`);

		countryCheckDone = await runCountryCheck(true); // check country records
		logger.info(`Country Check Done: ${countryCheckDone}`);

		facilityCheckDone = await runFacilityCheck(true); // check facility records
		logger.info(`Facility Check Done: ${facilityCheckDone}`);

		userCheckDone = await runUserCheck(true); // check user records
		logger.info(`User Check Done: ${userCheckDone}`);

		/*
    case "All":
    case "Upgrade":
      let upgradeCheckDone = await runUpgradeCheck(true); // check upgrade records
      logger.info(`Upgrade Check Done: ${upgradeCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Aircraft":
      let aircraftCheckDone = await runAircraftCheck(true); // check aircraft records
      logger.info(`Aircraft Check Done: ${aircraftCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Military":
      let militaryCheckDone = await runMilitaryCheck(true); // check military records
      logger.info(`Military Check Done: ${militaryCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Squad":
      let squadCheckDone = await runSquadCheck(true); // check squad records
      logger.info(`Squad Check Done: ${squadCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Article":
      let articleCheckDone = await runArticleCheck(true); // check article records
      logger.info(`Article Check Done: ${articleCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Research":
      let researchCheckDone = await runResearchCheck(true); // check research records
      logger.info(`Research Check Done: ${researchCheckDone}`);

      if (selStr != "All") {
        break;
      }

      if ((selStr = "All")) break;

    case "All":
    case "Accounts":
      let accountsCheckDone = await runAccountsCheck(true); // check accounts records
      logger.info(`Accounts Check Done: ${accountsCheckDone}`);

      if (selStr != "All") {
        break;
      }
     */

		break;
		// end of case All

	case 'BluePrint':
		blueprintCheckDone = await runBlueprintCheck(true); // check blueprint records
		logger.info(`Blueprint Check Done: ${blueprintCheckDone}`);

		break;

	case 'Zone':
		zoneCheckDone = await runZoneCheck(true); // check zone records
		logger.info(`Zone Check Done: ${zoneCheckDone}`);

		break;

	case 'Team':
		teamCheckDone = await runTeamCheck(true); // check team records
		logger.info(`Team Check Done: ${teamCheckDone}`);

		break;

	case 'Country':
		countryCheckDone = await runCountryCheck(true); // check country records
		logger.info(`Country Check Done: ${countryCheckDone}`);

		break;

	case 'Facility':
		facilityCheckDone = await runFacilityCheck(true); // check facility records
		logger.info(`Facility Check Done: ${facilityCheckDone}`);

		break;

	case 'Site':
		siteCheckDone = await runSiteCheck(true); // check site records
		logger.info(`Site Check Done: ${siteCheckDone}`);

		break;

	case 'User':
		userCheckDone = await runUserCheck(true); // check user records
		logger.info(`User Check Done: ${userCheckDone}`);

		break;

	default:
		logger.error(`Invalid Init Check Selection:  ${selStr}`);
	}

	logger.info('initCheckAll Done');
	return true;
}

module.exports = fullInitCheck;
