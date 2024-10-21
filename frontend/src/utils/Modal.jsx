const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed font-maxSans inset-0 bg-[rgb(4,6,19)] bg-opacity-80 z-40 flex items-center justify-center"
          onClick={onClose}
        >
          <div
            className="bg-[#0A0A1A] w-[100%] md:w-[40%] lg:w-[30%] p-8 rounded-lg shadow-lg transform transition duration-300 ease-out scale-100"
            onClick={(e) => e.stopPropagation()}
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
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;