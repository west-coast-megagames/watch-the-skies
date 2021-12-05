import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";
import { createSelector } from 'reselect'

// Create entity slice of the store
const slice = createSlice({
  name: "intel",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
  },
  // Reducers - Events
  reducers: {
    intelRequested: (intel, action) => {
      console.log(`${action.type} Dispatched...`);
      intel.loading = true;
    },
    intelReceived: (intel, action) => {
      console.log(`${action.type} Dispatched...`);
      // Alert.info('intel State Loaded!', 3000);
      intel.list = action.payload;
      intel.loading = false;
      intel.lastFetch = Date.now();
      intel.loading = true;
    },
    intelRequestFailed: (intel, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      intel.loading = false;
    },
    intelAdded: (intel, action) => {
      console.log(`${action.type} Dispatched`)
      intel.list.push(action.payload);
    },
    intelUpdated: (intel, action) => {
      console.log(`${action.type} Dispatched`)
      const index = intel.list.findIndex(el => el._id === action.payload._id);
			index > -1 ? intel.list[index] = action.payload : intel.list.push(action.payload);
      intel.lastFetch = Date.now();
    },
		intelDeleted: (intel, action) => {
      console.log(`${action.type} Dispatched`)
      const index = intel.list.findIndex(el => el._id === action.payload._id);
      intel.list.splice(index, 1);
    },
  }
});

// Action Export
export const {
  intelAdded,
  intelUpdated,
	intelDeleted,
  intelReceived,
  intelRequested,
  intelRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/intel";

// intel Loader into state
export const loadIntel = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:intelRequested.type,
      onSuccess:intelReceived.type,
      onError:intelRequestFailed.type
    })
  );
};

// Selector
export const getAccountsForTeam = createSelector(
    state => state.entities.intel.list,
    state => state.auth.team,
    (intel, team) => intel.filter(intel => intel.team.name === team.name)
);

