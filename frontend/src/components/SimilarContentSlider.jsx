import Slider from "react-slick";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { SyncLoader } from "react-spinners";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";

const SimilarContentSlider = ({ similarContent, handleSimilarClick }) => {
  const [loadedItems, setLoadedItems] = useState({});
  const seenItems = useRef({});

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

  useEffect(() => {
    similarContent.forEach((item) => {
      const img = new Image();
      img.src = item.backdrop_path;
    });
  }, [similarContent]);

  // Filtrar elementos únicos
  const filteredContent = similarContent.reduce((acc, item) => {
    if (
      !acc.some((existingItem) => existingItem.id === item.id) &&
      item.backdrop_path &&
      (item.title || item.name) &&
      item.id &&
      (item.release_date || item.first_air_date)
    ) {
      acc.push(item);
    }
    return acc;
  }, []);

  const getImageUrl = (backdropPath) =>
    backdropPath.startsWith("https")
      ? backdropPath
      : `https://image.tmdb.org/t/p/w780${backdropPath}`;

  const handleLoadComplete = (id, type) => {
    setLoadedItems((prev) => {
      const updated = { ...prev, [id]: { ...(prev[id] || {}), [type]: true } };
      return updated;
    });
  };

  return (
    <>
      {filteredContent.length > 4 && (
        <div className="w-full py-10 mt-10">
          <h2 className="text-xl lg:text-2xl font-bold mb-6">May also like</h2>
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
                  className="w-36 h-64 p-2 relative flex-shrink-0"
                  onClick={() => handleSimilarClick(item)}
                >
                  {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a1a] bg-opacity-75 rounded-lg z-10">
                      <SyncLoader size={10} color="#FF0000" />
                    </div>
                  )}

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
                          seenItems.current[item.id] = true;
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
        </div>
      )}
    </>
  );
};

export default SimilarContentSlider;
