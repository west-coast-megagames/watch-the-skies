import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { createSelector } from 'reselect'
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
      // Alert.info('facility State Loaded!', 3000);
      facilities.list = action.payload;
      facilities.loading = false;
      facilities.lastFetch = Date.now();
    },
    facilitiesRequestFailed: (facilities, action) => {
      console.log(`${action.type} Dispatched`)
      // Alert.error(`${action.type}: ${action.payload}`, 4000);
      facilities.loading = false;
    },
    facilityAdded: (facilities, action) => {
      console.log(`${action.type} Dispatched`)
      facilities.list.push(action.payload);
    },
    facilityUpdated: (facilities, action) => {
      console.log(`${action.type} Dispatched...`);
      const index = facilities.list.findIndex(el => el._id === action.payload._id);
			facilities.list[index] = action.payload;
      facilities.lastFetch = Date.now();
    },
		facilityDeleted: (facilities, action) => {
      console.log(`${action.type} Dispatched`)
      const index = facilities.list.findIndex(el => el._id === action.payload._id);
      facilities.list.splice(index, 1);
    },
  }
});

// Action Export
export const {
  facilityAdded,
	facilityDeleted,
  facilitiesReceived,
  facilitiesRequested,
  facilitiesRequestFailed,
  facilityUpdated

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

// Selector
export const getLabs = createSelector(
  state => state.entities.facilities.list,
  state => state.auth.team,
  (facilities, team) => facilities.filter(
    facility => facility.capability.research.active === true && facility.team._id === team._id
  )
);

export const getFacilites = createSelector(
  state => state.entities.facilities.list,
  state => state.auth.team,
  (facilities, team) => facilities.filter(
    facility => facility.team._id === team._id
  )
);