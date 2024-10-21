// store/store.js
import { createStore, combineReducers } from "redux";
import authReducer from "./authSlice";
import movieReducer from "./movieSlice";
import serieReducer from "./serieSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  movies: movieReducer,
  series: serieReducer,
});

const store = createStore(rootReducer);

export default store;
