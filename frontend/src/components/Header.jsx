// Header.jsx

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { adjustImageQuality } from "../utils/sliderSettings";
import { fetchTagline } from "../services/detailsService";
import { Link } from "react-router-dom";

const Header = ({
  headerMovies = [],
  headerSeries = [],
  isSeriesPage = false,
  isMoviesPage = false,
  isCombinedPage = false,
}) => {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [currentSerieIndex, setCurrentSerieIndex] = useState(0);
  const [currentTagline, setCurrentTagline] = useState("");
  const [allContentLoaded, setAllContentLoaded] = useState(false);

  // Determina el contenido actual según la página
  const currentContent = isSeriesPage
    ? headerSeries[currentSerieIndex]
    : isMoviesPage
    ? headerMovies[currentMovieIndex]
    : isCombinedPage
    ? currentMovieIndex % 2 === 0
      ? headerMovies[currentMovieIndex / 2]
      : headerSeries[Math.floor(currentMovieIndex / 2)]
    : null;

  const backgroundImage =
    currentContent?.background || currentContent?.backdrop;

  const handleImageLoad = () => setAllContentLoaded(true);

  useEffect(() => {
    if (
      (isSeriesPage && !headerSeries.length) ||
      (isMoviesPage && !headerMovies.length) ||
      (isCombinedPage && (!headerMovies.length || !headerSeries.length))
    )
      return;

    const interval = setInterval(() => {
      if (isSeriesPage) {
        setCurrentSerieIndex(
          (prevIndex) => (prevIndex + 1) % headerSeries.length
        );
      } else if (isMoviesPage) {
        setCurrentMovieIndex(
          (prevIndex) => (prevIndex + 1) % headerMovies.length
        );
      } else if (isCombinedPage) {
        setCurrentMovieIndex(
          (prevIndex) =>
            (prevIndex + 1) % (headerMovies.length + headerSeries.length)
        );
      }
      setAllContentLoaded(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [
    headerMovies.length,
    headerSeries.length,
    isSeriesPage,
    isMoviesPage,
    isCombinedPage,
  ]);

  useEffect(() => {
    const fetchTaglineForCurrentContent = async (contentId) => {
      if (contentId) {
        try {
          const tagline = await fetchTagline(
            contentId,
            isSeriesPage ||
              (isCombinedPage &&
                currentContent === headerSeries[currentSerieIndex])
              ? "tv"
              : "movie"
          );
          setCurrentTagline(tagline);
        } catch (error) {
          console.error("Error fetching tagline:", error);
        }
      }
    };
    const contentId = isSeriesPage
      ? headerSeries[currentSerieIndex]?.id
      : isMoviesPage
      ? headerMovies[currentMovieIndex]?.id
      : isCombinedPage
      ? currentContent?.id
      : null;

    if (contentId) {
      fetchTaglineForCurrentContent(contentId);
    }
  }, [
    currentMovieIndex,
    currentSerieIndex,
    headerMovies,
    headerSeries,
    isSeriesPage,
    isMoviesPage,
    isCombinedPage,
    currentContent,
  ]);

  return (
    <motion.header
      className="relative h-full md:h-[80vh] w-full mt-16 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {currentContent && (
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
              <AnimatePresence mode="wait">
                <motion.img
                  key={backgroundImage}
                  src={adjustImageQuality(backgroundImage, "original")}
                  alt={currentContent.title || "No Title Available"}
                  className={`absolute inset-0 w-full h-full object-cover object-top ${
                    allContentLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={handleImageLoad}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                />
              </AnimatePresence>
            </div>

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#0A0A1A] via-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A1A] to-transparent"></div>

            {allContentLoaded && (
              <motion.div
                className="absolute bottom-8 left-0 z-20 max-w-lg md:max-w-xl lg:max-w-3xl p-2 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <h1 className="text-3xl text-white sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                  {currentContent.title || "Title not available"}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-white md:text-lg lg:text-xl leading-relaxed line-clamp-3">
                  {currentTagline ||
                    currentContent.description ||
                    "No description available"}
                </p>

                <div className="mt-6 space-x-4">
                  <button className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-500 transition-all">
                    Play
                  </button>
                  {currentContent && (
                    <Link
                      to={`/${
                        isSeriesPage ||
                        (isCombinedPage &&
                          currentContent === headerSeries[currentSerieIndex])
                          ? "series"
                          : "movies"
                      }/${currentContent.id}`}
                    >
                      <button className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-700 transition-all">
                        More Info
                      </button>
                    </Link>
                  )}
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
