import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import wppimgmovies from "../assets/img/wppimgmovies.jpg";
import Home from "./Home";
import WatchFilmList from "../components/WatchFilmList";
import { useContext, useEffect } from "react";
import { setError, setFeaturedMovies, setLoading } from "../redux/movieSlice";
import { getFeaturedMovies } from "../services/movieService";
import WatchSerieList from "../components/WatchSerieList";
import { setFeaturedSeries } from "../redux/serieSlice";
import { getFeaturedSeries } from "../services/serieService";
import ModalContext from "../context/ModalContext";
import Navbar from "../components/Navbar";
import { RingLoader } from "react-spinners";
import Footer from "../components/Footer";

const IndexLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const featuredSeries = useSelector((state) => state.series.featuredSeries);
  const featuredMovies = useSelector((state) => state.movies.featuredMovies);
  const dispatch = useDispatch();
  const { handleOpenModal } = useContext(ModalContext);

  useEffect(() => {
    if (!user) {
      const fetchMovies = async () => {
        dispatch(setLoading());
        const selectedMovies = [
          "Inception",
          "Interstellar",
          "The Wild Robot",
          "Black Cab",
          "Schindler's List",
          "The Menendez Brothers",
        ];
        try {
          const movies = await getFeaturedMovies(selectedMovies);
          const filteredMovies = movies.filter(
            (movie, index, self) =>
              index ===
              self.findIndex((m) => m.genres[0]?.name === movie.genres[0]?.name)
          );
          dispatch(setFeaturedMovies(filteredMovies));
        } catch (error) {
          dispatch(setError(error.message || "Error fetching movies"));
        }
      };

      fetchMovies();
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) {
      const fetchFeaturedSeries = async () => {
        dispatch(setLoading());
        try {
          const featuredSeries = await getFeaturedSeries({
            totalPages: 10,
            size: 20,
          });
          dispatch(setFeaturedSeries(featuredSeries));
        } catch (error) {
          dispatch(setError(error.message || "Error fetching series"));
        }
      };

      fetchFeaturedSeries();
    }
  }, [dispatch, user]);

  return user ? (
    <Home />
  ) : (
    <>
      {featuredSeries.length > 1 && featuredMovies.length > 1 ? (
        <div className="z-10">
          <Navbar />
          <header className="font-maxSans">
            <div className="relative flex bg-black min-h-screen w-full">
              <motion.img
                className="absolute top-0 left-0 h-full w-full object-cover object-center"
                src={wppimgmovies}
                alt="mimg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2 }}
              />

              <div className="absolute backdrop-blur-[2px] inset-0 bg-gradient-to-t from-[#0A0A1A] via-black/70 to-[rgba(0,0,0,0.14)]"></div>

              <div className="relative z-10 flex flex-col justify-center items-center text-center w-full cursor-default px-4 sm:px-8">
                <h1 className="font-bold font-maxSans text-8xl sm:text-8xl md:text-9xl lg:text-9xl text-white -mb-2  ">
                  vidaria
                </h1>
                <p className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  DISCOVER MORE, FOR LESS
                </p>

                <button
                  onClick={() => handleOpenModal("subscribe")}
                  className="btn py-3 px-5 bg-[rgb(0,43,231)] mt-4 text-white font-bold rounded-xl transition duration-150 hover:bg-[rgb(0,30,180)]"
                >
                  START YOUR JOURNEY NOW
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-8 my-8">
            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-1">
              <WatchFilmList movies={featuredMovies} />
              <WatchSerieList series={featuredSeries} />
            </div>
          </div>
          <Footer />
        </div>
      ) : (
        // RingLoader
        <div className="flex items-center justify-center h-screen">
          <RingLoader color="#0A0A1A" size={150} />
        </div>
      )}
    </>
  );
};

export default IndexLayout;
