const API_URL = "http://localhost:8081/series";

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

export const searchSeries = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  try {
    const response = await fetch(`${API_URL}/search?${params}`);
    return checkResponse(response);
  } catch (error) {
    console.error(`Failed to search series with filters ${params}:`, error);
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

export const getFeaturedSeries = async ({ totalPages = 20, size = 80 }) => {
  const featuredTitles = [
    "Family Guy",
    "Peaky Blinders",
    "Cheers",
    "Doctor Who",
    "Panorama",
    "The Sopranos",
  ];

  let featuredSeries = [];

  for (let page = 1; page <= totalPages; page++) {
    try {
      const response = await fetch(
        `${API_URL}/most-popular?page=${page}&size=${size}`
      );

      const data = await checkResponse(response);

      if (!data.content || data.content.length === 0) {
        console.warn("No series found in the response content.");
        break; // Salir del bucle si no hay más series
      }

      // Buscar series específicas en la página actual y obtener por lo menos 5 series
      for (const serie of data.content) {
        if (featuredTitles.includes(serie.title)) {
          if (!featuredSeries.find((s) => s.genre_id === serie.genre_id)) {
            featuredSeries.push(serie);
          } else {
            console.warn(
              `Serie ${serie.title} already added to featured series.`
            );
          }
        }
      }

      if (featuredSeries.length >= featuredTitles.length) {
        break; // Salir del bucle si ya se encontraron todas las series
      }
    } catch (error) {
      console.error("Failed to fetch featured series:", error);
      break; // Salir del bucle en caso de error
    }
  }

  return featuredSeries; // Devolver las series encontradas
};

const checkResponse = (response) => {
  if (!response.ok) throw new Error(`Error fetching data: ${response.status}`);
  return response.json();
};
