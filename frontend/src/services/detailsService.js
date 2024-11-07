import { checkResponse } from "./serieService";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}`;
const API_KEY = `${import.meta.env.VITE_API_KEY}`;
const VITE_TMDB_DETAILS = `${import.meta.env.VITE_TMDB_DETAILS}`;
const VITE_TMDB_MOVIE_DETAILS_URL = `${
  import.meta.env.VITE_TMDB_MOVIE_DETAILS_URL
}`;
const VITE_TMDB_SERIES_DETAILS_URL = `${
  import.meta.env.VITE_TMDB_SERIES_DETAILS_URL
}`;

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

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.warn(
        `Movie with ID ${id} not found in database. Fetching from external API...`
      );
      return fetchMovieIfNotInDB(id, "movie");
    }

    // Verificar si el cuerpo de la respuesta es vacío
    const text = await response.text();
    if (!text) {
      return fetchMovieIfNotInDB(id, "movie");
    }

    // Si el cuerpo no es vacío, parsear como JSON
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const fetchSerieDetails = async (id) => {
  try {
    let response = await fetch(
      `${API_BASE}/series/${id}?api_key=${API_KEY}&language=en-US`
    );
    if (response.ok) return checkResponse(response);

    console.warn(
      `Serie with ID ${id} not found in your API. Fetching from external TMDb API...`
    );
    return fetchMovieIfNotInDB(id, "tv");
  } catch (error) {
    console.error("Error fetching series details:", error);
    throw error;
  }
};

export const fetchMovieAudio = async (id, type) => {
  try {
    const url = `${VITE_TMDB_DETAILS}${type}/${id}?api_key=${API_KEY}&language=en-US`;
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
    const url = `${VITE_TMDB_DETAILS}${type}/${id}/credits?api_key=${API_KEY}&language=en-US`;
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

export const fetchCrew = async (id, type) => {
  try {
    const url = `${VITE_TMDB_DETAILS}${type}/${id}/credits?api_key=${API_KEY}&language=en-US`;

    const response = await fetch(url);

    if (response.status === 404) {
      console.warn(`Crew not found for ${type} with ID ${id}`);
      return [];
    }

    if (!response.ok) throw new Error(`Failed to fetch ${type} crew`);

    const data = await response.json();
    return data.crew || [];
  } catch (error) {
    console.error(`Error fetching ${type} crew:`, error);
    return [];
  }
};

export const fetchTagline = async (id, type) => {
  if (!type) {
    console.warn(`Type not provided for fetchTagline with ID ${id}`);
    return null;
  }

  try {
    const url = `${VITE_TMDB_DETAILS}${type}/${id}?api_key=${API_KEY}&language=en-US`;

    if (!url) {
      console.warn(`URL not provided for fetchTagline with ID ${id}`);
      return null;
    }

    const response = await fetch(url);

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

export const fetchReviews = async (id, type) => {
  try {
    const url = `${VITE_TMDB_DETAILS}${type}/${id}/reviews?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(url);

    if (response.status === 404) {
      console.warn(`Reviews not found for ${type} with ID ${id}`);
      return [];
    }

    if (!response.ok) throw new Error(`Failed to fetch ${type} reviews`);

    const data = await response.json();

    return data.results
      .filter(
        (review) =>
          review.author_details.avatar_path && review.author_details.username
      )
      .map((review) => ({
        content: review.content,
        author: review.author_details.username,
        avatar: `https://image.tmdb.org/t/p/w500${review.author_details.avatar_path}`,
      }));
  } catch (error) {
    console.error(`Error fetching ${type} reviews:`, error);
    return [];
  }
};

export const fetchStreamingLinks = async (id, type) => {
  try {
    const url = `${VITE_TMDB_DETAILS}${type}/${id}/watch/providers?api_key=${API_KEY}`;
    const response = await fetch(url);

    if (response.status === 404) {
      console.warn(`Streaming links not found for ${type} with ID ${id}`);
      return [];
    }

    if (!response.ok)
      throw new Error(`Failed to fetch ${type} streaming links`);

    const data = await response.json();
    const streamingLinks = data.results.AR?.flatrate || [];

    // Filtrar para mostrar solo un logo por proveedor único y excluir "maxamazonchannel"
    const uniqueLinks = streamingLinks.reduce((acc, link) => {
      const providerName = link.provider_name.toLowerCase();
      if (
        !acc.some((item) => item.provider === link.provider_name) &&
        !providerName.includes("maxamazonchannel")
      ) {
        acc.push({
          provider: link.provider_name,
          logo: `https://image.tmdb.org/t/p/original${link.logo_path}`,
        });
      }
      return acc;
    }, []);

    return uniqueLinks;
  } catch (error) {
    console.error(`Error fetching ${type} streaming links:`, error);
    return [];
  }
};

