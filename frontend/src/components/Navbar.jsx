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
import { setError, clearError, setLoading } from "../redux/authSlice";
import { motion } from "framer-motion";
import ModalContext from "../context/ModalContext";
import SuccessNotification from "./SuccessNotification";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import SyncLoader from "react-spinners/SyncLoader";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el botón
  const [resetTokenValidated, setResetTokenValidated] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Ingresar email, 2: Loader, 3: Cambio de contraseña
  const [resetToken, setResetToken] = useState(""); // Almacenar token si es necesario
  const [newPassword, setNewPassword] = useState(""); // Para la nueva contraseña
  const [isScrolled, setIsScrolled] = useState(false); // Estado para controlar el color de la navbar
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const forgotPasswordStepRef = useRef(forgotPasswordStep);
  const usernameInputRef = useRef(null);

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

  useEffect(() => {
    if (isModalOpen && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "/ws", // Uso del proxy configurado en Vite
      webSocketFactory: () => new SockJS("/ws"), // SockJS como fallback
      reconnectDelay: 5000, // Reintentos cada 5 segundos
      heartbeatIncoming: 4000, // Heartbeats entrantes
      heartbeatOutgoing: 4000, // Heartbeats salientes
    });

    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/token-validated", (message) => {
        const data = JSON.parse(message.body);

        if (data.success) {
          setResetTokenValidated(true);
          setResetToken(data.token);

          setForgotPasswordStep(3);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Error STOMP:", frame.headers["message"]);
    };

    stompClient.onWebSocketClose = () => {
      console.warn("WebSocket cerrado. Intentando reconectar...");
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  useEffect(() => {
    forgotPasswordStepRef.current = forgotPasswordStep;
  }, [forgotPasswordStep]);

  useEffect(() => {
    if (resetTokenValidated && forgotPasswordStepRef.current !== 3) {
      setForgotPasswordStep(3); // Cambia al paso de restablecimiento de contraseña
    }
  }, [resetTokenValidated]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseModal(); // Llama a la función para cerrar el modal
      }
    };
    if (isModalOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleOpenSignIn = () => {
    handleOpenModal("login");
    setTimeout(() => {
      if (usernameInputRef.current) {
        usernameInputRef.current.focus();
      }
    }, 100);
  };

  const handleOpenSignUp = () => {
    handleOpenModal("subscribe");
    setTimeout(() => {
      if (usernameInputRef.current) {
        usernameInputRef.current.focus();
      }
    }, 100);
  };

  const handleLogout = () => {
    logout();
    dispatch({ type: "auth/logout" });
    navigate("/");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearError());

    // Cancelar espera del loader y resetear flujo de forgot password
    if (modalType === "forgotPassword") {
      setForgotPasswordStep(1); // Reinicia el flujo al paso inicial
    }
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
        setShowSuccess(true);
        setIsModalOpen(false);
        handleOpenModal("login");
      }
    } catch (error) {
      console.error(error);
      dispatch(setError("Error registering user"));
    }
  };

  const handleForgotPassword = async (email) => {
    setIsLoading(true); // Bloquea el botón
    dispatch(setLoading(true)); // Muestra el loader

    try {
      const response = await fetch(
        "http://localhost:8081/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }), // Envía el correo en formato JSON
        }
      );

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordStep(2); // Cambia al loader de espera
      } else {
        const errorMessage = data.error || "Email not found. Please try again.";
        setFormErrors((prev) => ({ ...prev, email: errorMessage }));
        console.error("Error:", errorMessage);
      }
    } catch (error) {
      const unexpectedError = "An unexpected error occurred. Please try again.";
      setFormErrors((prev) => ({ ...prev, email: unexpectedError }));
      console.error("Error inesperado:", error);
    } finally {
      setIsLoading(false); // Desbloquea el botón
      dispatch(setLoading(false)); // Oculta el loader
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long.",
      }));
      return; // Detén la ejecución si la contraseña no es válida
    }

    try {
      const response = await fetch(
        `http://localhost:8081/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resetToken, newPassword }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setPasswordChanged(true); // Muestra la notificación de éxito
        setIsModalOpen(false); // Cierra el modal
        setForgotPasswordStep(1); // Reinicia el flujo
      } else {
        console.error("Error del servidor:", data);
        dispatch(setError(data.error || "Error restableciendo contraseña."));
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      dispatch(setError("Error inesperado: " + error.message));
    }
  };

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
            {/* Username Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-indigo-500"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                ref={usernameInputRef}
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-indigo-500"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            {/* Error Message */}
            <div className="text-red-500 text-sm min-h-[1.25rem] flex items-center">
              {formErrors.username || formErrors.password}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-300 font-montserrat text-black p-2 rounded-lg transition duration-200 font-bold mt-4"
            >
              Sign In
            </button>

            <p className="text-center mt-4">
              <a
                href="#"
                className="text-blue-400 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenModal("forgotPassword");
                }}
              >
                Forgot password?
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-indigo-500"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                ref={usernameInputRef}
              />
            </div>
            <div className="-mb-[0.18rem]">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-indigo-500"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              <div className="mt-1 h-4" />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-indigo-500"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              <p className="text-red-500 text-sm mt-4 h-4">
                {formErrors.username || formErrors.email || formErrors.password}
              </p>
            </div>
            <button
              type="submit"
              className="w-full font-bold bg-white text-black px-3 py-2 rounded-lg transition duration-200 hover:bg-green-600 mt-[.2rem]"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      ),
      forgotPassword: (
        <motion.div
          key="forgotPassword"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative font-montserrat"
        >
          {forgotPasswordStep === 1 && (
            <div>
              {/* Input para el correo electrónico */}
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-indigo-500"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                value={formData.email || ""}
              />

              {/* Contenedor del mensaje de error */}
              <div className="text-red-500 text-sm mt-2 min-h-[1.25rem]">
                {formErrors.email}
              </div>

              {/* Botón para enviar el enlace de restablecimiento */}
              <button
                className={`w-full p-2 rounded-lg mt-4 ${
                  isLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600"
                } text-white`}
                onClick={() => handleForgotPassword(formData.email)}
                disabled={isLoading} // Deshabilita el botón si está cargando
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          )}

          {forgotPasswordStep === 2 && (
            <div className="flex flex-col items-center overflow-hidden">
              <p className="text-lg font-semibold text-white mb-14">
                Please check your email {formData.email} for the reset link that
                I sent you to change your password.
              </p>
              <SyncLoader color="#ffffff" size={18} />
              <br />
            </div>
          )}

          {forgotPasswordStep === 3 && (
            <div>
              <input
                type="password"
                placeholder="New Password"
                className={`w-full px-3 py-2 border ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg mb-4 text-black focus:outline-none focus:border-indigo-500`}
                value={newPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewPassword(value);

                  // Validar longitud de la contraseña
                  if (value.length < 8) {
                    setFormErrors((prev) => ({
                      ...prev,
                      password:
                        "New password must be at least 8 characters long.",
                    }));
                  } else {
                    setFormErrors((prev) => ({
                      ...prev,
                      password: "",
                    }));
                  }
                }}
              />

              <div className="min-h-[1.25rem] mt-1">
                {formErrors.password && (
                  <p className="text-red-500 text-sm">{formErrors.password}</p>
                )}
              </div>

              <button
                className={`w-full ${
                  formErrors.password
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white p-2 rounded-lg transition-colors duration-200 mt-6`}
                onClick={handleResetPassword}
                disabled={!!formErrors.password}
              >
                Reset Password
              </button>
            </div>
          )}
        </motion.div>
      ),
    };

    return modalContent[modalType] || null;
  };

  return (
    <>
      <motion.nav
        className={`${
          isScrolled ? "bg-black" : "bg-[rgba(0,0,0,0.91)]"
        } text-white text-center p-2 fixed top-0 w-full z-40 transition-colors duration-300`}
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
                  onClick={handleOpenSignIn}
                  className="rounded-md bg-transparent py-2 px-4 border border-transparent text-center font-light text-white transition-all ml-2 text-lg hover:underline duration-200"
                  type="button"
                >
                  Sign In
                </button>
                <button
                  onClick={handleOpenSignUp}
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
          modalType === "login"
            ? "Welcome, please enter"
            : modalType === "subscribe"
            ? "Subscribe now"
            : "Reset your password"
        }
      >
        {renderModalContent()}
      </Modal>

      {showSuccess && (
        <SuccessNotification
          message="¡Registro exitoso!"
          onClose={() => setShowSuccess(false)}
          className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg "
        />
      )}
      {passwordChanged && (
        <SuccessNotification
          message="Password changed!"
          onClose={() => setPasswordChanged(false)}
          className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg"
        />
      )}
    </>
  );
};

export default Navbar;
