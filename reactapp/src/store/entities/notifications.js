import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit

// Create entity slice of the store
const slice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
		modalNotification: false // todo: create open modal functions, and data saved into local state 
  },
  // Reducers - Events
  reducers: {
    notificationAdded: (notifications, action) => {
      console.log(`${action.type} Dispatched`);
      notifications.list.push(action.payload);
    },
    notificationHidden: (notifications, action) => {
      console.log(`${action.type} Dispatched`);
      const index = notifications.list.findIndex(el => el.id === action.payload);
      notifications.list[index].hidden = true;
    }
  }
});

// Action Export
export const {
  notificationAdded,
  notificationHidden
} = slice.actions;

export default slice.reducer; // Reducer Export