import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "countries",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newcountries: 0
  },
  // Reducers - Events
  reducers: {
    countriesRequested: (countries, action) => {
      console.log(`${action.type} Dispatched...`)
      countries.loading = true;
    },
    countriesReceived: (countries, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('country State Loaded!', 3000);
      countries.list = action.payload;
      countries.loading = false;
      countries.lastFetch = Date.now();
    },
    countriesRequestFailed: (countries, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      countries.loading = false;
    },
    countryAdded: (countries, action) => {
      console.log(`${action.type} Dispatched`)
      countries.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  countryAdded,
  countriesReceived,
  countriesRequested,
  countriesRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/country";

// Country Loader into state
export const loadcountries = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:countriesRequested.type,
      onSuccess:countriesReceived.type,
      onError:countriesRequestFailed.type
    })
  );
};

// Add a country to the list of countries
export const addcountry = country =>
  apiCallBegan({
    url,
    method: "post",
    data: country,
    onSuccess: countryAdded.type
  });