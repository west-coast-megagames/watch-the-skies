import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { createSelector } from 'reselect'
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "logs",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newLogs: 0
  },
  reducers: {
    logsRequested: (logs, action) => {
      console.log(`${action.type} Dispatched...`)
      logs.loading = true;
    },

    logsReceived: (logs, action) => {
      console.log(`${action.type} Dispatched...`)
      logs.list = action.payload;
      logs.loading = false;
      logs.lastFetch = Date.now();
    },
    logsRequestFailed: (logs, action) => {
      console.log(`${action.type} Dispatched`)
      logs.loading = false;
    },
    logUpdated: (logs, action) => {
      console.log(`${action.type} Dispatched...`);
      const index = logs.list.findIndex(el => el._id === action.payload._id);
			logs.list[index] = action.payload;
      logs.lastFetch = Date.now();
    },
    logAdded: (logs, action) => {
      console.log(`${action.type} Dispatched`)
      logs.list.push(action.payload);
    },
		logDeleted: (logs, action) => {
      console.log(`${action.type} Dispatched`)
      const index = logs.list.findIndex(el => el._id === action.payload._id);
      logs.list.splice(index, 1);
    },
  }
});

// Action Export
export const {
  logAdded,
  logsReceived,
  logsRequested,
  logsRequestFailed,
  logUpdated,
	logDeleted
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators
const url = "api/logs";

// Log Loader into state
export const loadlogs = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:logsRequested.type,
      onSuccess:logsReceived.type,
      onError:logsRequestFailed.type
    })
  );
};

// Add a log to the list of logs
export const addlog = log => apiCallBegan({
  url,
  method: "post",
  data: log,
  onSuccess: logAdded.type
});

export const getLogsByTeam = createSelector(
  state => state.entities.logs.list,
  state => state.auth.team,
  (logs, team) => logs.filter(log => log.team === team)
);

export const getTransactionLogs = createSelector(
  state => state.entities.logs.list,
  logs => logs.filter(log => log.type === 'Transaction')
);
