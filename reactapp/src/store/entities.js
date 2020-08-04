import { combineReducers } from 'redux';
import bugsReducer from './entities/bugs';
import logsReducer from './entities/logs';
import siteReducer from './entities/sites';
import teamReducer from './entities/teams';
import aircraftReducer from './entities/aircrafts';
import articleReducer from './entities/articles';
import zoneReducer from './entities/zones';
import militaryReducer from './entities/military';
import facilityReducer from './entities/facilities';
import countryReducer from './entities/countries';

// Combined Store reducers for the 'Entities' slice
export default combineReducers({
  bugs: bugsReducer,
  logs: logsReducer,
  sites: siteReducer,
  teams: teamReducer,
  articles: articleReducer,
  aircrafts: aircraftReducer,
  zones: zoneReducer,
  military: militaryReducer,
  facilities: facilityReducer,
  countries: countryReducer,
});
