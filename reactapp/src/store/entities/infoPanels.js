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
    infoRequested: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info[action.payload.model] = action.payload;
      switch (action.payload.model) {
        case 'Aircraft':
          info.showAircraft = true;
          break;
        default:
          Alert.error(`Issue with redux reducer ${action.type} for the ${action.payload.model}`, 3000)
      }
    },
    infoClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`);
      switch (action.payload) {
        case 'Aircraft':
          info.showAircraft = false;
          break;
        default:
          Alert.error(`Issue with redux reducer ${action.type} for the ${action.payload} model`, 3000)
      }
    },
    targetAssigned: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.Target = action.payload;
      info.showDeploy = true;
    },
    deployClosed: (info, action) => {
      console.log(`${action.type} Dispatched...`)
      info.showDeploy = false;
      info.Target = null;
    }
  }
});

// Action Export
export const {
  infoRequested,
  infoClosed,
  targetAssigned,
  deployClosed
} = slice.actions;

export default slice.reducer; // Reducer Export