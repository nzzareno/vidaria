import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export const PrevArrow = ({ onClick }) => (
  <div
    className="custom-prev-arrow"
    style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      left: "10px",
      zIndex: 2,
      background: "rgba(255, 255, 255, 0.8)",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
    onClick={onClick}
  >
    <FaArrowLeft size={20} color="black" />
  </div>
);

export const NextArrow = ({ onClick, isDisabled }) => (
  <div
    className={`custom-next-arrow ${
      isDisabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
    style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      right: "10px",
      zIndex: 2,
      background: "rgba(255, 255, 255, 0.8)",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: isDisabled ? "not-allowed" : "pointer",
    }}
    onClick={!isDisabled ? onClick : undefined}
  >
    <FaArrowRight size={20} color="black" />
  </div>
);
