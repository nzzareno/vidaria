import { Navigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/auth`;

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

    return data;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

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

    localStorage.setItem("token", data.token);

    return data;
  } catch (error) {
    console.error(error.message);
    return { error: error.message };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const fetchUserData = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      if (isTokenExpired(token)) {
        console.error("Token ha expirado!");
        localStorage.removeItem("token");
        return Navigate("/index");
      }

      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");

        throw new Error("Token inválido o expirado.");
      }

      const userData = await response.json();
      return userData;
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
  const expiryDate = decodedPayload.exp * 1000;
  return Date.now() > expiryDate;
};

const token = localStorage.getItem("token");
if (token && isTokenExpired(token)) {
  console.error("Token ha expirado");

  localStorage.removeItem("token");
} else {
  fetchUserData();
}


