import { useState, useEffect, useContext, useRef } from "react";
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
import SuccessNotification from "./SuccessNotification"; // Importa la notificación

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
  const [showSuccess, setShowSuccess] = useState(false); // Estado para controlar el éxito del registro
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ref para hacer foco en el input
  const usernameInputRef = useRef(null);

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

  // Enfocar automáticamente en el input cuando se abra el modal
  useEffect(() => {
    if (isModalOpen && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [isModalOpen]);

  // Función para manejar el clic en Sign In
  const handleOpenSignIn = () => {
    handleOpenModal("login");
    setTimeout(() => {
      if (usernameInputRef.current) {
        usernameInputRef.current.focus(); // Colocar el foco automáticamente
      }
    }, 100); // Dar un pequeño retraso para que el modal se abra antes de enfocar
  };

  // Función para manejar el clic en Sign Up
  const handleOpenSignUp = () => {
    handleOpenModal("subscribe");
    setTimeout(() => {
      if (usernameInputRef.current) {
        usernameInputRef.current.focus(); // Colocar el foco automáticamente
      }
    }, 100); // Dar un pequeño retraso para que el modal se abra antes de enfocar
  };

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
        setShowSuccess(true); // Mostrar la notificación de éxito
        setIsModalOpen(false); // Cerrar el modal de registro
        handleOpenModal("login"); // Abrir el modal de login
      }
    } catch (error) {
      console.error(error);
      dispatch(setError("Error registering user"));
    }
  };

  // Navbar.jsx

  const renderModalContent = () => {
    const modalContent = {
      login: (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative font-montserrat"
        >
          <form className="mt-4" onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded-lg font-montserrat text-black"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                ref={usernameInputRef}
              />
             
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded-lg text-black"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
               <p className="text-red-500 text-sm mt-1 h-4">
                {formErrors.username}
              </p>
            </div>

            <button className="w-full bg-white hover:bg-gray-300 font-montserrat text-black p-2 rounded-lg transition duration-200 font-bold mt-2">
              Sign In
            </button>
            <p className="text-center mt-4">
              <a href="/#" className="text-blue-400 hover:underline">
                Forget password?
              </a>
            </p>
          </form>
        </motion.div>
      ),
      subscribe: (
        <motion.div
          key="subscribe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative font-montserrat"
        >
          <form className="mt-4" onSubmit={handleRegister}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded-lg text-black"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                ref={usernameInputRef}
              />
        
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded-lg text-black"
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
                className="w-full p-2 border rounded-lg text-black"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              
              <p className="text-red-500 text-sm mt-1 h-4 ">
                {formErrors.username}
              </p>
            </div>
            <button className="w-full bg-white text-black p-2 rounded-lg transition duration-200 hover:bg-green-600 mt-2">
              Subscribe
            </button>
          </form>
        </motion.div>
      ),
    };

    return modalContent[modalType] || null;
  };

  return (
    <>
      <motion.nav
        className="bg-[rgba(0,0,0,0.91)] text-white text-center p-2 fixed top-0 w-full z-40"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-center font-maxSans">
          <div>
            <motion.h3
              initial={{ scale: 1, color: "#FFFFFF" }}
              animate={{
                color: hovered ? "#FF69B4" : "#FFFFFF",
                scale: hovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="text-4xl font-bold cursor-pointer"
            >
              vidaria
            </motion.h3>
          </div>
          <div>
            {user ? (
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
                  onClick={handleOpenSignIn} // Abrir modal de login
                  className="rounded-md bg-transparent py-2 px-4 border border-transparent text-center font-light text-white transition-all ml-2 text-lg hover:underline duration-200"
                  type="button"
                >
                  Sign In
                </button>
                <button
                  onClick={handleOpenSignUp} // Abrir modal de registro
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

      {/* Modal de login/registro */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalType === "login" ? "Welcome, please enter" : "Subscribe now"
        }
      >
        {renderModalContent()}
      </Modal>

      {/* Notificación de éxito */}
      {showSuccess && (
        <SuccessNotification
          message="¡Registro exitoso!"
          onClose={() => setShowSuccess(false)}
          className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg "
        />
      )}
    </>
  );
};

export default Navbar;
