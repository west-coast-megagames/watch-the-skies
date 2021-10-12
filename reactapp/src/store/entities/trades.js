import { createSelector, createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { gameServer } from "../../config";
import { apiCallBegan } from "../api"; // Import Redux API call

// Create entity slice of the store
const slice = createSlice({
  name: "trades",
	initialState: {
    list: [],
    loading: false,
    loaded: false,
    lastFetch: null,
    newtrades: 0
  },
  // Reducers - Events
  reducers: {
    tradesRequested: (trades, action) => {
      console.log(`${action.type} Dispatched...`)
      trades.loading = true;
    },
    tradesReceived: (trades, action) => {
      console.log(`${action.type} Dispatched...`);
      trades.list = action.payload;
      trades.loading = false;
      trades.lastFetch = Date.now();
      trades.loaded = true;
    },
    tradesRequestFailed: (trades, action) => {
      console.log(`${action.type} Dispatched`)
      trades.loading = false;
    },
    tradeAdded: (trades, action) => {
      console.log(`${action.type} Dispatched`)
      trades.list.push(action.payload);
			trades.loading = false;
    },
    tradeDeleted: (trades, action) => {
      console.log(`${action.type} Dispatched`)
      const index = trades.list.findIndex(el => el._id === action.payload._id);
      trades.list.splice(index, 1);
    },
    tradeUpdated: (trades, action) => {
      console.log(`${action.type} Dispatched`)
      const index = trades.list.findIndex(el => el._id === action.payload._id);
      trades.list[index] = action.payload;
			trades.loading = false;
    }
  }
});

// Action Export
export const {
  tradeAdded,
  tradesReceived,
  tradesRequested,
  tradesRequestFailed,
  tradeDeleted,
  tradeUpdated
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = `api/trade`;

// Selector
export const getMyTrades = createSelector(
  state => state.entities.trades.list,
  state => state.auth.team,
  (trades, team) => trades.filter(
    trade => trade.initiator.team._id === team._id || trade.tradePartner.team._id === team._id
  )
);

// trades Loader into state
export const loadTrades = payload => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      data: payload,
      onStart:tradesRequested.type,
      onSuccess: tradesReceived.type,
      onError:tradesRequestFailed.type
    })
  );
};