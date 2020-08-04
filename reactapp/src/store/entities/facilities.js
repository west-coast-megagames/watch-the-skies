import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "facilities",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newfacilities: 0
  },
  // Reducers - Events
  reducers: {
    facilitiesRequested: (facilities, action) => {
      console.log(`${action.type} Dispatched...`)
      facilities.loading = true;
    },
    facilitiesReceived: (facilities, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('facility State Loaded!', 3000);
      facilities.list = action.payload;
      facilities.loading = false;
      facilities.lastFetch = Date.now();
    },
    facilitiesRequestFailed: (facilities, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      facilities.loading = false;
    },
    facilityAdded: (facilities, action) => {
      console.log(`${action.type} Dispatched`)
      facilities.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  facilityAdded,
  facilitiesReceived,
  facilitiesRequested,
  facilitiesRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/facilities";

// facility Loader into state
export const loadfacilities = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:facilitiesRequested.type,
      onSuccess:facilitiesReceived.type,
      onError:facilitiesRequestFailed.type
    })
  );
};

// Add a facility to the list of facilities
export const addfacility = facility =>
  apiCallBegan({
    url,
    method: "post",
    data: facility,
    onSuccess: facilityAdded.type
  });