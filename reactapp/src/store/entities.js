import { combineReducers } from 'redux';
import bugsReducer from './entities/bugs';
import projectsReducer from './entities/projects';
import usersReducer from './entities/users';
import logsReducer from './entities/logs';

export default combineReducers({
  bugs: bugsReducer,
  projects: projectsReducer,
  users: usersReducer,
  logs: logsReducer
});
