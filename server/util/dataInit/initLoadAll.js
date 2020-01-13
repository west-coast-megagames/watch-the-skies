const runLoad = require('../dataInit/initRefLoad');
const runTeamLoad = require('../dataInit/teamLoad');
const runInterceptorLoad = require('../dataInit/interceptorLoad');
const runUserLoad = require('../dataInit/userLoad');
const runBaseLoad = require('../dataInit/baseLoad');
const runAccountLoad = require('../dataInit/accountLoad');

async function fullInit(selStr){
  
  switch(selStr){
    case 'All':
    case 'RefData':
      let initDone = await runLoad(true);   // load simple reference tables/documents from refdata.json
      console.log("Ref Init Done:", initDone);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Team':
      let teamDone = await runTeamLoad(true);   // load expanded team fields beyond simple reference from initTeams.json
      console.log("Team Load Done:", teamDone);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Interceptor':
      let interceptorDone = await runInterceptorLoad(true);  // load expanded interceptor fields
      console.log("Interceptor Load Done: ", interceptorDone);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'User':
      let userDone = await runUserLoad(true);  // load expanded User fields
      console.log("User Load Done: ", userDone );
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Base':
      let baseDone = await runBaseLoad(true);  // load expanded Base fields
      console.log("Base Load Done: ", baseDone);
      if (selStr != 'All') {
        break;
      }

    case 'All':
    case 'Accounts':
      let accountsDone = await runAccountLoad(true);   // load expanded team accounts fields beyond simple reference from initAccounts.json
      console.log("Accounts Load Done: ", accountsDone);
      if (selStr != 'All') {
        break;
      }

    if (selStr = 'All') break;

    default:
      console.log("Invalid Init Load Selection:", selStr);
    
  }
}

module.exports = fullInit; 