import axios from "axios";

const API_URL = "http://localhost:8081/movies";

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
  try {
    const response = await fetch(
      `${API_URL}/search?${new URLSearchParams(filters).toString()}`
    );
    return checkResponse(response);
  } catch (error) {
    console.error("Failed to search movies:", error);
    return [];
  }
};

export const getFeaturedMovies = async () => {
  try {
    const response = await fetch(`${API_URL}/featured`);
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
