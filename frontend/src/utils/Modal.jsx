import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ isOpen, onClose, title, authorName, avatar, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[rgb(4,6,19)] bg-opacity-80 z-40 flex items-center justify-center font-montserrat"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-[#0A0A1A] w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-white bg-transparent hover:text-gray-100 rounded-full p-2 transition ease-in-out"
              onClick={onClose}
            >
              ✕
            </button>

            {authorName && avatar ? (
              <div className="flex items-center space-x-4 pb-4">
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <h2 className="text-xl font-bold text-white">{authorName}</h2>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-white pb-3">{title}</h2>
            )}

            <div className="mt-5 text-white text-sm md:text-base leading-relaxed overflow-y-auto max-h-[60vh]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
