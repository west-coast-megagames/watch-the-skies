import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { createSelector } from 'reselect'
import { apiCallBegan } from "../api"; // Import Redux API call

// Create entity slice of the store
const slice = createSlice({
  name: "sites",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newsites: 0
  },
  // Reducers - Events
  reducers: {
    sitesRequested: (sites, action) => {
      console.log(`${action.type} Dispatched...`)
      sites.loading = true;
    },
    sitesReceived: (sites, action) => {
      console.log(`${action.type} Dispatched...`)
      sites.list = action.payload;
      sites.loading = false;
      sites.lastFetch = Date.now();
    },
    sitesRequestFailed: (sites, action) => {
      console.log(`${action.type} Dispatched`)
      sites.loading = false;
    },
    siteAdded: (sites, action) => {
      console.log(`${action.type} Dispatched`)
      sites.list.push(action.payload);
    },
		siteDeleted: (site, action) => {
      console.log(`${action.type} Dispatched`)
      const index = site.list.findIndex(el => el._id === action.payload._id);
      site.list.splice(index, 1);
    },
		siteUpdated: (site, action) => {
      console.log(`${action.type} Dispatched...`);
      const index = site.list.findIndex(el => el._id === action.payload._id);
			site.list[index] = action.payload;
      site.lastFetch = Date.now();
    },
  }
});

// Action Export
export const {
  siteAdded,
  sitesReceived,
	siteDeleted,
	siteUpdated,
  sitesRequested,
  sitesRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/sites";

// site Loader into state
export const loadsites = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:sitesRequested.type,
      onSuccess:sitesReceived.type,
      onError:sitesRequestFailed.type
    })
  );
};

// Add a site to the list of sites
export const addsite = site =>
  apiCallBegan({
    url,
    method: "post",
    data: site,
    onSuccess: siteAdded.type
  });

	export const getCapitol = createSelector(
    state => state.entities.sites.list,
		state => state.auth.team,
    (sites, team) => sites.find(site => site.tags === 'capital' && site.team._id === team._id)
  );

  export const getCities = createSelector(
    state => state.entities.sites.list,
    sites => sites.filter(site => site.subType === 'City')
  );

  export const getBases = createSelector(
    state => state.entities.sites.list,
    sites => sites.filter(site => site.subType === 'Base')
	);
	
	export const getGround = createSelector(
    state => state.entities.sites.list,
		sites => sites.filter(site => (site.subType === 'City' || site.subType === 'Point of Interest' || site.subType === 'Crash') && site.geoDecimal !== undefined)
	);
	
	
	export const getPoI = createSelector(
    state => state.entities.sites.list,
		sites => sites.filter(site => (site.subType === 'Point of Interest' && site.hidden === false))
	);
	
	export const getCrash = createSelector(
    state => state.entities.sites.list,
		sites => sites.filter(site => (site.subType === 'Crash'))
  );