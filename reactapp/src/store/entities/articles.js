import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "articles",
  initialState: {
    list: [],
    hidden: [],
    loading: false,
    lastFetch: null,
    newarticles: 0
  },
  // Reducers - Events
  reducers: {
    articlesRequested: (articles, action) => {
      console.log(`${action.type} Dispatched...`)
      articles.loading = true;
    },
    articlesReceived: (articles, action) => {
      console.log(`${action.type} Dispatched...`);
      // Alert.info('article State Loaded!', 3000);
      articles.list = action.payload;
      articles.loading = false;
      articles.lastFetch = Date.now();
    },
    articlesRequestFailed: (articles, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      articles.loading = false;
    },
    articleAdded: (articles, action) => {
      console.log(`${action.type} Dispatched`)
      articles.list.push(action.payload);
    },
    articleHidden:(articles, action) => {
      console.log(`${action.type} Dispatched`)
      let index = articles.list.findIndex(el => el._id === action.payload._id);
      articles.list[index].hidden = true;
      articles.list = articles.list.filter(item => item.hidden === false);
      articles.hidden = articles.list.filter(item => item.hidden === true);
    }
  }
});

// Action Export
export const {
  articleAdded,
  articleHidden,
  articlesReceived,
  articlesRequested,
  articlesRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "game/news/articles";

// article Loader into state
export const loadarticles = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:articlesRequested.type,
      onSuccess:articlesReceived.type,
      onError:articlesRequestFailed.type
    })
  );
};

// Add a article to the list of articles
export const addarticle = article =>
  apiCallBegan({
    url,
    method: "post",
    data: article,
    onSuccess: articleAdded.type
  });