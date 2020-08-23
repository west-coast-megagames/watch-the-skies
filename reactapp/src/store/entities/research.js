import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { createSelector } from 'reselect'
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

// Selector
export const getCompletedResearch = createSelector(
  state => state.entities.research.list,
  state => state.auth.team,
  (research, team) => research.filter(
    tech => tech.status.completed === true && tech.team === team._id
  )
);

// Selector
export const getAvailibleResearch = createSelector(
  state => state.entities.research.list,
  state => state.auth.team,
  (research, team) => research.filter(
    tech => tech.status.available === true && tech.team === team._id
  )
);

// Selector
export const getTeamResearch = createSelector(
  state => state.entities.research.list,
  state => state.auth.team,
  (research, team) => research.filter(
    tech => tech.team === team._id
  )
);