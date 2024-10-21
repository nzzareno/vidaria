import { createSlice } from "@reduxjs/toolkit";

const movieSlice = createSlice({
  name: "movies",
  initialState: {
    movies: [],
    selectedMovie: null,
    loading: false,
    error: null,
    currentPage: 1,
    filters: {},
    featuredMovies: [],
  },
  reducers: {
    setMovies: (state, action) => {
      console.log("Movies being set:", action.payload);
      state.movies = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFeaturedMovies: (state, action) => {
      state.featuredMovies = action.payload; // Actualiza las películas destacadas
    },
    setSelectedMovie: (state, action) => {
      state.selectedMovie = action.payload;
    },
    setLoading: (state) => {
      state.loading = true;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export default movieSlice.reducer;

export const {
  setMovies,
  setSelectedMovie,
  setLoading,
  setError,
  setCurrentPage,
  setFilters,
  clearError,
  setFeaturedMovies,
} = movieSlice.actions;
