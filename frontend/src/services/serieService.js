const API_URL = `${import.meta.env.VITE_BACKEND_URL}/series`;
const VITE_TMDB_SERIES_DETAILS_URL = `${
  import.meta.env.VITE_TMDB_SERIES_DETAILS_URL
}`;
const API_BASE = `${import.meta.env.VITE_TMDB_DETAILS}`;
const API_KEY = `${import.meta.env.VITE_API_KEY}`;

export const fetchSeriePosterPath = async (id) => {
  try {
    const response = await fetch(
      `${VITE_TMDB_SERIES_DETAILS_URL}/${id}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      console.error(`Failed to fetch poster path for series with ID ${id}`);
      return null;
    }

    const data = await response.json();

    if (data && data.poster_path) {
      return `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching poster path for series with ID ${id}:`,
      error
    );
    return null;
  }
};

export const fetchMoviePosterPath = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE}movie/${id}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      console.warn(`Failed to fetch poster for movie ID ${id}`);
      return null;
    }

    const data = await response.json();

    if (data && data.poster_path) {
      return `https://image.tmdb.org/t/p/w300${data.poster_path}`;
    } else {
      console.warn(`No poster_path found for movie ID ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching poster path for movie ID ${id}:`, error);
    return null;
  }
};

export const getSeries = async () => {
  try {
    const response = await fetch(API_URL);
    return checkResponse(response);
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return [];
  }
};

export const getSerie = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    return checkResponse(response);
  } catch (error) {
    console.error(`Failed to fetch serie with id ${id}:`, error);
    return null;
  }
};

export const getTopSeries = async (titles) => {
  const seriesResults = [];

  for (const title of titles) {
    try {
      const response = await fetch(`${API_URL}/search?title=${title}`);
      const seriesData = await checkResponse(response);

      if (seriesData && seriesData.content && seriesData.content.length > 0) {
        seriesResults.push(seriesData.content[0]);
      } else {
        console.warn(`No series found for title: ${title}`);
      }
    } catch (error) {
      console.error(`Failed to fetch series for title: ${title}`, error);
    }
  }

  return seriesResults;
};

export const searchSeries = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  try {
    const response = await fetch(`${API_URL}/search?${params}`);
    return checkResponse(response);
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return [];
  }
};

export const getSeriesByGenre = async (genre) => {
  try {
    const response = await fetch(`${API_URL}/best/${genre}`);
    return checkResponse(response);
  } catch (error) {
    console.error(`Failed to fetch series with genre ${genre}:`, error);
    return [];
  }
};

export const getFeaturedSeries = async ({
  totalPages = 20,
  size = 20,
} = {}) => {
  const featuredTitles = [
    "Seinfeld",
    "The Simpsons",
    "The Lord of the Rings: The Rings of Power",
    "CSI: Crime Scene Investigation",
    "Outlander",
    "Family Guy",
  ];

  let featuredSeries = [];
  let foundTitles = new Set();

  for (let page = 0; page < totalPages; page++) {
    try {
      const response = await fetch(
        `${API_URL}/most-popular?page=${page}&size=${size}`
      );
      const data = await checkResponse(response);

      if (!data || !Array.isArray(data.content)) {
        console.warn(
          `Estructura inesperada en la respuesta de la página ${page}:`,
          data
        );
        break;
      }

      for (const serie of data.content) {
        if (
          featuredTitles.includes(serie.title) &&
          !foundTitles.has(serie.title)
        ) {
          featuredSeries.push(serie);
          foundTitles.add(serie.title);
        }
      }

      if (foundTitles.size >= featuredTitles.length) {
        break;
      }

      if (data.last) {
        break;
      }
    } catch (error) {
      console.error("Error al obtener las series destacadas:", error);
      break;
    }
  }

  return featuredSeries;
};

export const getSeriesByType = async (type) => {
  try {
    const response = await fetch(
      `http://localhost:8081/series/type/${type}?api_key=${API_KEY}&size=10`
    );
    return checkResponse(response);
  } catch (error) {
    console.error(`Failed to fetch series with type ${type}:`, error);
    return [];
  }
};
export const fetchCast = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}/cast`);
    return checkResponse(response);
  } catch (error) {
    console.error(`Error fetching cast for serie with id ${id}:`, error);
    return [];
  }
};
const featuredSeriesIds = [194764, 4604, 141, 1412, 76331, 1409, 63333, 75219];

export const getHeaderSeries = async () => {
  const seriesData = [];
  for (const id of featuredSeriesIds) {
    const serie = await getSerie(id);
    if (serie) {
      seriesData.push(serie);
    }
  }
  return seriesData;
};

export const getPopularSeries = async () => {
  try {
    const response = await fetch(`${API_URL}/most-popular?page=8`);
    return checkResponse(response);
  } catch (error) {
    console.error("Failed to fetch popular series:", error);
    return [];
  }
};

export const checkIfExistsInDb = async (id) => {
  try {
    const response = await fetch(`${API_URL}/check/${id}`);
    const data = await checkResponse(response);
    return data;
  } catch (error) {
    console.error(`Error checking if serie exists with id ${id}:`, error);
    return false;
  }
};

export const saveSerieToDatabase = async (serie) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(serie),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error al guardar la serie: ${errorText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error en saveSerieToDatabase:", error);
    return null;
  }
};

export async function checkResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    console.error("Error: Respuesta no es JSON", await response.text());
    throw new Error("Respuesta no es JSON válida");
  }
}
