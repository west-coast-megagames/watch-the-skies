// const runBluePrintCheck = require("../dataCheck/blueprintCheck");
const runBlueprintCheck = require('../dataCheck/blueprintCheck');
const runZoneCheck = require('../dataCheck/zoneCheck');
const runTeamCheck = require('../dataCheck/teamCheck');
const runOrganizationCheck = require('../dataCheck/organizationCheck');
const runFacilityCheck = require('../dataCheck/facilityCheck');
const runSiteCheck = require('../dataCheck/siteCheck');
const runUpgradeCheck = require('../dataCheck/upgradeCheck');
const runAircraftCheck = require('../dataCheck/aircraftCheck');
const runAccountsCheck = require('../dataCheck/accountsCheck');
const runMilitaryCheck = require('../dataCheck/militaryCheck');
const runSquadCheck = require('../dataCheck/squadCheck');
const runArticleCheck = require('../dataCheck/articleCheck');
const runResearchCheck = require('../dataCheck/researchCheck');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

async function fullInitCheck(selStr) {
	let blueprintCheckDone = false;
	let zoneCheckDone = false;
	let organizationCheckDone = false;
	let teamCheckDone = false;
	let facilityCheckDone = false;
	let siteCheckDone = false;
	let upgradeCheckDone = false;
	let aircraftCheckDone = false;
	let accountsCheckDone = false;
	let militaryCheckDone = false;
	let squadCheckDone = false;
	let articleCheckDone = false;
	let researchCheckDone = false;

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

		organizationCheckDone = await runOrganizationCheck(true); // check organization records
		logger.info(`Organization Check Done: ${organizationCheckDone}`);

		facilityCheckDone = await runFacilityCheck(true); // check facility records
		logger.info(`Facility Check Done: ${facilityCheckDone}`);

		siteCheckDone = await runSiteCheck(true); // check site records
		logger.info(`Site Check Done: ${siteCheckDone}`);

		upgradeCheckDone = await runUpgradeCheck(true); // check upgrade records
		logger.info(`Upgrade Check Done: ${upgradeCheckDone}`);

		aircraftCheckDone = await runAircraftCheck(true); // check aircraft records
		logger.info(`Aircraft Check Done: ${aircraftCheckDone}`);

		accountsCheckDone = await runAccountsCheck(true); // check accounts records
		logger.info(`Accounts Check Done: ${accountsCheckDone}`);

		militaryCheckDone = await runMilitaryCheck(true); // check military records
		logger.info(`Military Check Done: ${militaryCheckDone}`);

		squadCheckDone = await runSquadCheck(true); // check squad records
		logger.info(`Squad Check Done: ${squadCheckDone}`);

		articleCheckDone = await runArticleCheck(true); // check article records
		logger.info(`Article Check Done: ${articleCheckDone}`);

		researchCheckDone = await runResearchCheck(true); // check research records
		logger.info(`Research Check Done: ${researchCheckDone}`);

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

	case 'Organization':
		organizationCheckDone = await runOrganizationCheck(true); // check organization records
		logger.info(`Organization Check Done: ${organizationCheckDone}`);

		break;

	case 'Facility':
		facilityCheckDone = await runFacilityCheck(true); // check facility records
		logger.info(`Facility Check Done: ${facilityCheckDone}`);

		break;

	case 'Site':
		siteCheckDone = await runSiteCheck(true); // check site records
		logger.info(`Site Check Done: ${siteCheckDone}`);

		break;

	case 'Upgrade':
		upgradeCheckDone = await runUpgradeCheck(true); // check upgrade records
		logger.info(`Upgrade Check Done: ${upgradeCheckDone}`);

		break;

	case 'Aircraft':
		aircraftCheckDone = await runAircraftCheck(true); // check aircraft records
		logger.info(`Aircraft Check Done: ${aircraftCheckDone}`);

		break;

	case 'Accounts':
		accountsCheckDone = await runAccountsCheck(true); // check accounts records
		logger.info(`Accounts Check Done: ${accountsCheckDone}`);

		break;

	case 'Military':
		militaryCheckDone = await runMilitaryCheck(true); // check military records
		logger.info(`Military Check Done: ${militaryCheckDone}`);

		break;

	case 'Squad':
		squadCheckDone = await runSquadCheck(true); // check squad records
		logger.info(`Squad Check Done: ${squadCheckDone}`);

		break;

	case 'Article':
		articleCheckDone = await runArticleCheck(true); // check article records
		logger.info(`Article Check Done: ${articleCheckDone}`);

		break;

	case 'Research':
		researchCheckDone = await runResearchCheck(true); // check research records
		logger.info(`Research Check Done: ${researchCheckDone}`);

		break;

	default:
		logger.error(`Invalid Init Check Selection:  ${selStr}`);
	}

	logger.info('initCheckAll Done');
	return true;
}

module.exports = fullInitCheck;
