import { loadlogs } from '../store/entities/logs';
import { loadsites } from '../store/entities/sites';
import { loadteams } from '../store/entities/teams';
import { loadaircrafts } from '../store/entities/aircrafts';
import { loadarticles } from '../store/entities/articles';
import { loadzones } from '../store/entities/zones';
import { loadfacilities } from '../store/entities/facilities';
import { loadmilitary } from '../store/entities/military';
import { loadcountries } from '../store/entities/countries';
import { loadresearch } from '../store/entities/research';

//Get all objects from DB collections and store to redux state
export default function loadState(store) {
    store.dispatch(loadlogs()); // Initial Axios call for all log objects
    store.dispatch(loadsites()); // Initial Axios call for all site objects
    store.dispatch(loadteams()); // Initial Axios call for all team objects
    store.dispatch(loadaircrafts()); // Initial Axios call for all aircraft objects
    store.dispatch(loadarticles()); // Initial Axios call for all article objects
    store.dispatch(loadzones()); // Initial Axios call for all zone objects
    store.dispatch(loadfacilities()); // Initial Axios call for all facility objects
    store.dispatch(loadmilitary()); // Initial Axios call for all military objects
    store.dispatch(loadcountries()); // Initial Axios call for all country objects
    store.dispatch(loadresearch()); // Initial Axios call for all country objects\
}
