import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { createSelector } from 'reselect'
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "military",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newmilitary: 0
  },
  // Reducers - Events
  reducers: {
    militaryRequested: (military, action) => {
      console.log(`${action.type} Dispatched...`)
      military.loading = true;
    },
    militaryReceived: (military, action) => {
      console.log(`${action.type} Dispatched...`);
      // Alert.info('Military State Loaded!', 3000);
      military.list = action.payload;
      military.loading = false;
      military.lastFetch = Date.now();
    },
    militaryRequestFailed: (military, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      military.loading = false;
    },
    militaryAdded: (military, action) => {
      console.log(`${action.type} Dispatched`)
      military.list.push(action.payload);
    },
    militaryUpdated: (military, action) => {
      console.log(`${action.type} Dispatched...`);
      const index = military.list.findIndex(el => el._id === action.payload._id);
			military.list[index] = action.payload;
      military.lastFetch = Date.now();
    },
		militaryDeleted: (military, action) => {
      console.log(`${action.type} Dispatched`)
      const index = military.list.findIndex(el => el._id === action.payload._id);
      military.list.splice(index, 1);
    },
  }
});

// Action Export
export const {
  militaryAdded,
  militaryReceived,
  militaryRequested,
	militaryRequestFailed,
	militaryUpdated,
	militaryDeleted
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/military";

// military Loader into state
export const loadmilitary = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:militaryRequested.type,
      onSuccess:militaryReceived.type,
      onError:militaryRequestFailed.type
    })
  );
};

	// Selector
	export const getMilitary = createSelector(
		state => state.entities.military.list,
		state => state.auth.team,
		(military, team) => military.filter(military => military.team._id === team._id)
	);

	export const getDeployed = createSelector(
		state => state.entities.military.list,
		state => state.auth.team,
		(military, team) => military.filter(
			military => military.status.some(el => el === 'deployed')
		)
	);

	export const getMobilized = createSelector(
		state => state.entities.military.list,
		state => state.auth.team,
		(military, team) => military.filter(
			military => military.status.some(el => el === 'mobilized')
		)
	);