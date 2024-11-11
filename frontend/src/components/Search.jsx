import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { searchMovies } from "../services/movieService"; // API interna
import { searchSeries } from "../services/serieService"; // API interna
import { Link } from "react-router-dom";

const VITE_API_KEY = import.meta.env.VITE_API_KEY; // Reemplaza con tu clave de TMDB

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIconVisible, setIsIconVisible] = useState(true); // Control para el ícono de búsqueda
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1120);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1120);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClose = () => {
    setIsExpanded(false);
    setQuery("");
    setTimeout(() => setIsIconVisible(true), 200); // Muestra el ícono después de la animación
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        handleClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      try {
        const movies = await searchMovies({ title: query });
        const series = await searchSeries({ title: query });
        const tmdbMoviesResponse = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${VITE_API_KEY}&query=${query}`
        );
        const tmdbSeriesResponse = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${VITE_API_KEY}&query=${query}`
        );

        const tmdbMovies = await tmdbMoviesResponse.json();
        const tmdbSeries = await tmdbSeriesResponse.json();

        const combinedResults = [
          ...movies.content.map((item) => ({
            ...item,
            source: "local",
            media_type: "movie",
          })),
          ...series.content.map((item) => ({
            ...item,
            source: "local",
            media_type: "tv",
          })),
          ...(tmdbMovies.results || []).map((item) => ({
            ...item,
            source: "tmdb",
            media_type: "movie",
          })),
          ...(tmdbSeries.results || []).map((item) => ({
            ...item,
            source: "tmdb",
            media_type: "tv",
          })),
        ];

        const filteredResults = combinedResults.filter(
          (item) =>
            item.poster_path &&
            (item.title || item.name) &&
            (item.release_date || item.first_air_date)
        );

        setResults(filteredResults);
        console.log("Resultados de búsqueda:", filteredResults);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative flex items-center">
      <div className="absolute right-0 flex items-center">
        {isIconVisible && (
          <FaSearch
            onClick={() => {
              setIsExpanded(true);
              setIsIconVisible(false); // Oculta el ícono al abrir el input
            }}
            className={`text-white cursor-pointer hover:text-gray-400 transition ${
              isExpanded ? "hidden" : "block"
            }`}
            size={24}
          />
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: isMobile ? "100vw" : 0, opacity: 0 }}
              animate={{
                width: isMobile ? "100vw" : "335px",
                opacity: 1,
                height: isMobile ? "100vh" : "auto",
              }}
              exit={{
                opacity: 0,
                width: isMobile ? "100vw" : 0,
                height: isMobile ? "100vh" : "auto",
              }}
              transition={{ duration: 0.2 }}
              className={`${
                isMobile ? "fixed inset-0 bg-[#0A0A1A] z-50 p-6" : "bg-gray-800"
              } flex flex-col items-center text-white rounded-lg overflow-hidden shadow-lg`}
              ref={inputRef}
            >
              <div className="w-full flex items-center bg-gray-800 p-2">
                <input
                  type="text"
                  className="px-2 w-full bg-gray-800 text-white focus:outline-none"
                  placeholder="Search movies or series..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  style={{ width: "100%" }}
                />
                <FaTimes
                  onClick={handleClose}
                  className="text-white text-2xl cursor-pointer ml-3 hover:text-gray-400"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isExpanded && results.length > 0 && (
          <motion.div
            className={`${
              isMobile
                ? "fixed inset-0 top-[5.5rem] bg-[#0a0a1a] z-50 overflow-y-auto"
                : "absolute top-8 right-0 bg-[#0a0a1a] z-50 overflow-y-auto w-[450px]"
            } shadow-lg p-4 custom-scrollbar`}
            style={{
              maxHeight: isMobile ? "calc(100vh - 80px)" : "60vh",
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col divide-y divide-slate-950 overflow-y-auto custom-scrollbar">
              {results.map((item) => (
                <Link
                  key={(item.source === "tmdb" ? "tmdb-" : "local-") + item.id}
                  to={
                    item.media_type === "movie"
                      ? `/movies/${item.id}`
                      : `/series/${item.id}`
                  }
                  onClick={() => setIsExpanded(false)}
                >
                  <div className="flex items-center p-3 transition cursor-pointer hover:bg-gray-900 hover:shadow-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-14 h-14 rounded-md object-cover bg-top bg-contain"
                    />
                    <div className="ml-4 flex-1 overflow-hidden">
                      <h3 className="text-white text-md text-center font-semibold truncate">
                        {item.title || item.name}
                      </h3>
                      <p className="text-gray-500 font-bold text-sm text-center truncate">
                        {new Date(
                          item.release_date || item.first_air_date
                        ).getFullYear()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
