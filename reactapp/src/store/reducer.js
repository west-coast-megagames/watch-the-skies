import { combineReducers } from "redux";
import entitiesReducer from "./entities";
import infoReducer from './entities/infoPanels'
import notificationReducer from './entities/notifications'
import authReducer from './entities/auth';

// Main Store reducer
export default combineReducers({
  notifications: notificationReducer,
  entities: entitiesReducer,
  info: infoReducer,
  auth: authReducer
});
