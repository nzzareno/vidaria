import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading, setError } from "../redux/movieSlice";
import Slider from "react-slick";
import { RingLoader } from "react-spinners";
import { motion } from "framer-motion";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";
import { createSliderSettings } from "../utils/sliderSettings.jsx";
import RealNavbar from "../components/RealNavbar.jsx";
import Header from "../components/Header.jsx";
import { getMoviesByGenre } from "../services/movieService.js"; // Cambiado a "getMoviesByGenre"
import { Link } from "react-router-dom";

const Movies = () => {
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [headerMovies, setHeaderMovies] = useState([]); // Estado para las películas del header
  const [loading, setLoadingState] = useState(false);
  const [currentSlide, setCurrentSlide] = useState({});
  const [isNextDisabled, setIsNextDisabled] = useState({});
  const dispatch = useDispatch();

  const slidesToShow = 8;

  const handleBeforeChange = (genreId, current, next) => {
    setCurrentSlide((prev) => ({ ...prev, [genreId]: next }));
    const totalSlides = Math.ceil(moviesByGenre[genreId].length / slidesToShow);
    const isAtEnd = next >= totalSlides - 1;
    setIsNextDisabled((prev) => ({ ...prev, [genreId]: isAtEnd }));
  };

  useEffect(() => {
    const fetchMoviesByGenre = async (genreName, pages = 1) => {
      dispatch(setLoading());
      setLoadingState(true);
      try {
        const moviesSet = new Set();
        const movies = [];

        for (let page = 1; page <= pages; page++) {
          const response = await getMoviesByGenre(genreName, {
            page,
            size: 20,
          });

          response.forEach((movie) => {
            if (!moviesSet.has(movie.title)) {
              moviesSet.add(movie.title);
              movies.push(movie);
            }
          });
        }

        setMoviesByGenre((prev) => ({ ...prev, [genreName]: movies }));
        setLoadingState(false);

        // Agrega algunas películas de cada género a `headerMovies`
        if (movies.length > 0) {
          setHeaderMovies((prev) => [...prev, ...movies.slice(0, 5)]); // Solo los primeros 5 de cada género
        }
      } catch (error) {
        dispatch(setError(error.message));
        setLoadingState(false);
      }
    };

    const genres = ["Action", "Comedy", "Drama", "Mystery", "Horror"];

    genres.forEach((genre) => {
      fetchMoviesByGenre(genre, 2); // Puedes ajustar la cantidad de páginas
    });

    return () => {
      setMoviesByGenre({});
      setHeaderMovies([]);
    };
  }, [dispatch]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen bg-[#0A0A1A]">
          <RingLoader color="#FF0000" size={200} />
        </div>
      ) : (
        <div className="min-h-screen overflow-x-hidden transition-colors text-white bg-[#0A0A1A]">
          <RealNavbar />
          <Header
            headerMovies={headerMovies}
            isMoviesPage={true}
            isCombinedPage={false}
          />{" "}
          {/* Pasamos las películas seleccionadas */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-10 mt-10 px-4 md:px-8 lg:px-12"
          >
            {Object.keys(moviesByGenre).map((genre) => (
              <div className="space-y-4" key={genre}>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{`${genre} Movies`}</h2>
                <Slider
                  {...createSliderSettings(
                    genre,
                    currentSlide,
                    setIsNextDisabled,
                    slidesToShow,
                    isNextDisabled,
                    PrevArrow,
                    NextArrow,
                    handleBeforeChange
                  )}
                  className="overflow-hidden"
                >
                  {moviesByGenre[genre].map((movie) => (
                    <motion.div
                      key={movie.id}
                      className="px-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div className="relative bg-[#0A0A1A] cursor-pointer transition-colors rounded-lg">
                        <Link to={`/movies/${movie.id}`}>
                          <motion.img
                            src={movie.cover}
                            alt={movie.title}
                            className="w-full h-[12rem] md:h-[16rem] lg:h-[19rem] object-cover rounded-lg"
                            whileHover={{
                              opacity: 0.7,
                            }}
                          />
                        </Link>
                      </motion.div>
                    </motion.div>
                  ))}
                </Slider>
              </div>
            ))}
          </motion.section>
        </div>
      )}
    </>
  );
};

export default Movies;
