import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion"; // Importa el componente motion
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

const IndexLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const featuredSeries = useSelector((state) => state.series.featuredSeries);
  const featuredMovies = useSelector((state) => state.movies.featuredMovies);
  const dispatch = useDispatch();
  const { setIsModalOpen } = useContext(ModalContext);

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(setLoading());
      try {
        const movies = await getFeaturedMovies();
        const filteredMovies = movies.filter(
          (movie, index, self) =>
            index ===
            self.findIndex((m) => m.genres[0].name === movie.genres[0].name)
        );

        dispatch(setFeaturedMovies(filteredMovies));
      } catch (error) {
        dispatch(setError(error));
      }
    };

    fetchMovies();
  }, [dispatch]);

  useEffect(() => {
    const fetchFeaturedSeries = async () => {
      dispatch(setLoading());
      try {
        const featuredSeries = await getFeaturedSeries({
          totalPages: 5,
          size: 20,
        });
        dispatch(setFeaturedSeries(featuredSeries));
      } catch (error) {
        dispatch(setError(error));
      }
    };

    fetchFeaturedSeries();
  }, [dispatch]);

  return user ? (
    <Home />
  ) : (
    <>
      <Navbar />
      <header className="font-maxSans">
        <div className="relative flex bg-black min-h-screen w-full">
          {/* Imagen con efecto de fade-in */}
          <motion.img
            className="absolute top-0 left-0 h-full w-full object-cover object-center"
            src={wppimgmovies}
            alt="mimg"
            initial={{ opacity: 0, scale: 0.9 }} // Inicia invisible y un poco más pequeño
            animate={{ opacity: 1, scale: 1 }} // Se desvanece a visible y escala a su tamaño original
            transition={{ duration: 2 }} // Duración de la animación
          />

          {/* Overlay con degradado oscuro desde abajo hacia arriba */}
          <div className="absolute backdrop-blur-[2px] inset-0 bg-gradient-to-t from-[#0A0A1A] via-black/70 to-[rgba(0,0,0,0.14)]"></div>

          {/* Contenido encima de la imagen */}
          <div className="relative z-10 flex flex-col justify-center items-center text-center w-full cursor-default ">
            <h1 className="font-bold font-maxSans text-9xl text-white transition duration-300 ease-in-out transform -mb-5">
              vidaria
            </h1>
            <p className="text-[2rem] font-bold text-white">
              DISCOVER MORE, FOR LESS
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn py-3 px-4 bg-[rgb(0,43,231)] mt-4 text-white font-bold rounded-xl border-transparent transition duration-100 ease-in transform hover:bg-[rgb(0,30,180)]"
            >
              START YOUR JOURNEY NOW
            </button>
          </div>
        </div>
      </header>

      <WatchFilmList movies={featuredMovies} />
      <WatchSerieList series={featuredSeries} />
    </>
  );
};

export default IndexLayout;
