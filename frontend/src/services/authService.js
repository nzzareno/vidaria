// src/services/authService.js

const API_URL = "http://localhost:8081/auth"; // URL de tu backend

// Función para registrar al usuario
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data; // Retorna los datos del usuario si el registro fue exitoso
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

// Función para iniciar sesión
// Función para iniciar sesión
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    localStorage.setItem("token", data.token); // Guarda el token en localStorage

    return data; // Retorna los datos del usuario y token si el inicio de sesión fue exitoso
  } catch (error) {
    console.error(error.message);
    return { error: error.message }; // Devolver el error para manejarlo en el frontend
  }
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem("token");
};

// Función para obtener el usuario actual
export const fetchUserData = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log(response);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const userData = await response.json();
      return userData; // Retorna los datos del usuario
    } catch (error) {
       
      return { error: error.message };
    }
  } else {
    return null; // Retorna null si no hay token
  }
};
