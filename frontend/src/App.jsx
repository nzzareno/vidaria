import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import IndexLayout from "./pages/IndexLayout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Details from "./pages/Details";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";

import Series from "./pages/Series";
import NotFound from "./components/NotFound";
import Watchlist from "./pages/Watchlist";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ModalProvider } from "./context/ModalContext";
import VerificationPage from "./pages/VerificationPage";

function App() {
  return (
    <Provider store={store}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatRoutes: true,
        }}
      >
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </Router>
    </Provider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        navigate("/index", { replace: true });
      } else {
        setIsAuthenticated(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/index" replace />
            )
          }
        />
        <Route
          path="/index"
          element={
            <PublicRoute
              component={IndexLayout}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Movies />
            </PrivateRoute>
          }
        />
        <Route
          path="/series"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Series />
            </PrivateRoute>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Details type="movie" />
            </PrivateRoute>
          }
        />
        <Route path="/verification-success" element={<VerificationPage />} />
        <Route
          path="/series/:id"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Details type="series" />
            </PrivateRoute>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route
          path="/watchlist"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Watchlist />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/index" replace />} />
      </Routes>
    </>
  );
}

export default App;
