import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import IndexLayout from "./pages/IndexLayout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Details from "./pages/Details"; // Importa el componente Details
import PrivateRoute from "./utils/PrivateRoute";
import { Provider } from "react-redux";
import store from "./redux/store";
import Footer from "./components/Footer";
import { ModalProvider } from "./context/ModalContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  const location = useLocation();

  // Define las rutas de detalles en las que no quieres que se muestre el Footer
  const hideFooterRoutes = ["/movies/:id", "/series/:id"];

  // Chequea si la ruta actual incluye alguna de las rutas donde quieres ocultar el Footer
  const shouldShowFooter = !hideFooterRoutes.some((path) =>
    location.pathname.startsWith(path.split(":")[0])
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<IndexLayout />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/movies" element={<Movies />} />
        
        {/* Rutas para los detalles de películas y series */}
        <Route path="/movies/:id" element={<Details type="movie" />} />
        <Route path="/series/:id" element={<Details type="series" />} />
      </Routes>

      {/* Muestra el Footer solo si shouldShowFooter es true */}
      {shouldShowFooter && <Footer />}
    </>
  );
}

export default App;
