import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { searchMovies } from "../services/movieService";
import { searchSeries } from "../services/serieService";
import { Link } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  // Maneja el cierre del dropdown al hacer clic fuera o presionar "Escape"
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsExpanded(false);
        setQuery("");
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
        setQuery("");
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
        const combinedResults = [...movies.content, ...series.content];
        setResults(combinedResults);
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
      <div
        className="absolute right-0 flex items-center"
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <FaSearch
          onClick={() => setIsExpanded(true)}
          className={`text-white cursor-pointer hover:text-gray-400 transition ${
            isExpanded ? "hidden" : "block"
          }`}
          size={24}
        />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "250px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg z-50"
              ref={inputRef}
            >
              <FaSearch className="text-gray-500 ml-3" />
              <input
                type="text"
                className="px-3 py-2 w-full bg-gray-800 text-white focus:outline-none"
                placeholder="Search movies or series..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown de resultados minimalista y en una sola fila por elemento */}
      <AnimatePresence>
        {isExpanded && results.length > 0 && (
          <motion.div
            className="fixed top-16 left-0 w-full bg-[#0a0a1a] z-50 shadow-lg p-4 overflow-y-auto"
            style={{ maxHeight: "60vh" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4 px-4">
              <h3 className="text-white text-lg font-bold">Search Results</h3>
              <FaTimes
                onClick={() => {
                  setIsExpanded(false);
                  setQuery("");
                }}
                className="text-white text-2xl cursor-pointer hover:text-gray-600"
              />
            </div>
            <div className="flex flex-col divide-y divide-slate-950">
              {results.map((item) => (
                <Link
                  key={item.id}
                  to={
                    item.media_type === "movie"
                      ? `/movies/${item.id}`
                      : `/series/${item.id}`
                  }
                >
                  <div className="flex items-center p-3 transition cursor-pointer hover:bg-gray-900 hover:shadow-lg">
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                          : item.background || item.backdrop
                      }
                      alt={item.title}
                      className="w-14 h-14 rounded-md object-cover bg-top bg-contain"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-white text-sm font-semibold">
                        {item.title || item.name || item.original_title}
                      </h3>
                      <p className="text-gray-500 text-xs">
                        {item.release_date ||
                        item.first_air_date ||
                        item.releaseDate
                          ? new Date(
                              item.release_date ||
                                item.releaseDate ||
                                item.first_air_date
                            ).getFullYear()
                          : new Date(item.first_air_date).getFullYear()}
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
