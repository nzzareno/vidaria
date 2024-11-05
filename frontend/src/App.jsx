import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
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
import Series from "./pages/Series";
import NotFound from "./components/NotFound";

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

  const hideFooterRoutes = ["/movies/:id", "/series/:id"];
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

        <Route path="*" element={<NotFound />} />
      </Routes>

      {shouldShowFooter && <Footer />}
    </>
  );
}

export default App;
