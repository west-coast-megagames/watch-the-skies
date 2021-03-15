import { createSelector, createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import distance from "../../scripts/range";

// Create entity slice of the store
const slice = createSlice({
  name: "info",
  initialState: {
    Aircraft: null,
    showAircraft: false,
    Military: null,
    showMilitary: false,
    Site: null,
    showSite: false,
    Target: null,
		showLaunch: false,
		showDeploy: false
  },
  // Reducers - Events
  reducers: {
		infoRequest: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info[action.payload.model] = action.payload
    },
    showMilitary: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.Military = action.payload
      info.showMilitary = true
    },
    militaryClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.showMilitary = false
		},
		showSite: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.Site = action.payload
      info.showSite = true
		},
		siteClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.showSite = false
		},
    showAircraft: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info[action.payload.model] = action.payload
      info.showAircraft = true
    },
    aircraftClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.showAircraft = false
    },
    showLaunch: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.Target = action.payload
      info.showLaunch = true
    },
    launchClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.showLaunch = false
		},
		showDeploy: (info, action) => {
			console.log(`${action.type} Dispatched...`)
			info.Site = action.payload
      info.showDeploy = true
    },
    deployClosed: (info, action) => {
			console.log(`${action.type} Dispatched...`)
      info.showDeploy = false
    }
  }
});

// Action Export
export const {
	showMilitary,
	militaryClosed,
	showAircraft,
	aircraftClosed,
	showLaunch,
	launchClosed,
	showSite,
	siteClosed,
	showDeploy,
	deployClosed
} = slice.actions;

export default slice.reducer; // Reducer Export

	// Selector
	export const targetFacilities = createSelector(
		state => state.info.Site,
		state => state.entities.facilities.list,
		(target, facilities) => target ? facilities.filter(facility => facility.site._id === target._id) : []
	);

		// Selector
		export const nearestFacility = createSelector(
			state => state.info.Site,
			state => state.entities.facilities.list,
			state => state.auth.team, 
			(target, facilities, team) => target ? facilities.filter(facility => facility.team._id === team._id).sort((a, b) => { if (distance(target.geoDecimal.latDecimal, target.geoDecimal.longDecimal, a.site.geoDecimal.latDecimal, a.site.geoDecimal.longDecimal) < distance(target.geoDecimal.latDecimal, target.geoDecimal.longDecimal, b.site.geoDecimal.latDecimal, b.site.geoDecimal.longDecimal)) { return -1 } else { return 1 }  }) : []
		);