import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError } from "../redux/movieSlice";
import Slider from "react-slick";
import { getMoviesByCategory } from "../services/movieService";
import { getPopularSeries, getHeaderSeries } from "../services/serieService"; // Import necessary series functions
import { RingLoader } from "react-spinners";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";
import {
  adjustImageQuality,
  createSliderSettings,
} from "../utils/sliderSettings.jsx";
import RealNavbar from "../components/RealNavbar.jsx";
import { Link } from "react-router-dom";

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [headerMovies, setHeaderMovies] = useState([]);
  const [headerSeries, setHeaderSeries] = useState([]); // Series for the header
  const [popularSeries, setPopularSeries] = useState([]); // State for popular series
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
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.movies);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
      setCurrentSlide({
        popular: 0,
        upcoming: 0,
        trending: 0,
        nowPlaying: 0,
        topRated: 0,
      });
      setIsNextDisabled({
        popular: false,
        upcoming: false,
        trending: false,
        nowPlaying: false,
        topRated: false,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBeforeChange = useCallback(
    (category, current, next) => {
      const slidesToShow = getSlidesToShow(windowSize);
      setCurrentSlide((prev) => ({ ...prev, [category]: next }));

      const categoryItems = {
        popular: popularMovies,
        upcoming: upcomingMovies,
        trending: trendingMovies,
        nowPlaying: nowPlayingMovies,
        topRated: topRatedMovies,
        popularSeries: popularSeries,
      }[category];

      const totalItems = categoryItems.length;
      const isAtEnd = next + slidesToShow >= totalItems;

      setIsNextDisabled((prev) => ({ ...prev, [category]: isAtEnd }));
    },
    [
      popularMovies,
      upcomingMovies,
      trendingMovies,
      nowPlayingMovies,
      topRatedMovies,
      popularSeries,
      windowSize,
    ]
  );

  const fetchMoviesByCategory = useCallback(
    async (category, setMovies, pages = 1) => {
      try {
        const movies = [];
        for (let page = 1; page <= pages; page++) {
          const response = await getMoviesByCategory(category, {
            page,
            size: 10,
          });
          movies.push(...response);
        }
        setMovies(movies);
        return movies;
      } catch (error) {
        dispatch(setError(error.message));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const loadAllContent = async () => {
      dispatch(setLoading(true));

      try {
        const [
          popular,
          topRated,
          upcoming,
          nowPlaying,
          trending,
          headerSeriesData,
          popularSeriesData,
        ] = await Promise.all([
          fetchMoviesByCategory("popular", setPopularMovies, 2),
          fetchMoviesByCategory("top_rated", setTopRatedMovies, 2),
          fetchMoviesByCategory("upcoming", setUpcomingMovies, 2),
          fetchMoviesByCategory("now_playing", setNowPlayingMovies, 2),
          fetchMoviesByCategory("trending", setTrendingMovies, 2),
          getHeaderSeries(), // Fetch header series
          getPopularSeries(), // Fetch popular series
        ]);

        const allMovies = [
          ...popular,
          ...topRated,
          ...upcoming,
          ...nowPlaying,
          ...trending,
        ];
        const highPopularityMovies = allMovies.filter(
          (movie) => movie.rating && movie.rating >= 7.3
        );
        const shuffledMovies = highPopularityMovies
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setHeaderMovies(shuffledMovies);

        setHeaderSeries(headerSeriesData); // Set header series
        setPopularSeries(popularSeriesData); // Set popular series
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadAllContent();
  }, [fetchMoviesByCategory, dispatch]);

  const getSlidesToShow = (width) => {
    if (width >= 1440) return 8;
    if (width >= 1200) return 5;
    if (width >= 1100) return 4;
    if (width >= 768) return 2;
    return 1;
  };

  const renderSliderSection = (
    title,
    categoryItems,
    categoryKey,
    titleClass
  ) => (
    <motion.section
      key={categoryKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-10 mt-6 px-4 md:px-8"
    >
      {categoryItems.length > 0 && (
        <div className="space-y-4">
          <h2 className={`text-2xl md:text-3xl font-bold ${titleClass}`}>
            {title}
          </h2>
          <Slider
            {...createSliderSettings(
              categoryKey,
              currentSlide,
              setIsNextDisabled,
              getSlidesToShow(windowSize),
              isNextDisabled,
              PrevArrow,
              NextArrow,
              handleBeforeChange
            )}
            className="overflow-hidden"
            key={windowSize}
          >
            {categoryItems.map((item) => (
              <Link
                to={`/${categoryKey.includes("Series") ? "series" : "movies"}/${
                  item.id
                }`}
                key={item.id}
              >
                <motion.div
                  className="px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div className="relative bg-[#0A0A1A] cursor-pointer transition-colors rounded-lg">
                    <motion.img
                      src={adjustImageQuality(
                        item.cover || item.poster,
                        "w300"
                      )}
                      alt={item.title}
                      className="w-full h-auto max-h-[200px] md:max-h-[300px] object-cover rounded-lg"
                      whileHover={{ opacity: 0.7 }}
                    />
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </Slider>
        </div>
      )}
    </motion.section>
  );

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
            headerSeries={headerSeries}
            isCombinedPage={true}
          />
          <div className="space-y-6 px-4 md:px-8 mt-4">
            {renderSliderSection(
              "Popular Movies",
              popularMovies,
              "popular",
              "text-2xl md:text-3xl font-bold mb-4"
            )}
            {renderSliderSection(
              "Top Rated Movies",
              topRatedMovies,
              "topRated",
              "text-2xl md:text-3xl font-bold mb-4"
            )}
            {renderSliderSection(
              "Upcoming Movies",
              upcomingMovies,
              "upcoming",
              "text-2xl md:text-3xl font-bold mb-4"
            )}
            {renderSliderSection(
              "Now Playing Movies",
              nowPlayingMovies,
              "nowPlaying",
              "text-2xl md:text-3xl font-bold mb-4"
            )}
            {renderSliderSection(
              "Trending Movies",
              trendingMovies,
              "trending",
              "text-2xl md:text-3xl font-bold mb-4"
            )}
            {renderSliderSection(
              "Popular Series",
              popularSeries,
              "popularSeries",
              "text-2xl md:text-3xl font-bold mb-4"
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
