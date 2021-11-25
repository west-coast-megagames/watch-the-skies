import socket from '../socket'
import store from './store';
import { usersRecieved } from './entities/auth';
import { accountAdded, accountDeleted, accountUpdated } from './entities/accounts';
import { aircraftAdded, aircraftDeleted, aircraftUpdated } from './entities/aircrafts';
import { articleAdded, articleDeleted, articleUpdated } from './entities/articles';
import { blueprintAdded, blueprintDeleted, blueprintUpdated } from './entities/blueprints';
import { organizationAdded, organizationDeleted, organizationUpdated } from './entities/organizations';
import { facilityAdded, facilityDeleted, facilityUpdated } from './entities/facilities';

import { militaryAdded, militaryDeleted, militaryUpdated } from './entities/military';
import { reportAdded, reportDeleted, reportsUpdated } from './entities/reports';
import { researchAdded, researchDeleted, researchUpdated } from './entities/research';
import { siteAdded, siteDeleted, siteUpdated } from './entities/sites';
import { teamAdded, teamDeleted, teamUpdated } from './entities/teams';
import { upgradeAdded, upgradeDeleted, upgradeUpdated } from './entities/upgrades';
import { zoneAdded, zonesDeleted, zoneUpdated } from './entities/zones';
import { tradeAdded, tradeDeleted, tradeUpdated } from './entities/trades';
import { clockUpdated } from './entities/clock';

const updaterFunctions = {
	account: accountUpdated,
	aircraft: aircraftUpdated,
	article: articleUpdated,
	blueprint: blueprintUpdated,
	clock: clockUpdated,
	organization: organizationUpdated,
	facility: facilityUpdated,
	military: militaryUpdated,
	report: reportsUpdated,
	research: researchUpdated,
	site: siteUpdated,
	team: teamUpdated,
	trade: tradeUpdated,
	upgrade: upgradeUpdated,
	zone: zoneUpdated,
	users: usersRecieved
}

const adderFunctions = {
	account: accountAdded,
	aircraft: aircraftAdded,
	article: articleAdded,
	blueprint: blueprintAdded,
	organization: organizationAdded,
	facility: facilityAdded,
	military: militaryAdded,
	report: reportAdded,
	research: researchAdded,
	site: siteAdded,
	team: teamAdded,
	trade: tradeAdded,
	upgrade: upgradeAdded,
	zone: zoneAdded
}

const deleteFunctions = {
	account: accountDeleted,
	aircraft: aircraftDeleted,
	article: articleDeleted,
	blueprint: blueprintDeleted,
	organization: organizationDeleted,
	facility: facilityDeleted,
	military: militaryDeleted,
	report: reportDeleted,
	research: researchDeleted,
	site: siteDeleted,
	team: teamDeleted,
	trade: tradeDeleted,
	upgrade: upgradeDeleted,
	zone: zonesDeleted
}

const initUpdates = () => {
   socket.on('connect', () => { console.log('UwU I made it') });

   socket.on('updateClients', (data) => { 
    console.log('updateClients');
    for (const el of data) {
        // console.log(el)
        if (el && el.model) {
					let func = updaterFunctions[el.model.toLowerCase()];
					func ? store.dispatch(func(el)) : console.log(`ERROR INVALID UPDATE FUNCTION: ${el.model.toLowerCase()} - ${func}`);
        }
        else
        console.log(`Defined Error: Unable to updateClients Redux for ${el}`);
    }
   });

   socket.on('createClients', (data) => { 
       console.log(`createClients`);
       for (const el of data) {
				if (el && el.model) {
					let func = adderFunctions[el.model.toLowerCase()];
					func ? store.dispatch(func(el)) : console.log(`ERROR INVALID CREATE FUNCTION: ${el.model.toLowerCase()} - ${func}`);			
				}
        else {
					console.log(`Defined Error: Unable to createClients Redux for ${el}`);
					console.log(el);
				}
       }
   });

   socket.on('deleteClients', (data) => { 
       console.log('deleteClients');
       for (const el of data) {
				if (el) {
         console.log(el); // for debugging
				 let func = deleteFunctions[el.model.toLowerCase()];
				 func ? store.dispatch(func(el)) : console.log(`ERROR INVALID DELETE FUNCTION: ${el.model.toLowerCase()} - ${func}`);				
				}
				else
        	console.log(`Defined Error: Unable to createClients Redux for ${el}`);
       }
   });

	 socket.on('clients', (users) => {			
		let func = updaterFunctions['users'];
		func ? store.dispatch(func(users)) : console.log(`ERROR INVALID UPDATE FUNCTION:  - ${func}`);
	});
}



export default initUpdates;