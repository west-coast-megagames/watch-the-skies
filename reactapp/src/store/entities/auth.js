import store from "../store";
import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import notify from "../../scripts/notify";
import playTrack from "../../scripts/audio";
import { clockSocket, updateSocket } from '../../api' // Socket.io event triggers and actions
import jwtDecode from 'jwt-decode' // JSON web-token decoder

// Create entity slice of the store
const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    team: null,
    role: null,
    tags: [],
    login: false,
    loading: false,
    lastLogin: null,
    errors: {}
  },
  // Reducers - Events
  reducers: {
    loginRequested: (auth, action) => {
      console.log(`${action.type} Dispatched...`)
      auth.loading = true;
    },
    authReceived: (auth, action) => {
      console.log(`${action.type} Dispatched...`);
      let jwt = action.payload;
      localStorage.setItem("token", jwt);
      console.log(`Token: ${jwt}`);
      const user = jwtDecode(jwt);
      playTrack('login');
      auth.team = user.team;
      auth.user = user.username;
      auth.role = user.team.roles[0]
      auth.lastLogin = Date.now();
      auth.loading = false
      auth.login = true;
      clockSocket.emit('new user', { team: user.team.shortName, user: user.username });
      updateSocket.emit('new user', { team: user.team.shortName, user: user.username });
    },
    authRequestFailed: (auth, action) => {
      console.log(`${action.type} Dispatched`)
      auth.loading = false;
      auth.errors= { login: action.payload };
    }
  }
});

// Action Export
export const {
  authReceived,
  loginRequested,
  authRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/auth";

// aircraft Loader into state
export const loginuser = payload => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'post',
      data: payload,
      onStart:loginRequested.type,
      onSuccess:authReceived.type,
      onError:authRequestFailed.type
    })
  );
};