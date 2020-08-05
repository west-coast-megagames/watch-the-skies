import configureStore from './configureStore'; // Initial Redux Store
import loadState from '../scripts/initState';

const store = configureStore();
loadState(store);

export default store;