import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading, setError } from "../redux/movieSlice";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { getMoviesByCategory } from "../services/movieService";
import { RingLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaBars } from "react-icons/fa";
import { GrLogout } from "react-icons/gr";

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [headerMovies, setHeaderMovies] = useState([]);
  const [loading, setLoadingState] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentHeaderMovieIndex, setCurrentHeaderMovieIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState({
    popular: 0,
    upcoming: 0,
    trending: 0,
    nowPlaying: 0,
    topRated: 0,
  });
  const [isNextDisabled, setIsNextDisabled] = useState({
    popular: false,
    upcoming: false,
    trending: false,
    nowPlaying: false,
    topRated: false,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isOnMobile = window.innerWidth <= 768;
  const slidesToShow = 8;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeaderMovieIndex(
        (prevIndex) => (prevIndex + 1) % headerMovies.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [headerMovies]);

  useEffect(() => {
    const fetchMoviesByCategory = async (category, setMovies, pages = 1) => {
      dispatch(setLoading());
      try {
        const movies = [];
        for (let page = 0; page <= pages; page++) {
          const response = await getMoviesByCategory(category, {
            page,
            size: 20,
          });
          movies.push(...response);
        }
        setMovies(movies);
        setLoadingState(false);
      } catch (error) {
        console.error(`Error fetching ${category} movies:`, error);
        dispatch(setError(error));
        setLoadingState(false);
      }
    };

    fetchMoviesByCategory("popular", setPopularMovies, 4);
    fetchMoviesByCategory("top_rated", setTopRatedMovies, 4);
    fetchMoviesByCategory("upcoming", setUpcomingMovies, 4);
    fetchMoviesByCategory("now_playing", setNowPlayingMovies, 4);
    fetchMoviesByCategory("trending", setTrendingMovies, 4);
    fetchMoviesByCategory("top_rated", setHeaderMovies, 4);
  }, [dispatch]);

  const handleBeforeChange = (category, current, next) => {
    setCurrentSlide((prev) => ({ ...prev, [category]: next }));
    const totalSlides = Math.ceil(
      {
        popular: popularMovies,
        upcoming: upcomingMovies,
        trending: trendingMovies,
        nowPlaying: nowPlayingMovies,
        topRated: topRatedMovies,
      }[category].length / slidesToShow
    );
    const isAtEnd = next >= totalSlides - 1;
    setIsNextDisabled((prev) => ({ ...prev, [category]: isAtEnd }));
  };

  const currentHeaderMovie = headerMovies[currentHeaderMovieIndex] || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "auth/logout" });
    navigate("/");
  };

  const adjustImageQuality = (url, quality = "original") => {
    return url ? url.replace(/\/w\d+/, `/${quality}`) : "";
  };

  const PrevArrow = ({ onClick }) => (
    <div
      className="custom-prev-arrow"
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: "10px",
        zIndex: 2,
        background: "rgba(255, 255, 255, 0.8)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <FaArrowLeft size={20} color="black" />
    </div>
  );

  const NextArrow = ({ onClick, isDisabled }) => (
    <div
      className={`custom-next-arrow ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        right: "10px",
        zIndex: 2,
        background: "rgba(255, 255, 255, 0.8)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
      onClick={!isDisabled ? onClick : undefined}
    >
      <FaArrowRight size={20} color="black" />
    </div>
  );

  const createSliderSettings = (category) => ({
    dots: false,
    infinite: false,
    speed: 500,
    autoplay: false,
    arrows: true,
    prevArrow: currentSlide[category] > 0 ? <PrevArrow /> : null,
    nextArrow: <NextArrow isDisabled={isNextDisabled[category]} />,
    draggable: false,
    beforeChange: (current, next) =>
      handleBeforeChange(category, current, next),
    slidesToShow,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  });


  const formatCategoryTitle = (category) => {
    return category
      .replace(/([A-Z])/g, " $1") // Inserta un espacio antes de cada letra mayúscula
      .replace(/^./, (str) => str.toUpperCase()); // Capitaliza la primera letra
  };

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors text-white bg-[#0A0A1A] ">
      <nav className="fixed top-0 left-0 w-full z-50 shadow-md transition-colors duration-200 bg-[#0A0A1A]">
        <div className="flex items-center justify-between py-4 px-4">
          {/* Título a la izquierda */}
          <h1 className="text-3xl font-bold text-white">vidaria</h1>

          {/* Opciones de navegación centradas */}
          <div className="hidden md:flex flex-1 justify-center space-x-6">
            <a href="/" className=" hover:text-gray-400">
              Home
            </a>
            <a href="/movies" className="hover:text-gray-400">
              Movies
            </a>
            <a href="/about" className="hover:text-gray-400">
              TV Shows
            </a>
          </div>

          {!isMobile && (
            <div className="flex space-x-4">
              <a
                onClick={handleLogout}
                className="cursor-pointer hover:text-gray-400"
              >
                <GrLogout size={24} />
              </a>
            </div>
          )}

          {/* Botón de menú para móviles */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaBars size={24} />
          </button>
        </div>

        {/* Menú desplegable para móviles */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 px-4 pb-4 bg-[#0A0A1A]">
            <a href="/" className="hover:text-gray-400">
              Home
            </a>
            <a href="/movies" className="hover:text-gray-400">
              Movies
            </a>
            <a href="/about" className="hover:text-gray-400">
              TV Shows
            </a>

            {/* Botones separados en la parte inferior derecha */}
            <div className=" flex flex-col items-end mt-4 space-y-2">
              {" "}
              <a
                onClick={handleLogout}
                className="cursor-pointer hover:text-gray-400"
              >
                <GrLogout size={24} />
              </a>
            </div>
          </div>
        )}
      </nav>

      <motion.header
        className="relative h-[70vh] md:h-[80vh] w-full mt-16 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }} // Ajusta la duración de la animación según tus preferencias
      >
        <AnimatePresence>
          {currentHeaderMovie && (
            <>
              <motion.img
                key={currentHeaderMovie.background}
                src={adjustImageQuality(currentHeaderMovie.background)}
                alt={currentHeaderMovie.title}
                className="absolute inset-0 w-full h-full  md:object-fill xl:object-cover object-fill md:object-top lg:object-top"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }} // Ajusta la duración para que la transición sea más suave
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#0A0A1A] via-black/60 to-transparent"></div>

              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A1A] to-transparent"></div>
              <div className="absolute bottom-8 left-0 z-10 max-w-lg md:max-w-xl lg:max-w-2xl p-2 text-left">
                <h1 className="text-3xl text-white sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                  {currentHeaderMovie.title}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-white md:text-lg lg:text-xl leading-relaxed line-clamp-4">
                  {currentHeaderMovie.description}
                </p>
                <div className="mt-6 space-x-4">
                  <button className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-500 transition-all">
                    Play
                  </button>
                  <button className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-700 transition-all">
                    More Info
                  </button>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {loading ? (
        <div className="flex justify-center items-center min-h-screen bg-white">
          <RingLoader color="#FF0000" size={200} />
        </div>
      ) : (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-10 mt-10 px-2 md:px-4 lg:px-8"
        >
          {["upcoming", "popular", "trending", "nowPlaying", "topRated"].map(
            (category) =>
              ({
                upcoming: upcomingMovies,
                popular: popularMovies,
                trending: trendingMovies,
                nowPlaying: nowPlayingMovies,
                topRated: topRatedMovies,
              }[category].length > 0 && (
                <div className="space-y-6" key={category}>
                  <h2 className="text-3xl font-bold  text-white  ">
                    {`${
                      formatCategoryTitle(category) 
                    } Movies`}
                  </h2>
                  <Slider
                    {...createSliderSettings(category)}
                    className="overflow-hidden"
                  >
                    {{
                      upcoming: upcomingMovies,
                      popular: popularMovies,
                      trending: trendingMovies,
                      nowPlaying: nowPlayingMovies,
                      topRated: topRatedMovies,
                    }[category].map((movie) => (
                      <motion.div
                        key={movie.id}
                        className="px-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div className="relative   bg-[#0A0A1A] cursor-pointer transition-colors rounded-lg">
                          <motion.img
                            src={movie.cover}
                            alt={movie.title}
                            className="w-full h-[19rem] object-cover"
                            whileHover={{
                              opacity: 0.7,
                            }}
                          />
                        </motion.div>
                      </motion.div>
                    ))}
                  </Slider>
                </div>
              ))
          )}
        </motion.section>
      )}
    </div>
  );
};

export default Home;
