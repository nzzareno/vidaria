import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export const PrevArrow = ({ onClick }) => (
  <motion.div
    className="custom-prev-arrow"
    style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      left: "0px",
      zIndex: 2,
      background: "rgba(255, 255, 255, 1)",
      borderRadius: "50%",
      width: "50px",
      height: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      opacity: 0.7,
    }}
    onClick={onClick}
    whileHover={{
      opacity: 1,
    }}
  >
    <FaArrowLeft size={30} color="black" />
  </motion.div>
);

export const NextArrow = ({ onClick, isDisabled }) => (
  <motion.div
    className={`custom-next-arrow ${
      isDisabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
    style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      right: "0px",
      zIndex: 2,
      background: "rgba(255, 255, 255, 1)",
      borderRadius: "50%",
      width: "50px",
      height: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: isDisabled ? 0.6 : 1,
      cursor: isDisabled ? "not-allowed" : "pointer",
    }}
    onClick={!isDisabled ? onClick : undefined}
  >
    <FaArrowRight size={30} color="black" />
  </motion.div>
);
