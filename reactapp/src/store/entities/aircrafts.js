import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { createSelector } from 'reselect'
import { Alert } from "rsuite";


// Create entity slice of the store
const slice = createSlice({
  name: "aircrafts",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newaircrafts: 0
  },
  // Reducers - Events
  reducers: {
    aircraftsRequested: (aircrafts, action) => {
      console.log(`${action.type} Dispatched...`)
      aircrafts.loading = true;
    },
    aircraftsReceived: (aircrafts, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('Aircraft State Loaded!', 3000);
      aircrafts.list = action.payload;
      aircrafts.loading = false;
      aircrafts.lastFetch = Date.now();
    },
    aircraftsRequestFailed: (aircrafts, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      aircrafts.loading = false;
    },
    aircraftAdded: (aircrafts, action) => {
      console.log(`${action.type} Dispatched`)
      aircrafts.list.push(action.payload);
    },
    aircraftsUpdated: (aircrafts, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('Aircrafts updated!', 2000);
      aircrafts.list = action.payload;
      aircrafts.lastFetch = Date.now();
    },
  }
});

// Action Export
export const {
  aircraftAdded,
  aircraftsUpdated,
  aircraftsReceived,
  aircraftsRequested,
  aircraftsRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/aircrafts";

// aircraft Loader into state
export const loadaircrafts = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:aircraftsRequested.type,
      onSuccess:aircraftsReceived.type,
      onError:aircraftsRequestFailed.type
    })
  );
};

// Add a aircraft to the list of aircrafts
export const addaircraft = aircraft =>
  apiCallBegan({
    url,
    method: "post",
    data: aircraft,
    onSuccess: aircraftAdded.type
  });

  // Selector
export const getContacts = createSelector(
  state => state.entities.aircrafts.list,
  state => state.auth.team,
  (aircrafts, team) => aircrafts.filter(
    aircraft => aircraft.status.deployed === true && aircraft.status.destroyed === false
  )
);

export const getAircrafts = createSelector(
  state => state.entities.aircrafts.list,
  state => state.auth.team,
  state => state.auth.login,
  (aircrafts, team, login) => aircrafts.filter(aircraft => aircraft.team.name === team.name && aircraft.status.destroyed === false)
);