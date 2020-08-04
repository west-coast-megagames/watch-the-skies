import { combineReducers } from "redux";
import entitiesReducer from "./entities";
import infoReducer from './entities/infoPanels'

// Main Store reducer
export default combineReducers({
  entities: entitiesReducer,
  info: infoReducer
});
