import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import IndexLayout from "./pages/IndexLayout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Details from "./pages/Details";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";
import { Provider } from "react-redux";
import store from "./redux/store";
import Footer from "./components/Footer";
import { ModalProvider } from "./context/ModalContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Series from "./pages/Series";
import NotFound from "./components/NotFound";
import Watchlist from "./pages/Watchlist";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </Router>
    </Provider>
  );
}

function AppContent() {
  const isAuthenticated =
    useSelector((state) => state.auth.user) || localStorage.getItem("token");
  const hideFooterRoutes = ["/movies/:id", "/series/:id"];
  const shouldShowFooter = !hideFooterRoutes.some((path) =>
    window.location.pathname.startsWith(path.split(":")[0])
  );

  return (
    <>
      <Routes>
        {/* Ruta raíz: redirige según autenticación sin renderizar previamente el IndexLayout */}
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

        {/* Ruta pública solo para usuarios no autenticados */}
        <Route
          path="/index"
          element={
            !isAuthenticated ? (
              <PublicRoute component={IndexLayout} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* Ruta protegida para Home y demás rutas privadas */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <PrivateRoute>
              <Movies />
            </PrivateRoute>
          }
        />
        <Route
          path="/series"
          element={
            <PrivateRoute>
              <Series />
            </PrivateRoute>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <PrivateRoute>
              <Details type="movie" />
            </PrivateRoute>
          }
        />
        <Route
          path="/series/:id"
          element={
            <PrivateRoute>
              <Details type="series" />
            </PrivateRoute>
          }
        />

        <Route path="/404" element={<NotFound />} />
        <Route
          path="/watchlist"
          element={
            <PrivateRoute>
              <Watchlist />
            </PrivateRoute>
          }
        />

        {/* Redirige cualquier ruta no reconocida a "/index" */}
        <Route path="*" element={<Navigate to="/index" replace />} />
      </Routes>

      {shouldShowFooter && <Footer />}
    </>
  );
}

export default App;
