import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { Alert } from "rsuite";

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
    showDeploy: false,
  },
  // Reducers - Events
  reducers: {
    showMilitary: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.Military = action.payload
      info.showMilitary = true
    },
    militaryClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.showMilitary = false
    },
    infoRequested: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info[action.payload.model] = action.payload
      info.showAircraft = true
    },
    infoClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.showAircraft = false
    },
    targetAssigned: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.Target = action.payload
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
  infoRequested,
  infoClosed,
  targetAssigned,
  deployClosed,
  militaryClosed
} = slice.actions;

export default slice.reducer; // Reducer Export