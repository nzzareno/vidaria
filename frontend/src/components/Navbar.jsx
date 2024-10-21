import { useState, useEffect, useContext } from "react";
import {
  logout,
  login,
  register,
  fetchUserData,
} from "../services/authService";
import Modal from "../utils/Modal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setError, clearError } from "../redux/authSlice";
import { motion } from "framer-motion"; // Importar motion
import ModalContext from "../context/ModalContext";

const Navbar = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    modalType,
    handleOpenModal,
    formErrors,
    setFormData,
    formData,
    setFormErrors,
  } = useContext(ModalContext);
  const user = useSelector((state) => state.auth.user);
  const error = useSelector((state) => state.auth.error);
  const [hovered, setHovered] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // useEffect para obtener datos de usuario en el montaje inicial
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchUser = async () => {
        try {
          const userData = await fetchUserData();
          if (userData) {
            dispatch({ type: "auth/login", payload: userData });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUser();
    }
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setFormErrors({ username: error });
    }

    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
      });
    }

    return () => {
      setFormErrors({});
    };
  }, [error, user, setFormErrors, setFormData]);

    const handleLogout = () => {
    logout();
    dispatch({ type: "auth/logout" });
    navigate("/");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearError());
  };

  const validateFieldLogin = (name, value) => {
    let error = "";
    if (name === "username" && !value.trim()) {
      error = "Username is required.";
    } else if (name === "password" && !value) {
      error = "Password is required.";
    }
    return error;
  };

  const validateFieldRegister = (name, value) => {
    let error = "";
    if (name === "username" && value.trim().length < 3) {
      error = "Username must be at least 3 characters long.";
    } else if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      error = "Please enter a valid email address.";
    } else if (name === "password" && value.length < 6) {
      error = "Password must be at least 6 characters long.";
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(clearError());
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    const error =
      modalType === "login"
        ? validateFieldLogin(name, value)
        : validateFieldRegister(name, value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    try {
      const data = await login(username, password);
      if (data.error) {
        dispatch(setError(data.error));
      } else {
        // Obtener datos del usuario después de iniciar sesión
        const userData = await fetchUserData();
        if (userData) {
          dispatch({ type: "auth/login", payload: userData });
        }
        setIsModalOpen(false);
        navigate("/home");
      }
    } catch (error) {
      console.error(error);
      dispatch(setError("Error logging in"));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;
    try {
      const data = await register(username, email, password);
      if (data.error) {
        dispatch(setError(data.error));
      } else {
        alert("User registered successfully");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      dispatch(setError(" Error registering user"));
    }
  };

  const renderModalContent = () => {
    const modalContent = {
      login: (
        <div className="relative">
          <form className="mt-4" onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded-lg"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
              />
              <p className="text-red-500 text-sm mt-1 h-4">
                {formErrors.username}
              </p>
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded-lg"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              <p className="text-red-500 text-sm mt-1 h-4">
                {formErrors.password}
              </p>
            </div>
            <button className="w-full bg-white hover:bg-gray-300 text-black p-2 rounded-lg transition duration-200 font-bold mt-2">
              Sign In
            </button>
            <p className="text-center mt-4">
              <a href="/#" className="text-blue-400 hover:underline">
                Forget password?
              </a>
            </p>
          </form>
        </div>
      ),
      subscribe: (
        <div className="relative">
          <form className="mt-4" onSubmit={handleRegister}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded-lg"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
              />
              <p className="text-red-500 text-sm mt-1 h-4">
                {formErrors.username}
              </p>
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded-lg"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              <p className="text-red-500 text-sm mt-1 h-4">
                {formErrors.email}
              </p>
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded-lg"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              <p className="text-red-500 text-sm mt-1 h-4">
                {formErrors.password}
              </p>
            </div>
            <p className="text-red-500 text-sm">{error}</p>
            <button className="w-full bg-white text-black p-2 rounded-lg transition duration-200 hover:bg-green-600 mt-2">
              Subscribe
            </button>
          </form>
        </div>
      ),
    };

    return modalContent[modalType] || null;
  };

  return (
    <>
      <motion.nav
        className="bg-[rgba(0,0,0,0.91)] text-white text-center p-2 fixed top-0 w-full z-50"
        initial={{ opacity: 0, y: -50 }} // Animación inicial
        animate={{ opacity: 1, y: 0 }} // Animación al mostrar
        transition={{ duration: 0.4 }} // Duración de la animación
      >
        <div className="flex justify-between items-center font-maxSans">
          <div>
            <motion.h3
              initial={{ scale: 1, color: "#FFFFFF" }} // Colores iniciales y escala inicial
              animate={{
                color: hovered ? "#FF69B4" : "#FFFFFF", // Cambiar el color de blanco a rosa
                scale: hovered ? 1.1 : 1, // Cambiar la escala en hover
              }}
              transition={{ duration: 0.3 }} // Duración de la transición
              onMouseEnter={() => setHovered(true)} // Hover activado
              onMouseLeave={() => setHovered(false)} // Hover desactivado
              className="text-4xl font-bold cursor-pointer"
            >
              vidaria
            </motion.h3>
          </div>
          <div>
            {user ? (
              // BARRA DE NAV BLANCA MINIMALISTA

              <div className="flex items-center">
                <span className="mr-4 text-gray-800">{user.username}</span>
                <button
                  className="bg-gray-800 text-white rounded-md py-2 px-4 transition duration-200 hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex">
                <button
                  onClick={() => handleOpenModal("login")}
                  className="rounded-md bg-transparent py-2 px-4 border border-transparent text-center font-light text-white transition-all ml-2 text-lg hover:underline duration-200"
                  type="button"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenModal("subscribe")}
                  className="rounded-md bg-transparent py-2 px-4 border border-transparent text-center font-light text-white transition-all ml-2 text-lg hover:underline duration-200"
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.nav>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalType === "login" ? "Welcome, please enter" : "Subscribe now"
        }
      >
        {renderModalContent()}
      </Modal>
    </>
  );
};

export default Navbar;
