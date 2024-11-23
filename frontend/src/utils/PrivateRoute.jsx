import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  const isTokenExpired = (token) => {
    if (!token) return true;
    const [, payload] = token.split(".");
    const decodedPayload = JSON.parse(atob(payload));
    const expiryDate = decodedPayload.exp * 1000;
    return Date.now() > expiryDate;
  };

  const isAuthenticated = token && !isTokenExpired(token);

  return isAuthenticated ? children : <Navigate to="/index" replace />;
}

export default PrivateRoute;
