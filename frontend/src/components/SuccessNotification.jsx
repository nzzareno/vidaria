import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const SuccessNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Cerrar la notificación después de 3 segundos
    }, 3000);

    return () => clearTimeout(timer); // Limpiar el temporizador
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }} // La notificación aparece desde abajo
        animate={{ opacity: 1, y: 0 }} // Llega a la posición y opacidad finales
        exit={{ opacity: 0, y: 50 }} // Se desvanece y baja cuando desaparece
        transition={{ duration: 0.5 }} // Duración para ambas transiciones
        className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50"
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
};

export default SuccessNotification;
