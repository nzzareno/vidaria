import { useContext, useEffect, useState } from "react";
import { fetchUserData } from "../services/authService";
import {
  getWatchlist,
  removeFromWatchlist,
  clearWatchlist as clearWatchlistService,
} from "../services/detailsService";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import { motion } from "framer-motion";
import RealNavbar from "../components/RealNavbar";
import ModalContext from "../context/ModalContext";
import "../Watchlist.css";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const navigate = useNavigate();
  const { isInWatchlist, setIsInWatchlist } = useContext(ModalContext);
  const [isBroken, setIsBroken] = useState(false);

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

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const userData = await fetchUserData();
        if (!userData?.id) return;

        const response = await getWatchlist(userData.id);

        if (response && response.length >= 0) {
          setWatchlist(response);
        } else {
          setWatchlist([]);
        }
      } catch (e) {
        console.error("Your watchlist is empty", e);
      }
    };

    fetchWatchlist();
  }, [isInWatchlist]);

  return (
    <>
      <RealNavbar />
      <motion.div
        className="p-6 min-h-screen bg-gray-800 flex flex-col items-center"
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

        {watchlist.length > 0 ? (
          <>
            <motion.button
              onClick={handleClearWatchlist}
              className="mb-8 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Clear Watchlist
            </motion.button>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl"
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
              {watchlist.map((item) => {
                return (
                  <motion.div
                    key={item.id}
                    className="relative bg-gray-900 p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() =>
                      navigate(
                        `/${item.movie ? "movies" : "series"}/${
                          item.movie?.id || item.serie?.id
                        }`
                      )
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w300${
                        item.movie?.cover || item.serie?.poster
                      }`}
                      alt={item.movie?.title || item.serie?.title || "No title"}
                      className="w-full h-48 object-cover rounded-lg shadow-lg"
                    />
                    <div className="flex items-center justify-between mt-4 text-white">
                      <h3 className="text-md font-semibold truncate">
                        {item.movie?.title || item.serie?.title || "No title"}
                      </h3>
                      <span
                        className="cursor-pointer transition-transform duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBroken(true);
                          handleRemoveItem(item);
                        }}
                      >
                        {isBroken ? (
                          <FaHeartBroken className="text-red-500 hover:text-red-700 transition-all duration-300" />
                        ) : (
                          <FaHeart className="text-red-500 hover:text-red-700 transition-all duration-300" />
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
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
