import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { apiCallBegan } from "../api";
// import moment from "moment";

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

export const {
  logAdded,
  logsReceived,
  logsRequested,
  logsRequestFailed
} = slice.actions;
export default slice.reducer;

// Action Creators
const url = "api/logs";

export const loadlogs = () => (dispatch, getState) => {
  // const { lastFetch } = getState().entities.logs;

  // const diffInMinutes = moment().diff(moment(lastFetch), "minutes");
  // if (diffInMinutes < 10) return;

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

export const addlog = log =>
  apiCallBegan({
    url,
    method: "post",
    data: log,
    onSuccess: logAdded.type
  });


// Selectors
export const getlogsByUser = userId =>
  createSelector(
    state => state.entities.logs,
   logs =>logs.filter(log => log.userId === userId)
  );

export const getUnresolvedlogs = createSelector(
  state => state.entities.logs,
  state => state.entities.projects,
  (logs, projects) =>logs.list.filter(log => !log.resolved)
);