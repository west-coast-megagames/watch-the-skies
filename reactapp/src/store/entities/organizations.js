import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "organizations",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
  },
  // Reducers - Events
  reducers: {
    organizationsRequested: (organizations, action) => {
      console.log(`${action.type} Dispatched...`)
      organizations.loading = true;
    },
    organizationsReceived: (organizations, action) => {
      console.log(`${action.type} Dispatched...`);
      organizations.list = action.payload;
      organizations.loading = false;
      organizations.lastFetch = Date.now();
    },
    organizationsRequestFailed: (organizations, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      organizations.loading = false;
    },
    organizationAdded: (organizations, action) => {
      console.log(`${action.type} Dispatched`)
      organizations.list.push(action.payload);
    },
		organizationUpdated: (organizations, action) => {
      console.log(`${action.type} Dispatched...`);
			const index = organizations.list.findIndex(el => el._id === action.payload._id);
			organizations.list[index] = action.payload;
      organizations.lastFetch = Date.now();
    },
		organizationDeleted: (organizations, action) => {
      console.log(`${action.type} Dispatched`)
      const index = organizations.list.findIndex(el => el._id === action.payload._id);
      organizations.list.splice(index, 1);
    },
  }
});

// Action Export
export const {
  organizationAdded,
	organizationUpdated,
	organizationDeleted,
  organizationsReceived,
  organizationsRequested,
  organizationsRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/organizations";

// organization Loader into state
export const loadOrganizations = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:organizationsRequested.type,
      onSuccess:organizationsReceived.type,
      onError:organizationsRequestFailed.type
    })
  );
};

// Add a organization to the list of organizations
export const addOrganization = organization =>
  apiCallBegan({
    url,
    method: "post",
    data: organization,
    onSuccess: organizationAdded.type
  });