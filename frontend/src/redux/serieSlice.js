import { createSlice } from "@reduxjs/toolkit";

const serieSlice = createSlice({
  name: "series",
  initialState: {
    series: [],
    topRatedSeries: [],
    popularSeries: [],
    animationSeries: [],
    crimeSeries: [],
    comedySeries: [],
    dramaSeries: [],
    actionAndAventureSeries: [],
    documentalSeries: [],
    westernSeries: [],
    mysterySeries: [],
    familySeries: [],
    selectedSerie: null,
    loadingSerie: false,
    error: null,
    currentPage: 1,
    filters: {},
    featuredSeries: [],
    topSeries: [],
  },
  reducers: {
    setTopRatedSeries: (state, action) => {
      state.topRatedSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },
    setTopSeries: (state, action) => {
      state.topSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },
    setPopularSeries: (state, action) => {
      state.popularSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },
    setAnimationSeries: (state, action) => {
      state.animationSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setCrimeSeries: (state, action) => {
      state.crimeSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setComedySeries: (state, action) => {
      state.comedySeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setDramaSeries: (state, action) => {
      state.dramaSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setActionAndAventureSeries: (state, action) => {
      state.actionAndAventureSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setDocumentalSeries: (state, action) => {
      state.documentalSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setWesternSeries: (state, action) => {
      state.westernSeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setMysterySeries: (state, action) => {
      state.mysterySeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setFamilySeries: (state, action) => {
      state.familySeries = action.payload;
      state.loadingSerie = false;
      state.error = null;
    },

    setSelectedSerie: (state, action) => {
      state.selectedSerie = action.payload;
    },
    setLoadingSerie: (state, action) => {
      state.loadingSerie = action.payload;
    },

    setError: (state, action) => {
      state.loadingSerie = false;
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
    setFeaturedSeries: (state, action) => {
      state.featuredSeries = action.payload;
    },
  },
});

export default serieSlice.reducer;

export const {
  setTopRatedSeries,
  setPopularSeries,
  setSelectedSerie,
  setLoadingSerie,
  setError,
  setCurrentPage,
  setFilters,
  clearError,
  setFeaturedSeries,
  setTopSeries,
  setAnimationSeries,
  setFamilySeries,
  setCrimeSeries,
  setComedySeries,
  setDramaSeries,
  setActionAndAventureSeries,
  setDocumentalSeries,
  setWesternSeries,
  setMysterySeries,
} = serieSlice.actions;
