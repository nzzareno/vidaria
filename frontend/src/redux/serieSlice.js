import { createSlice } from "@reduxjs/toolkit";

const serieSlice = createSlice({
  name: "series",
  initialState: {
    series: [],
    selectedSerie: null,
    loading: false,
    error: null,
    currentPage: 1,
    filters: {},
    featuredSeries: [],
  },
  reducers: {
    setSeries: (state, action) => {
      state.series = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFeaturedSeries: (state, action) => {
      state.featuredSeries = action.payload;
    },
    setSelectedSerie: (state, action) => {
      state.selectedSerie = action.payload;
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

export default serieSlice.reducer;

export const {
  setSeries,
  setSelectedSerie,
  setLoading,
  setError,
  setCurrentPage,
  setFilters,
  clearError,
  setFeaturedSeries,
} = serieSlice.actions;
