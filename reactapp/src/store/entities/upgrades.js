import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";
import { createSelector } from 'reselect'

const slice = createSlice({
	name: "upgrades",
	initialState: {
		list: [],
    loading: false,
    lastFetch: null,
	},
	reducers: {
		upgradesRequested: (upgrades, action) => {
			console.log(`${action.type} Dispatched...`)
      upgrades.loading = true;
		},
		upgradesReceived: (upgrades, action) => {
      console.log(`${action.type} Dispatched...`);
      // Alert.info('Upgrade State Loaded!', 3000);
      upgrades.list = action.payload;
      upgrades.loading = false;
      upgrades.lastFetch = Date.now();
    },
    upgradesRequestFailed: (upgrades, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      upgrades.loading = false;
    },
    upgradeAdded: (upgrades, action) => {
      console.log(`${action.type} Dispatched`)
      upgrades.list.push(action.payload);
    },
    upgradeUpdated: (upgrades, action) => {
      console.log(`${action.type} Dispatched...`);
      // Alert.info('Upgrade updated!', 2000);
      upgrades.list = action.payload;
      upgrades.lastFetch = Date.now();
    },
		upgradeDeleted: (upgrade, action) => {
      console.log(`${action.type} Dispatched`)
      const index = upgrade.list.findIndex(el => el._id === action.payload._id);
      upgrade.list.splice(index, 1);
    },
	}
});

// Action Export
export const {
  upgradeAdded,
  upgradeUpdated,
	upgradeDeleted,
  upgradesReceived,
  upgradesRequested,
  upgradesRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Blueprint Creators (Commands)
const url = "api/upgrades";

// blueprint Loader into state
export const loadUpgrades = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:upgradesRequested.type,
      onSuccess:upgradesReceived.type,
      onError:upgradesRequestFailed.type
    })
  );
};

// Add a blueprint to the list of blueprints
export const addUpgrades = upgrade =>
  apiCallBegan({
    url,
    method: "post",
    data: upgrade,
    onSuccess: upgradeAdded.type
	});
	
	export const getUpgrades = createSelector(
		state => state.entities.upgrades.list,
		state => state.auth.team,
		(upgrade, team) => upgrade.filter(upgrade => upgrade.team === team._id || upgrade.team._id === team._id)
	);

	export const getStored = createSelector(
		state => state.entities.upgrades.list,
		state => state.auth.team,
		(upgrade, team) => upgrade.filter(upgrade => (upgrade.team === team._id || upgrade.team._id === team._id) && upgrade.status.storage === true &&  upgrade.status.damaged === false && upgrade.status.destroyed === false)
	);