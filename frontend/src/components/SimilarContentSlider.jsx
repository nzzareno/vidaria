import Slider from "react-slick";
import { motion } from "framer-motion";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";

const SimilarContentSlider = ({ similarContent, handleSimilarClick }) => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: false,
    arrows: true,
    draggable: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  return (
    <div className="w-full py-10 mt-10">
      <h2 className="text-xl lg:text-2xl font-bold mb-6">
        Maybe you like it too
      </h2>
      <Slider {...sliderSettings} className="overflow-hidden">
        {similarContent.map((item) => {
          const releaseYear = item.release_date
            ? new Date(item.release_date).getFullYear()
            : "";

          const imageUrl = item.backdrop_path
            ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
            : item.poster_path
            ? `https://image.tmdb.org/t/p/original${item.poster_path}`
            : item.background;
          if (!imageUrl) return null;
          return (
            <motion.div
              key={item.id}
              className="w-32 h-64 lg:w-36 flex-shrink-0 p-2 relative"
              onClick={() => handleSimilarClick(item)}
            >
              <motion.img
                src={imageUrl}
                alt={item.title || item.name}
                className="w-full h-full object-cover rounded-lg"
                style={{ transition: "box-shadow 0.01s linear" }}
              />
              <motion.div
                className="absolute inset-2 bg-black cursor-pointer bg-opacity-60 rounded-lg flex items-center justify-center opacity-100 transition-opacity duration-300"
                initial={{ opacity: 1 }}
                whileHover={{ opacity: 0.7 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white text-center text-lg font-semibold px-4">
                  {item.title || item.name} {releaseYear && `(${releaseYear})`}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </Slider>
    </div>
  );
};

export default SimilarContentSlider;
