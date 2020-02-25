const runCountryCheck = require('../dataCheck/countryCheck');
/*
const runLoad = require('../dataInit/initRefLoad');
const runTeamLoad = require('../dataInit/teamLoad');
const runCountryLoad = require('../dataInit/countryLoad');
//const runInterceptorLoad = require('../dataInit/interceptorLoad');
const runAircraftLoad = require('../dataInit/aircraftLoad');
const runUserLoad = require('../dataInit/userLoad');
const runBaseSiteLoad = require('../dataInit/baseSiteLoad');
const runCitySiteLoad = require('../dataInit/citySiteLoad');
const runSpacecraftLoad = require('../dataInit/spacecraftLoad');
const runAccountLoad = require('../dataInit/accountLoad');
const runMilitaryLoad = require('../dataInit/militaryLoad');
*/
const { logger } = require('../../middleware/winston'); // Import of winston for error logging

async function fullInitCheck(selStr){
  
  switch(selStr){
    case 'All':
    case 'RefData':
      let countryCheckDone = await runCountryCheck();   // check country records
      logger.debug("Country Check Done:", countryCheckDone);
      if (selStr != 'All') {
        break;
      }
/*
    case 'All':
    case 'Team':
      let teamDone = await runTeamLoad(true);   // load expanded team fields beyond simple reference from initTeams.json
      logger.debug("Team Load Done:", teamDone);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Country':
      let countryDone = await runCountryLoad(true);   // load expanded Country fields beyond simple reference from initCountry.json
      logger.debug("Country Load Done:", countryDone);
      if (selStr != 'All') {
        break;
    }

    case 'All':
    case 'BaseSite':
      let baseSiteDone = await runBaseSiteLoad(true);  // load expanded Base Sites fields
      logger.debug("Base Sites Load Done: ", baseSiteDone);
      if (selStr != 'All') {
        break;
      }
       
    case 'All':
    case 'CitySite':
      let citySiteDone = await runCitySiteLoad(true);  // load expanded City Sites fields
      logger.debug("City Sites Load Done: ", citySiteDone);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Spacecraft':
      let spacecraftDone = await runSpacecraftLoad(true);  // load expanded Spacecraft Sites fields
      logger.debug("Spacecraft Sites Load Done: ", spacecraftDone);
      if (selStr != 'All') {
        break;
      }


    case 'All':   
    case 'Aircraft':
      let aircraftDone = await runAircraftLoad(true);  // load expanded Aircraft fields
      logger.debug("Aircraft Load Done: ", aircraftDone);
      if (selStr != 'All') {
        break;
      }
      
    case 'All':
    case 'User':
      let userDone = await runUserLoad(true);  // load expanded User fields
      logger.debug("User Load Done: ", userDone );
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Accounts':
      let accountsDone = await runAccountLoad(true);   // load expanded team accounts fields beyond simple reference from initAccounts.json
      logger.debug("Accounts Load Done: ", accountsDone);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Military':  
      let militaryDone = await runMilitaryLoad(true);   // load expanded military fields initMilitary.json with gear
      logger.debug("Military Load Done: ", militaryDone);
      if (selStr != 'All') {
        break;
      }
*/

    if (selStr = 'All') break;

    default:
      logger.error("Invalid Init Check Selection:", selStr);
    
  }

  logger.info("initCheckAll Done");
  return(true);
  
}

module.exports = fullInitCheck; 