import Slider from "react-slick";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { SyncLoader } from "react-spinners";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";

const SimilarContentSlider = ({ similarContent, handleSimilarClick }) => {
  const [loadedItems, setLoadedItems] = useState({}); // Tracks fully loaded items (image and title)
  const seenItems = useRef({}); // To prevent repeated state updates

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 1200,
    autoplay: false,
    arrows: true,
    draggable: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  // Precaches images
  useEffect(() => {
    similarContent.forEach((item) => {
      const img = new Image();
      img.src = item.backdrop_path;
    });
  }, [similarContent]);

  // Filters content with complete data
  const filteredContent = similarContent.filter(
    (item) =>
      item.backdrop_path &&
      (item.title || item.name) &&
      item.id &&
      (item.release_date || item.first_air_date)
  );

  const getImageUrl = (backdropPath) =>
    backdropPath.startsWith("https")
      ? backdropPath
      : `https://image.tmdb.org/t/p/w780${backdropPath}`; // Use a suitable size for backdrop images

  const handleLoadComplete = (id, type) => {
    setLoadedItems((prev) => {
      const updated = { ...prev, [id]: { ...(prev[id] || {}), [type]: true } };
      return updated;
    });
  };

  return (
    <div className="w-full py-10 mt-10">
      <h2 className="text-xl lg:text-2xl font-bold mb-6">May also like</h2>
      {filteredContent.length > 0 ? (
        <Slider {...sliderSettings} className="overflow-hidden">
          {filteredContent.map((item) => {
            const releaseYear = item.release_date
              ? new Date(item.release_date).getFullYear()
              : "";

            const imageUrl = getImageUrl(item.backdrop_path);

            const isLoaded =
              loadedItems[item.id]?.image && loadedItems[item.id]?.title;

            return (
              <motion.div
                key={item.id}
                className="w-36 h-64 p-2 relative flex-shrink-0" // Consistent size for all cards
                onClick={() => handleSimilarClick(item)}
              >
                {/* Spinner overlay */}
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a1a] bg-opacity-75 rounded-lg z-10">
                    <SyncLoader size={10} color="#FF0000" />
                  </div>
                )}

                {/* Image */}
                <div
                  className={`relative w-full h-full rounded-lg ${
                    !isLoaded ? "invisible" : "visible"
                  }`}
                >
                  <motion.img
                    src={imageUrl}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover rounded-lg"
                    onLoad={() => handleLoadComplete(item.id, "image")}
                  />
                </div>

                {/* Title */}
                <motion.div
                  className={`absolute inset-2 bg-black cursor-pointer bg-opacity-60 rounded-lg flex items-center justify-center ${
                    !isLoaded ? "invisible" : "visible"
                  }`}
                  initial={{ opacity: 1 }}
                  whileHover={{ opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className="text-white text-center text-lg font-semibold px-4"
                    ref={(node) => {
                      if (node && !seenItems.current[item.id]) {
                        seenItems.current[item.id] = true; // Prevents repeated updates
                        handleLoadComplete(item.id, "title");
                      }
                    }}
                  >
                    {item.title || item.name} {releaseYear && `(${releaseYear})`}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </Slider>
      ) : (
        <p className="text-center text-gray-500">
          No similar content available.
        </p>
      )}
    </div>
  );
};

export default SimilarContentSlider;
