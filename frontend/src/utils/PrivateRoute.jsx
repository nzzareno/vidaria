import { Navigate } from "react-router-dom";


// Función para verificar si el token ha expirado
function isTokenExpired(token) {
  if (!token) return true;
  const [, payload] = token.split(".");
  const decodedPayload = JSON.parse(atob(payload));
  const expiryDate = decodedPayload.exp * 1000; // Convertir a milisegundos
  return Date.now() > expiryDate;
}

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Verifica si el token es válido
  const isAuthenticated = token && !isTokenExpired(token);

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
