import { useContext, useEffect, useState } from "react";
import { fetchUserData } from "../services/authService";
import {
  getWatchlist,
  removeFromWatchlist,
  clearWatchlist as clearWatchlistService,
  fetchSerie,
} from "../services/detailsService";
import {
  fetchSeriePosterPath,
  fetchMoviePosterPath,
} from "../services/serieService";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import RealNavbar from "../components/RealNavbar";
import ModalContext from "../context/ModalContext";
import "../Watchlist.css";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [formattedWatchlist, setFormattedWatchlist] = useState([]);
  const navigate = useNavigate();
  const { isInWatchlist, setIsInWatchlist } = useContext(ModalContext);

  const handleRemoveItem = async (item) => {
    try {
      const userData = await fetchUserData();
      const userId = userData?.id;
      const movieId = item.movie ? item.movie.id : null;
      const serieId = item.serie ? item.serie.id : null;

      if (!userId) return;

      const response = await removeFromWatchlist(userId, movieId, serieId);
      if (response) {
        setWatchlist((prevList) =>
          prevList.filter(
            (watchlistItem) =>
              watchlistItem.movie?.id !== movieId &&
              watchlistItem.serie?.id !== serieId
          )
        );
        setIsInWatchlist(false);
      } else {
        console.error("Failed to remove item from watchlist");
      }
    } catch (error) {
      console.error("Error removing item from watchlist:", error);
    }
  };

  const handleClearWatchlist = async () => {
    try {
      const userData = await fetchUserData();
      if (!userData?.id) return;

      const response = await clearWatchlistService(userData.id);
      if (response) {
        setWatchlist([]);
        setIsInWatchlist(false);
      }
    } catch (error) {
      console.error("Error clearing watchlist:", error);
    }
  };

  const fetchPosterPath = async (item) => {
    if (item.movie) {
      const posterPath = await fetchMoviePosterPath(item.movie.id);
      return posterPath || item.movie.cover;
    } else if (item.serie) {
      const posterPath = await fetchSeriePosterPath(item.serie.id);
      return posterPath || item.serie.poster;
    }
    return null;
  };

  const fetchWatchlist = async () => {
    try {
      const userData = await fetchUserData();
      if (!userData?.id) return;

      const response = await getWatchlist(userData.id);

      if (response && response.length >= 0) {
        // Replace paths with valid poster paths
        const updatedWatchlist = await Promise.all(
          response.map(async (item) => {
            const posterPath = await fetchPosterPath(item);
            return {
              ...item,
              posterPath,
            };
          })
        );

        setWatchlist(updatedWatchlist);
      } else {
        setWatchlist([]);
      }
    } catch (e) {
      console.error("Error fetching watchlist:", e);
    }
  };

  const formatDate = async (item) => {
    if (item.movie) {
      return new Date(
        item.movie.releaseDate || item.movie.release_date
      ).getFullYear();
    } else if (item.serie) {
      const startYear = new Date(
        item.serie.first_air_date || item.serie.release_date
      ).getFullYear();
      const endYear = await fetchSerie(item.serie.id).then((response) =>
        new Date(response.last_air_date).getFullYear()
      );

      return startYear === endYear
        ? `${startYear}`
        : `${startYear} - ${endYear}`;
    }

    return "N/A";
  };

  useEffect(() => {
    fetchWatchlist();
  }, [isInWatchlist]);

  useEffect(() => {
    const formatWatchlistDates = async () => {
      const formatted = await Promise.all(
        watchlist.map(async (item) => {
          const date = await formatDate(item);
          return { ...item, formattedDate: date };
        })
      );
      setFormattedWatchlist(formatted);
    };

    formatWatchlistDates();
  }, [watchlist]);

  return (
    <>
      <RealNavbar />
      <motion.div
        className="p-6 min-h-screen bg-[#0A0A1A] flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.h2
          className="text-4xl font-bold mb-8 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          My Watchlist
        </motion.h2>

        {formattedWatchlist.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full max-w-7xl"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delayChildren: 0.5,
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {formattedWatchlist.map((item) => (
                <motion.div
                  key={item.id}
                  className="relative bg-[#0A0A1A] p-2 rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() =>
                    navigate(
                      `/${item.movie ? "movies" : "series"}/${
                        item.movie?.id || item.serie?.id
                      }`
                    )
                  }
                >
                  <img
                    src={item.posterPath}
                    alt={item.movie?.title || item.serie?.title || "No title"}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                  <div className="flex flex-col items-start justify-between mt-2 text-white relative">
                    <h3 className="text-sm font-semibold truncate w-full">
                      {item.movie?.title || item.serie?.title || "No title"}
                    </h3>
                    <span className="text-sm font-semibold text-gray-300 mt-1">
                      {item.formattedDate}
                    </span>
                    <button
                      className="absolute -bottom-1 right-0 p-2 text-red-500 bg-gray-900 hover:bg-red-900 hover:text-white rounded-full transition duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item);
                      }}
                    >
                      <FaTrash className="text-md" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>{" "}
            <motion.button
              onClick={handleClearWatchlist}
              className="mt-12 px-12 py-3 bg-red-700 text-white font-semibold rounded hover:bg-red-600 transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Clear Watchlist
            </motion.button>
          </>
        ) : (
          <motion.div
            className="text-center text-white mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-2xl">Your Watchlist is Empty</h3>
            <p className="mt-4">
              Browse movies and series to add them to your watchlist!
            </p>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default Watchlist;
