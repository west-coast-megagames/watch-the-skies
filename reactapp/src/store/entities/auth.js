import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import playTrack from "../../scripts/audio";
import { initConnection } from '../../socket' // Socket.io event triggers and actions
import appInfo from '../../../package.json'
import jwtDecode from 'jwt-decode' // JSON web-token decoder

// Create entity slice of the store
const slice = createSlice({
  name: "auth",
  initialState: {
    login: false,
    loading: false,
    users: [],
		user: undefined,
    team: undefined,
    role: undefined,
		version: appInfo.version,
    tags: [],
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
      let jwt = action.payload.token;

      localStorage.setItem('nexusAuth', jwt);
      const user = jwtDecode(jwt);
			console.log(user);
      playTrack('login');
      // auth.team = user.team;
      auth.user = user;
      // auth.role = user.team.roles[0]
      auth.loading = false
      auth.login = true;
      // socket.emit('new user', { team: user.team.shortName, user: user.username });
      initConnection(auth.user, auth.team, auth.version);
    },
		signOut: (auth, action) => {
			console.log(`${action.type} Dispatched`);
			localStorage.removeItem('nexusAuth');
			auth.login = false;
			auth.loading = false;
			auth.users = [];
			auth.user = undefined;
			auth.team = undefined;
			auth.role = undefined;
			auth.tags = [];
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
const url = "https://nexus-central-server.herokuapp.com/auth";

// Autherization Login into state
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