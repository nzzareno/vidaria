import { createContext, useState } from "react";
import { useDispatch } from "react-redux";
import { clearError } from "../redux/authSlice";

// Crear el contexto
const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  // Estado para controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Funciones para abrir y cerrar el modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const dispatch = useDispatch();

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    dispatch(clearError());
    setFormData({ username: "", email: "", password: "" });
    setFormErrors({});
  };

  // Proveer los valores del contexto a través del Provider
  return (
    <ModalContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        setIsModalOpen,
        modalType,
        setModalType,
        handleOpenModal,
        formErrors,
        setFormErrors,
        formData,
        setFormData,
        isInWatchlist,
        setIsInWatchlist,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
