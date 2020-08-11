import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call

// Create entity slice of the store
const slice = createSlice({
  name: "teams",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newteams: 0
  },
  // Reducers - Events
  reducers: {
    teamsRequested: (teams, action) => {
      console.log(`${action.type} Dispatched...`)
      teams.loading = true;
    },
    teamsReceived: (teams, action) => {
      console.log(`${action.type} Dispatched...`)
      teams.list = action.payload;
      teams.loading = false;
      teams.lastFetch = Date.now();
    },
    teamsRequestFailed: (teams, action) => {
      console.log(`${action.type} Dispatched`)
      teams.loading = false;
    },
    teamAdded: (teams, action) => {
      console.log(`${action.type} Dispatched`)
      teams.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  teamAdded,
  teamsReceived,
  teamsRequested,
  teamsRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/team";

// team Loader into state
export const loadteams = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:teamsRequested.type,
      onSuccess:teamsReceived.type,
      onError:teamsRequestFailed.type
    })
  );
};

// Add a team to the list of teams
export const addteam = team =>
  apiCallBegan({
    url,
    method: "post",
    data: team,
    onSuccess: teamAdded.type
  });