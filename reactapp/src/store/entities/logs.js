import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call

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

    // command - event
    // addlog - logAdded
    logAdded: (logs, action) => {
      console.log(`${action.type} Dispatched`)
      logs.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  logAdded,
  logsReceived,
  logsRequested,
  logsRequestFailed
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
export const addlog = log =>
  apiCallBegan({
    url,
    method: "post",
    data: log,
    onSuccess: logAdded.type
  });