import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
// import { createSelector } from 'reselect'
import { Alert } from "rsuite";

const slice = createSlice({
	name: "blueprints",
	initialState: {
		list: [],
    loading: false,
    lastFetch: null,
	},
	reducers: {
		blueprintsRequested: (blueprints, action) => {
			console.log(`${action.type} Dispatched...`)
      blueprints.loading = true;
		},
		blueprintsReceived: (blueprints, action) => {
      console.log(`${action.type} Dispatched...`);
      // Alert.info('Blueprint State Loaded!', 3000);
      blueprints.list = action.payload;
      blueprints.loading = false;
      blueprints.lastFetch = Date.now();
    },
    blueprintsRequestFailed: (blueprints, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      blueprints.loading = false;
    },
    blueprintAdded: (blueprints, action) => {
      console.log(`${action.type} Dispatched`)
      blueprints.list.push(action.payload);
    },
    blueprintUpdated: (blueprints, action) => {
      console.log(`${action.type} Dispatched...`);
      const index = blueprints.list.findIndex(el => el._id === action.payload._id);
			blueprints.list[index] = action.payload;
      blueprints.lastFetch = Date.now();
    },
		blueprintDeleted: (blueprints, action) => {
      console.log(`${action.type} Dispatched`)
      const index = blueprints.list.findIndex(el => el._id === action.payload._id);
      blueprints.list.splice(index, 1);
    },
	}
});

// Action Export
export const {
  blueprintAdded,
  blueprintUpdated,
	blueprintDeleted,
  blueprintsReceived,
  blueprintsRequested,
  blueprintsRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Blueprint Creators (Commands)
const url = "api/blueprints";

// blueprint Loader into state
export const loadBlueprints = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:blueprintsRequested.type,
      onSuccess:blueprintsReceived.type,
      onError:blueprintsRequestFailed.type
    })
  );
};

// Add a blueprint to the list of blueprints
export const addBlueprints = blueprint =>
  apiCallBegan({
    url,
    method: "post",
    data: blueprint,
    onSuccess: blueprintAdded.type
  });