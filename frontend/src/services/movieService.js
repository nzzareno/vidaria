import axios from "axios";
import { setLoading, setMovies } from "../redux/movieSlice";
import { setError } from "../redux/serieSlice";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/movies`;

export const getMovies = async () => {
  try {
    const response = await fetch(API_URL);
    return checkResponse(response);
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return [];
  }
};

export const getMoviesByCategory = async (
  category,
  params = { page: 1, size: 20 }
) => {
  const response = await axios.get(`${API_URL}/category/${category}`, {
    params: {
      page: params.page,
      size: params.size,
    },
  });
  return response.data.content;
};

export const getMoviesByGenre = async (genreName, params = { page: 1, size: 20 }) => {
  // Realiza la solicitud utilizando el nombre del género en la URL
  const response = await axios.get(`${API_URL}/best/${genreName.toLowerCase()}`, {
    params: {
      page: params.page,
      size: params.size,
    },
  });
  return response.data.content;
};

export const fetchMoviesByCategory = async (category, dispatch) => {
  dispatch(setLoading(true));
  try {
    const movies = await getMoviesByCategory(category);
    dispatch(setMovies(movies));
  } catch (error) {
    console.error(`Error loading ${category} movies:`, error);
    dispatch(setError(error.message));
  }
};

export const getMovie = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    return checkResponse(response);
  } catch (error) {
    console.error(`Failed to fetch movie with id ${id}:`, error);
    return null;
  }
};

export const addMovie = async (movie) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    });
    return checkResponse(response);
  } catch (error) {
    console.error("Failed to add movie:", error);
    return null;
  }
};

export const updateMovie = async (id, movie) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    });
    return checkResponse(response);
  } catch (error) {
    console.error(`Failed to update movie with id ${id}:`, error);
    return null;
  }
};

export const deleteMovie = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return checkResponse(response);
  } catch (error) {
    console.error(`Failed to delete movie with id ${id}:`, error);
    return null;
  }
};

export const searchMovies = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  try {
    const response = await fetch(`${API_URL}/search?${params}`);
    const data = await checkResponse(response);

    // Add media_type to each movie result
    if (data && data.content) {
      return {
        ...data,
        content: data.content.map((movie) => ({
          ...movie,
          media_type: "movie",
        })),
      };
    }
    return { content: [] };
  } catch (error) {
    console.error("Error fetching movies:", error);
    return { content: [] };
  }
};
export const getFeaturedMovies = async (selectedMovieNames) => {
  try {
    const response = await fetch(
      `${API_URL}/featured?movieNames=${selectedMovieNames.join(",")}`
    );
    return checkResponse(response);
  } catch (error) {
    console.error("Failed to fetch featured movies:", error);
    return [];
  }
};

const checkResponse = (response) => {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};
