const API_URL = `${import.meta.env.VITE_BACKEND_URL}/series`;
// const VITE_TMDB_DETAILS_URL = import.meta.env.VITE_TMDB_DETAILS;
// const VITE_TMDB_API_KEY = import.meta.env.VITE_API_KEY;

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

      // Verifica si la búsqueda encontró resultados
      if (seriesData && seriesData.content && seriesData.content.length > 0) {
        seriesResults.push(seriesData.content[0]); // Asume que el primer resultado es el deseado
      } else {
        console.warn(`No series found for title: ${title}`);
      }
    } catch (error) {
      console.error(`Failed to fetch series for title: ${title}`, error);
    }
  }

  return seriesResults;
};

// serieService.js
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
    "The Rookie",
    "The Lord of the Rings: The Rings of Power",
    "FROM",
    "The Sopranos",
    "Rick and Morty",
  ];

  let featuredSeries = [];
  let foundTitles = new Set();

  for (let page = 0; page < totalPages; page++) {
    try {
      const response = await fetch(
        `${API_URL}/most-popular?page=${page}&size=${size}`
      );
      const data = await checkResponse(response);

      // Verificación para asegurarse de que `data` tenga la estructura esperada
      if (!data || !Array.isArray(data.content)) {
        console.warn(
          `Estructura inesperada en la respuesta de la página ${page}:`,
          data
        );
        break;
      }

      // Procesamiento de los datos si la estructura es correcta
      for (const serie of data.content) {
        if (
          featuredTitles.includes(serie.title) &&
          !foundTitles.has(serie.title)
        ) {
          featuredSeries.push(serie);
          foundTitles.add(serie.title);
        }
      }

      // Terminar si todas las series han sido encontradas
      if (foundTitles.size >= featuredTitles.length) {
        break;
      }

      // Si `data.last` existe y es `true`, significa que no hay más páginas
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

export const fetchCast = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}/cast`);
    return checkResponse(response);
  } catch (error) {
    console.error(`Error fetching cast for serie with id ${id}:`, error);
    return [];
  }
};
const featuredSeriesIds = [194764, 4604, 141, 1412, 76331, 1409, 63333, 75219]; // Cambia estos valores por los IDs deseados

export const getHeaderSeries = async () => {
  const seriesData = [];
  for (const id of featuredSeriesIds) {
    const serie = await getSerie(id); // Usa la función `getSerie` para obtener cada serie por ID
    if (serie) {
      seriesData.push(serie);
    }
  }
  return seriesData;
};

export const getPopularSeries = async () => {
  return await getHeaderSeries();
};

// Función que verifica si la serie ya existe en la base de datos
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

// Función para guardar la serie en la base de datos
export const saveSerieToDatabase = async (serie) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Quita charset=UTF-8
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

// Función para verificar la respuesta de la API
export const checkResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const text = await response.text();
  if (!text) {
    throw new Error("Empty response body");
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    throw new Error("Failed to parse JSON response");
  }
};
