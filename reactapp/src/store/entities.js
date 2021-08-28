import { combineReducers } from 'redux';
import bugsReducer from './entities/bugs';
import reportReducer from './entities/reports';
import siteReducer from './entities/sites';
import teamReducer from './entities/teams';
import aircraftReducer from './entities/aircrafts';
import articleReducer from './entities/articles';
import zoneReducer from './entities/zones';
import militaryReducer from './entities/military';
import facilityReducer from './entities/facilities';
import countryReducer from './entities/countries';
import clockReducer from './entities/clock';
import researchReducer from './entities/research';
import accountReducer from './entities/accounts';
import blueprintReducer from './entities/blueprints';
import upgradeReducer from './entities/upgrades';
import tradeReducer from './entities/trades';
import intelReducer from './entities/intel';



// Combined Store reducers for the 'Entities' slice
export default combineReducers({
  // bugs: bugsReducer,
  reports: reportReducer,
  sites: siteReducer,
  teams: teamReducer,
  articles: articleReducer,
  aircrafts: aircraftReducer,
  zones: zoneReducer,
  military: militaryReducer,
  facilities: facilityReducer,
	clock: clockReducer,
  countries: countryReducer,
  research: researchReducer,
	accounts: accountReducer,
	blueprints: blueprintReducer,
	upgrades: upgradeReducer,
	trades: tradeReducer,
	intel: intelReducer
});
