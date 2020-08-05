import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "accounts",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newaccounts: 0
  },
  // Reducers - Events
  reducers: {
    accountsRequested: (accounts, action) => {
      console.log(`${action.type} Dispatched...`)
      accounts.loading = true;
    },
    accountsReceived: (accounts, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('account State Loaded!', 3000);
      accounts.list = action.payload;
      accounts.loading = false;
      accounts.lastFetch = Date.now();
    },
    accountsRequestFailed: (accounts, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      accounts.loading = false;
    },
    accountAdded: (accounts, action) => {
      console.log(`${action.type} Dispatched`)
      accounts.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  accountsAdded,
  accountsReceived,
  accountsRequested,
  accountsRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/accounts";

// account Loader into state
export const loadaccounts = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:accountsRequested.type,
      onSuccess:accountsReceived.type,
      onError:accountsRequestFailed.type
    })
  );
};