const API_URL = `${import.meta.env.VITE_BACKEND_URL}/series`;

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
    const data = await checkResponse(response);

    // Asegúrate de que `content` esté en el formato esperado
    if (data && Array.isArray(data.content)) {
      return data;
    } else {
      console.warn("La estructura de datos no es la esperada:", data);
      return { content: [] };
    }
  } catch (error) {
    console.error(`Failed to search series with filters ${params}:`, error);
    return { content: [] };
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

export const getFeaturedSeries = async ({ totalPages = 20, size = 20 }) => {
  const featuredTitles = [
    "Seinfeld",
    "The Rookie",
    "The Lord of the Rings: The Rings of Power",
    "FROM",
    "The Sopranos",
    "Rick and Morty",
  ];

  let featuredSeries = []; // Aquí almacenamos las series encontradas
  let foundTitles = new Set(); // Para almacenar los títulos encontrados

  // Iteramos sobre cada página de la API hasta que se encuentren todas las series o se agoten las páginas
  for (let page = 0; page < totalPages; page++) {
    try {
      // Petición a la API con el número de página y el tamaño de la página
      const response = await fetch(
        `${API_URL}/most-popular?page=${page}&size=${size}`
      );
      const data = await checkResponse(response);

      // Si la respuesta no tiene contenido o está vacía, terminamos el bucle
      if (!data.content || data.content.length === 0) {
        console.warn(`No series found on page ${page}.`);
        break;
      }

      // Recorremos las series devueltas por la API en esta página
      for (const serie of data.content) {
        if (
          featuredTitles.includes(serie.title) &&
          !foundTitles.has(serie.title)
        ) {
          featuredSeries.push(serie); // Añadimos la serie encontrada
          foundTitles.add(serie.title); // Marcamos el título como encontrado
        }
      }

      // Si ya hemos encontrado todas las series, terminamos la búsqueda
      if (foundTitles.size >= featuredTitles.length) {
        break;
      }

      // Si hemos llegado a la última página, salimos del bucle
      if (data.last) {
        break;
      }
    } catch (error) {
      console.error("Error al obtener las series destacadas:", error);
      break; // Salimos del bucle si hay algún error
    }
  }

  // Devolvemos las series encontradas
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

// Función para verificar la respuesta de la API
export const checkResponse = async (response) => {
  if (!response.ok) {
    const errorDetails = await response.json();
    throw new Error(
      `Error al obtener los datos: ${response.status} - ${
        errorDetails.message || "Unknown error"
      }`
    );
  }
  return response.json();
};
