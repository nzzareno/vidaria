import { checkResponse } from "./serieService";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}`;
const API_KEY = `${import.meta.env.VITE_API_KEY}`;
const VITE_TMDB_DETAILS = `${import.meta.env.VITE_TMDB_DETAILS}`;

export const fetchSerie = async (idSerie) => {
  try {
    const response = await fetch(
      `${VITE_TMDB_DETAILS}tv/${idSerie}?api_key=${API_KEY}&language=en-US`
    );
    return checkResponse(response);
  } catch (error) {
    console.error("Error fetching series details:", error);
    throw error;
  }
};

export const fetchMovieDetails = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE}/movies/${id}?api_key=${API_KEY}&language=en-US`
    );
    return checkResponse(response);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const fetchSerieDetails = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE}/series/${id}?api_key=${API_KEY}&language=en-US`
    );
    return checkResponse(response);
  } catch (error) {
    console.error("Error fetching series details:", error);
    throw error;
  }
};

export const fetchMovieAudio = async (id, type) => {
  try {
    const url = `${VITE_TMDB_DETAILS}${type === "movie" ? "movie" : "tv"}/${id}?api_key=${API_KEY}&language=en-US`;

    const response = await fetch(url);
    if (response.status === 404) {
      console.warn(`Audio languages not found for ${type} with ID ${id}`);
      return [];
    }

    if (!response.ok) throw new Error("Failed to fetch audio languages");

    const data = await response.json();
    return data.spoken_languages || [];
  } catch (error) {
    console.error(`Error fetching audio languages for ${type}:`, error);
    return [];
  }
};

export const fetchCast = async (id, type) => {
  try {
    const url = `${VITE_TMDB_DETAILS}${type === "movie" ? "movie" : "tv"}/${id}/credits?api_key=${API_KEY}&language=en-US`;

    const response = await fetch(url);
    if (response.status === 404) {
      console.warn(`Cast not found for ${type} with ID ${id}`);
      return [];
    }

    if (!response.ok) throw new Error(`Failed to fetch ${type} cast`);

    const data = await response.json();
    return data.cast || [];
  } catch (error) {
    console.error(`Error fetching ${type} cast:`, error);
    return [];
  }
};

export const fetchTagline = async (id, type = "movie") => {
  if (!type) {
    console.warn(`Type not provided for fetchTagline with ID ${id}`);
    return null;
  }

  try {
    const url = `${VITE_TMDB_DETAILS}${type === "movie" ? "movie" : "tv"}/${id}?api_key=${API_KEY}&language=en-US`;

    const response = await fetch(url);

    // Si el status es 404, devuelve null sin arrojar error
    if (response.status === 404) {
      console.warn(`Tagline not found for ${type} with ID ${id}`);
      return null;
    }

    if (!response.ok) throw new Error("Failed to fetch tagline");

    const data = await response.json();
    return data.tagline || null;
  } catch (error) {
    console.error("Error fetching tagline:", error);
    return null;
  }
};
