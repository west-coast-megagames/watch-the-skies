const runZoneCheck = require("../dataCheck/zoneCheck");
const runCountryCheck = require("../dataCheck/countryCheck");
const runFacilityCheck = require("../dataCheck/facilityCheck");
const runSiteCheck = require("../dataCheck/siteCheck");
const runUserCheck = require("../dataCheck/userCheck");
const runEquipmentCheck = require("../dataCheck/equipmentCheck");
const runAircraftCheck = require("../dataCheck/aircraftCheck");
const runMilitaryCheck = require("../dataCheck/militaryCheck");
const runSquadCheck = require("../dataCheck/squadCheck");
const runTeamCheck = require("../dataCheck/teamCheck");
const runArticleCheck = require("../dataCheck/articleCheck");
const runResearchCheck = require("../dataCheck/researchCheck");
const runAccountsCheck = require("../dataCheck/accountsCheck");

const { logger } = require("../middleware/winston"); // Import of winston for error logging
require("winston-mongodb");

async function fullInitCheck(selStr) {
  switch (selStr) {
    case "All":
    case "RefData":
      let zoneCheckDone = await runZoneCheck(true); // check zone records
      logger.info(`Zone Check Done: ${zoneCheckDone}`);

      let countryCheckDone = await runCountryCheck(true); // check country records
      logger.info(`Country Check Done: ${countryCheckDone}`);
      if (selStr != "All") {
        break;
      }

    case "All":
    case "Team":
      let teamCheckDone = await runTeamCheck(true); // check team records
      logger.info(`Team Check Done: ${teamCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Facility":
      let facilityCheckDone = await runFacilityCheck(true); // check facility records
      logger.info(`Facility Check Done: ${facilityCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Site":
      let siteCheckDone = await runSiteCheck(true); // check site records
      logger.info(`Site Check Done: ${siteCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "User":
      let userCheckDone = await runUserCheck(true); // check user records
      logger.info(`User Check Done: ${userCheckDone}`);

      if (selStr != "All") {
        break;
      }

    case "All":
    case "Equipment":
      let equipmentCheckDone = await runEquipmentCheck(true); // check equipment records
      logger.info(`Equipment Check Done: ${equipmentCheckDone}`);

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

      if ((selStr = "All")) break;

    default:
      logger.error(`Invalid Init Check Selection:  ${selStr}`);
  }

  logger.info("initCheckAll Done");
  return true;
}

module.exports = fullInitCheck;
