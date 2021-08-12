import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { createSelector } from 'reselect'
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "reports",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newreports: 0
  },
  reducers: {
    reportsRequested: (reports, action) => {
      console.log(`${action.type} Dispatched...`)
      reports.loading = true;
    },

    reportsReceived: (reports, action) => {
      console.log(`${action.type} Dispatched...`)
      reports.list = action.payload;
      reports.loading = false;
      reports.lastFetch = Date.now();
    },
    reportsRequestFailed: (reports, action) => {
      console.log(`${action.type} Dispatched`)
      reports.loading = false;
    },
    reportsUpdated: (reports, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('reports updated!', 2000);
      reports.list = action.payload;
      reports.lastFetch = Date.now();
    },
    reportAdded: (reports, action) => {
      console.log(`${action.type} Dispatched`)
      reports.list.push(action.payload);
    },
		reportDeleted: (report, action) => {
      console.log(`${action.type} Dispatched`)
      const index = report.list.findIndex(el => el._id === action.payload._id);
      report.list.splice(index, 1);
    },
  }
});

// Action Export
export const {
  reportAdded,
  reportsReceived,
  reportsRequested,
  reportsRequestFailed,
  reportsUpdated,
	reportDeleted
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators
const url = "api/reports";

// report Loader into state
export const loadReports = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:reportsRequested.type,
      onSuccess:reportsReceived.type,
      onError:reportsRequestFailed.type
    })
  );
};

// Add a report to the list of reports
export const addReport = report => apiCallBegan({
  url,
  method: "post",
  data: report,
  onSuccess: reportAdded.type
});

export const getReportsByTeam = createSelector(
  state => state.entities.reports.list,
  state => state.auth.team,
  (reports, team) => reports.filter(report => report.team === team)
);

export const getTransactionReports = createSelector(
  state => state.entities.reports.list,
  reports => reports.filter(report => report.type === 'Transaction')
);
