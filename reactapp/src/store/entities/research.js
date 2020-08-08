import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "research",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newresearch: 0
  },
  // Reducers - Events
  reducers: {
    researchRequested: (research, action) => {
      console.log(`${action.type} Dispatched...`)
      research.loading = true;
    },
    researchReceived: (research, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('Research State Loaded!', 3000);
      research.list = action.payload;
      research.loading = false;
      research.lastFetch = Date.now();
    },
    researchRequestFailed: (research, action) => {
      console.log(`${action.type} Dispatched`)
      research.loading = false;
    },
    researchAdded: (research, action) => {
      console.log(`${action.type} Dispatched`)
      research.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  researchAdded,
  researchReceived,
  researchRequested,
  researchRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/research";

// research Loader into state
export const loadresearch = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:researchRequested.type,
      onSuccess:researchReceived.type,
      onError:researchRequestFailed.type
    })
  );
};