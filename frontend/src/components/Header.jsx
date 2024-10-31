import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { adjustImageQuality } from "../utils/sliderSettings";
import { fetchTagline } from "../services/detailsService";
import { Link } from "react-router-dom";

const Header = ({ headerMovies }) => {
  const [currentHeaderMovieIndex, setCurrentHeaderMovieIndex] = useState(0);
  const [currentTagline, setCurrentTagline] = useState("");
  const [allContentLoaded, setAllContentLoaded] = useState(false);

  const handleImageLoad = () => setAllContentLoaded(true);

  const fetchTaglineForCurrentMovie = async (movieId) => {
    if (movieId) {
      try {
        const tagline = await fetchTagline(movieId);
        setCurrentTagline(tagline);
      } catch (error) {
        console.error("Error fetching tagline for movie:", error);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeaderMovieIndex(
        (prevIndex) => (prevIndex + 1) % headerMovies.length
      );
      setAllContentLoaded(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [headerMovies]);

  useEffect(() => {
    const movieId = headerMovies[currentHeaderMovieIndex]?.id;
    if (movieId) {
      fetchTaglineForCurrentMovie(movieId);
    }
  }, [currentHeaderMovieIndex, headerMovies]);

  const currentHeaderMovie = headerMovies[currentHeaderMovieIndex] || {};

  return (
    <motion.header
      className="relative h-[70vh] md:h-[80vh] w-full mt-16 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {currentHeaderMovie && (
          <>
            {!allContentLoaded && (
              <div className="absolute inset-0 bg-[#0A0A1A] animate-pulse"></div>
            )}

            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#0A0A1A",
              }}
            >
              <motion.img
                key={currentHeaderMovie.background}
                src={adjustImageQuality(
                  currentHeaderMovie.background,
                  "original"
                )}
                alt={currentHeaderMovie.title}
                className={`absolute inset-0 w-full h-full object-cover ${
                  allContentLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={handleImageLoad}
                transition={{ duration: 1 }}
              />
            </div>

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#0A0A1A] via-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A1A] to-transparent"></div>

            {allContentLoaded && (
              <motion.div
                className="absolute bottom-8 left-0 z-10 max-w-lg md:max-w-xl lg:max-w-3xl p-2 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <h1 className="text-3xl text-white sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                  {currentHeaderMovie.title}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-white md:text-lg lg:text-xl leading-relaxed line-clamp-3">
                  {currentTagline || currentHeaderMovie.description}
                </p>

                <div className="mt-6 space-x-4">
                  <button className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-500 transition-all">
                    Play
                  </button>
                  <Link to={`/movies/${currentHeaderMovie.id}`}>
                    <button className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-700 transition-all">
                      More Info
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
