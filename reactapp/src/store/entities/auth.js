import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
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
    socket: null,
    users: [],
    errors: {}
  },
  // Reducers - Events
  reducers: {
    loginRequested: (auth, action) => {
      auth.loading = true;
    },
    authReceived: (auth, action) => {
      let jwt = action.payload;
      localStorage.setItem('wtsLoginToken', jwt);
      const user = jwtDecode(jwt);
			console.log(user);
      playTrack('login');
      auth.team = user.team;
      auth.user = user;
      auth.role = user.team.roles[0]
      auth.lastLogin = Date.now();
      auth.loading = false
      auth.login = true;
      clockSocket.emit('new user', { team: user.team.shortName, user: user.username });
      updateSocket.emit('new user', { team: user.team.shortName, user: user.username });
    },
		signOut: (auth, action) => {
			console.log(`${action.type} Dispatched`);
			localStorage.removeItem('wtsLoginToken');
			auth.user = null;
			auth.team = null;
			auth.role = null;
			auth.tags = [];
			auth.login = false;
			auth.loading = false;
			auth.lastLogin = null;
			auth.socket = null;
			auth.users = [];
			auth.errors = {};
		},
    authRequestFailed: (auth, action) => {
      console.log(`${action.type} Dispatched`)
      auth.loading = false;
      auth.errors= { login: action.payload };
    },
    usersRecieved: (auth, action) => {
      console.log(`${action.type} Dispatched`)
      auth.users = action.payload
    },
    loginSocket: (auth, action) => {
      console.log(`${action.type} Dispatched`);
      auth.users = action.payload.userList;
      auth.socket = action.payload.me;
    }
  }
});

// Action Export
export const {
  authReceived,
  loginRequested,
  authRequestFailed,
  usersRecieved,
  loginSocket,
	signOut
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "/auth";

// aircraft Loader into state
export const loginuser = payload => (dispatch, state) => {
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


export const tokenLogin = payload => (dispatch, state) => {
  return dispatch(
    apiCallBegan({
      url: `${url}/tokenLogin`,
      method: 'post',
      data: payload,
      onStart:loginRequested.type,
      onSuccess:authReceived.type,
      onError:authRequestFailed.type
    })
  );
};