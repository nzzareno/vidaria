import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import IndexLayout from "./pages/IndexLayout";
import Home from "./pages/Home"; // Nueva página principal autenticada
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
          </Routes>
        </ModalProvider>
        <Footer />
      </Router>
    </Provider>
  );
}

export default App;
