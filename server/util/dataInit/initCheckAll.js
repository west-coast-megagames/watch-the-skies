const runZoneCheck = require('../dataCheck/zoneCheck');
const runCountryCheck = require('../dataCheck/countryCheck');
const runFacilityCheck = require('../dataCheck/facilityCheck');
const runSiteCheck = require('../dataCheck/siteCheck');

const { logger } = require('../../middleware/winston'); // Import of winston for error logging

async function fullInitCheck(selStr){
  
  switch(selStr){

    case 'All':
    case 'RefData':
      let zoneCheckDone = await runZoneCheck(true);   // check zone records
      logger.info(`Zone Check Done: ${zoneCheckDone}`);

      let countryCheckDone = await runCountryCheck(true);   // check country records
      logger.info(`Country Check Done: ${countryCheckDone}`);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Facility':
      let facilityCheckDone = await runFacilityCheck(true);   // check facility records
      logger.info(`Facility Check Done: ${facilityCheckDone}`);

      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Site':
      let siteCheckDone = await runSiteCheck(true);   // check site records
      logger.info(`Site Check Done: ${siteCheckDone}`);
    
      if (selStr != 'All') {
        break;
      }

    if (selStr = 'All') break;

    default:
      logger.error(`Invalid Init Check Selection:  ${selStr}`);
    
  }

  logger.info("initCheckAll Done");
  return(true);
  
}

module.exports = fullInitCheck; 