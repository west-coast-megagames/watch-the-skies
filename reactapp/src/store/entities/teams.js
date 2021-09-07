import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { createSelector } from 'reselect'
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
    },
		teamUpdated: (team, action) => {
      console.log(`${action.type} Dispatched...`);
      const index = team.list.findIndex(el => el._id === action.payload._id);
			team.list[index] = action.payload;
      team.lastFetch = Date.now();
      team.loading = false;
    },
		teamDeleted: (team, action) => {
      console.log(`${action.type} Dispatched`)
      const index = team.list.findIndex(el => el._id === action.payload._id);
      team.list.splice(index, 1);
    },
  }
});

// Action Export
export const {
  teamAdded,
	teamUpdated,
  teamsReceived,
	teamDeleted,
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

	export const getNational = createSelector(
    state => state.entities.teams.list,
    (teams) => teams.filter(team => team.type === 'National')
  );

	export const getMyTeam = createSelector(
    state => state.entities.teams.list,
		state => state.auth.team,
    (teams, team) => teams.find(el => el._id === team._id)
  );
