// src/services/authService.js

import { Navigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/auth`;

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
      if (isTokenExpired(token)) {
        console.error("Token ha expirado!");

        return null; // O puedes redirigir al usuario a la página de inicio de sesión.
      }

      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        Navigate("/index");
        throw new Error("Token inválido o expirado.");
      }

      const userData = await response.json();
      return userData; // Retorna el usuario con ID, username, etc.
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error.message);
      return null;
    }
  } else {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  const [, payload] = token.split(".");
  const decodedPayload = JSON.parse(atob(payload));
  const expiryDate = decodedPayload.exp * 1000; // Convertir a milisegundos
  return Date.now() > expiryDate;
};

// Verificación del token
const token = localStorage.getItem("token");
if (token && isTokenExpired(token)) {
  console.error("Token ha expirado");

  localStorage.removeItem("token"); // Elimina el token expirado
  // Redirige al usuario para que vuelva a iniciar sesión o actualiza el token si es posible.
} else {
  fetchUserData();
}
