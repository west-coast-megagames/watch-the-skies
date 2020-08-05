import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit

const lastId = 0;

// Create entity slice of the store
const slice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
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