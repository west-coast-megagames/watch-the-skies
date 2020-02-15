const runLoad = require('../dataInit/initRefLoad');
const runTeamLoad = require('../dataInit/teamLoad');
const runCountryLoad = require('../dataInit/countryLoad');
const runInterceptorLoad = require('../dataInit/interceptorLoad');
const runUserLoad = require('../dataInit/userLoad');
const runBaseSiteLoad = require('../dataInit/baseSiteLoad');
const runCitySiteLoad = require('../dataInit/citySiteLoad');
const runAccountLoad = require('../dataInit/accountLoad');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging

async function fullInit(selStr){
  
  switch(selStr){
    case 'All':
    case 'RefData':
      let initDone = await runLoad(true);   // load simple reference tables/documents from refdata.json
      //console.log("Ref Init Done:", initDone);
      logger.debug("Ref Init Done:", initDone);
      if (selStr != 'All') {
        break;
      }

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
    case 'Interceptor':
      let interceptorDone = await runInterceptorLoad(true);  // load expanded interceptor fields
      logger.debug("Interceptor Load Done: ", interceptorDone);
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

    if (selStr = 'All') break;

    default:
      logger.error("Invalid Init Load Selection:", selStr);
    
  }

  logger.info("initLoadAll Done");
  
}

module.exports = fullInit; 