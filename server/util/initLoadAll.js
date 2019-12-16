const runLoad = require('../util/initRefLoad');
const runTeamLoad = require('../util/teamLoad');
const runInterceptorLoad = require('../util/interceptorLoad');
const runUserLoad = require('../util/userLoad');
const runBaseLoad = require('../util/baseLoad');
const runAccountLoad = require('../util/accountLoad');

async function fullInit(){
  
  let initDone = await runLoad(true);   // load simple reference tables/documents from refdata.json
  console.log("Ref Init Done:", initDone);
  
  let teamDone = await runTeamLoad(true);   // load expanded team fields beyond simple reference from initTeams.json
  console.log("Team Load Done:", teamDone);

  let interceptorDone = await runInterceptorLoad(true);  // load expanded interceptor fields
  console.log("Interceptor Load Done: ", interceptorDone);

  let userDone = await runUserLoad(true);  // load expanded User fields
  console.log("User Load Done: ", userDone );

  let baseDone = await runBaseLoad(true);  // load expanded Base fields
  console.log("Base Load Done: ", baseDone);

  let accountsDone = await runAccountLoad(true);   // load expanded team accounts fields beyond simple reference from initAccounts.json
  console.log("Accunts Load Done: ", accountsDone);

}

module.exports = fullInit; 