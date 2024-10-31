import { motion } from "framer-motion";

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[rgb(4,6,19)] bg-opacity-80 z-40 flex items-center justify-center"
          onClick={onClose}
          initial={{ opacity: 0 }}  // Opacidad inicial
          animate={{ opacity: 1 }}  // Opacidad cuando aparece
          exit={{ opacity: 0 }}     // Opacidad cuando desaparece
          transition={{ duration: 0.3 }}  // Duración de la animación
        >
          <motion.div
            className="bg-[#0A0A1A] w-[100%] md:w-[40%] lg:w-[30%] p-8 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8 }}  // Escala y opacidad iniciales
            animate={{ opacity: 1, scale: 1 }}    // Animación cuando aparece
            exit={{ opacity: 0, scale: 0.8 }}     // Animación cuando desaparece
            transition={{ duration: 0.3 }}        // Duración de la animación
          >
            <div className="flex justify-between items-center pb-3">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <button
                className="text-white bg-transparent hover:text-gray-100 rounded-full p-2 transition ease-in-out"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default Modal;
