import store from '../store/store';

import { loadsites } from '../store/entities/sites';
import { loadteams } from '../store/entities/teams';
import { loadaircrafts } from '../store/entities/aircrafts';
import { loadarticles } from '../store/entities/articles';
import { loadzones } from '../store/entities/zones';
import { loadfacilities } from '../store/entities/facilities';
import { loadmilitary } from '../store/entities/military';
import { loadOrganizations } from '../store/entities/organizations';
import { loadresearch } from '../store/entities/research';
import { loadaccounts } from '../store/entities/accounts';
import { loadBlueprints } from '../store/entities/blueprints';
import { loadReports } from '../store/entities/reports';
import { loadUpgrades } from '../store/entities/upgrades';
import { loadTrades } from '../store/entities/trades';
import { loadClock } from '../store/entities/clock';
import { loadIntel } from '../store/entities/intel';

let loader = {
	accounts: loadaccounts,
	aircrafts: loadaircrafts,
	articles: loadarticles,
	blueprints: loadBlueprints,
	clock: loadClock,
	organizations: loadOrganizations,
	facilities: loadfacilities,
	military: loadmilitary,
	reports: loadReports,
	research: loadresearch,
	sites: loadsites,
	teams: loadteams,
	trades: loadTrades,
	upgrades: loadUpgrades,
	zones: loadzones,
	intel: loadIntel
}

//Get all objects from DB collections and store to redux state
export default function loadState() {
	let state = store.getState();
	let slices = Object.keys(state.entities).sort();

	let func = undefined;
	for (let section of slices) {
		let slice = state.entities[section];
		console.log(section)
		func = loader[section];
		if (func) store.dispatch(func());
	}
}
