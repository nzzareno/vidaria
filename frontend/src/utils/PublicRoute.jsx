// PublicRoute.js
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ component: Component }) => {
  const isAuthenticated = useSelector((state) => state.auth.user);

  // Si el usuario está autenticado, redirige a /home y usa `replace`
  return isAuthenticated ? <Navigate to="/home" replace /> : <Component />;
};

export default PublicRoute;
