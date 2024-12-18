import { Navigate } from "react-router-dom";

function PublicRoute({ component: Component }) {
  const token = localStorage.getItem("token");

  const isTokenExpired = (token) => {
    if (!token) return true;
    const [, payload] = token.split(".");
    const decodedPayload = JSON.parse(atob(payload));
    const expiryDate = decodedPayload.exp * 1000;
    return Date.now() > expiryDate;
  };

  const isAuthenticated = token && !isTokenExpired(token);

  return isAuthenticated ? <Navigate to="/home" replace /> : <Component />;
}

export default PublicRoute;
