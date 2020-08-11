import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "zones",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newzones: 0
  },
  // Reducers - Events
  reducers: {
    zonesRequested: (zones, action) => {
      console.log(`${action.type} Dispatched...`)
      zones.loading = true;
    },
    zonesReceived: (zones, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('zone State Loaded!', 3000);
      zones.list = action.payload;
      zones.loading = false;
      zones.lastFetch = Date.now();
    },
    zonesRequestFailed: (zones, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      zones.loading = false;
    },
    zoneAdded: (zones, action) => {
      console.log(`${action.type} Dispatched`)
      zones.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  zoneAdded,
  zonesReceived,
  zonesRequested,
  zonesRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/zones";

// zone Loader into state
export const loadzones = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:zonesRequested.type,
      onSuccess:zonesReceived.type,
      onError:zonesRequestFailed.type
    })
  );
};

// Add a zone to the list of zones
export const addzone = zone =>
  apiCallBegan({
    url,
    method: "post",
    data: zone,
    onSuccess: zoneAdded.type
  });