export const addToWatchlist = async (userId, movieId, serieId) => {
  try {
    const response = await fetch(`${API_BASE}/api/watchlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId, movieId, serieId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add to watchlist: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return null;
  }
};

export const checkIfInWatchlist = async (userId, movieId, serieId) => {
  const type = movieId ? "movie" : "serie";
  try {
    const response = await fetch(
      `${API_BASE}/api/watchlist/check?userId=${userId}&${type}Id=${
        movieId || serieId
      }`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return data.exists; // Asume que el backend devuelve `exists: true/false`
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return false;
  }
};

export const getWatchlist = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/api/watchlist/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch watchlist: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

export const removeFromWatchlist = async (userId, movieId, serieId) => {
  try {
    const type = movieId ? `movieId=${movieId}` : `serieId=${serieId}`;
    const url = `${API_BASE}/api/watchlist?${type}&userId=${userId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to remove from watchlist: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return null;
  }
};


export const clearWatchlist = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/api/watchlist/clear/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to clear watchlist: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error clearing watchlist:", error);
    return null;
  }
};



export const fetchSimilar = async (id, type) => {
  try {
    const url = `${VITE_TMDB_DETAILS}${type}/${id}/similar?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(url);

    if (response.status === 404) {
      console.warn(`Similar content not found for ${type} with ID ${id}`);
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} similar content`);
    }

    const data = await response.json();

    // Filtramos para que solo pasen los elementos que tienen todos los datos necesarios
    const similarContent = data.results
      .filter(
        (item) =>
          item.poster_path &&
          item.backdrop_path &&
          item.overview &&
          (item.vote_average || item.rating) &&
          item.release_date &&
          (item.title || item.name) &&
          item.id
      )
      .map((item) => ({
        ...item,
        poster_path: `https://image.tmdb.org/t/p/original${item.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
        title: item.title || item.name,
        release_date: item.release_date,
        overview: item.overview,
        vote_average: item.vote_average,
      }));

    // Obtener detalles adicionales de cada elemento similar, incluyendo seasons, episodes, y cast
    const detailedSimilarContent = await Promise.all(
      similarContent.map(async (item) => {
        try {
          const detailsUrl = `${VITE_TMDB_DETAILS}${type}/${item.id}?api_key=${API_KEY}&language=en-US`;
          const creditsUrl = `${VITE_TMDB_DETAILS}${type}/${item.id}/credits?api_key=${API_KEY}&language=en-US`;

          const [detailsResponse, creditsResponse] = await Promise.all([
            fetch(detailsUrl),
            fetch(creditsUrl),
          ]);

          if (!detailsResponse.ok || !creditsResponse.ok) {
            console.warn(
              `Failed to fetch additional details for ${type} with ID ${item.id}`
            );
            return null;
          }

          const detailsData = await detailsResponse.json();
          const creditsData = await creditsResponse.json();

          return {
            ...item,
            number_of_seasons: detailsData.number_of_seasons || "N/A",
            number_of_episodes: detailsData.number_of_episodes || "N/A",
            cast: creditsData.cast.slice(0, 5).map((actor) => actor.name), // Primeros 5 actores
          };
        } catch (error) {
          console.error(
            `Error fetching additional details for ${type} with ID ${item.id}:`,
            error
          );
          return null;
        }
      })
    );

    // Filtramos para eliminar elementos nulos en caso de errores en la obtención de detalles adicionales
    return detailedSimilarContent.filter((item) => item !== null);
  } catch (error) {
    console.error(`Error fetching ${type} similar content:`, error);
    return [];
  }
};

export const fetchMovieIfNotInDB = async (id, type) => {
  const url =
    type === "movie"
      ? `${VITE_TMDB_MOVIE_DETAILS_URL}/${id}?api_key=${API_KEY}&language=en-US`
      : `${VITE_TMDB_SERIES_DETAILS_URL}/${id}?api_key=${API_KEY}&language=en-US`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          `No data found for the ${type} with ID ${id} in the external TMDb API.`
        );
      } else {
        console.error(`Error fetching ${type} details: ${response.statusText}`);
      }
      return null;
    }

    const text = await response.text();
    if (!text) {
      console.warn(
        `Empty response body for ${type} with ID ${id} in the external API.`
      );
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    console.error(`Error fetching ${type} details from external API:`, error);
    return null;
  }
};