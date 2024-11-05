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
    taglineMovie: "",
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
    setLoading: (state, action) => {
      state.loading = action.payload;
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

    setMovieTagline: (state, action) => {
      state.taglineMovie = action.payload;
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
  setMovieTagline,
} = movieSlice.actions;
