import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const ErrorNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Cerrar la notificación después de 3 segundos
    }, 3000);

    return () => clearTimeout(timer); // Limpiar el temporizador
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }} // Aparece desde abajo
        animate={{ opacity: 1, y: 0 }} // Llega a la posición final
        exit={{ opacity: 0, y: 50 }} // Desaparece bajando
        transition={{ duration: 0.5 }} // Duración para ambas transiciones
        className="fixed bottom-5 right-5 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg z-50"
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorNotification;
