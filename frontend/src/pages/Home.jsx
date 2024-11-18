import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setLoading, setError } from "../redux/movieSlice";
import Slider from "react-slick";
import {
  getMoviesByCategory,
  gettingPopularHeaderMovies,
} from "../services/movieService";
import {
  getHeaderSeries,
  getSeriesByType,
  fetchSeriePosterPath,
  fetchMoviePosterPath,
} from "../services/serieService";

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
import Footer from "../components/Footer.jsx";

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [activeHeader, setActiveHeader] = useState(false);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [headerMovies, setHeaderMovies] = useState([]);
  const [headerSeries, setHeaderSeries] = useState([]);
  const [topRatedSeries, setTopRatedSeries] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState({
    popular: 0,
    upcoming: 0,
    trending: 0,
    nowPlaying: 0,
    topRated: 0,
    popularSeries: false,
  });
  const [isNextDisabled, setIsNextDisabled] = useState({
    popular: false,
    upcoming: false,
    trending: false,
    nowPlaying: false,
    topRated: false,
    popularSeries: false,
  });
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
      setCurrentSlide({
        popular: 0,
        upcoming: 0,
        trending: 0,
        nowPlaying: 0,
        topRated: 0,
        popularSeries: 0,
      });
      setIsNextDisabled({
        popular: false,
        upcoming: false,
        trending: false,
        nowPlaying: false,
        topRated: false,
        popularSeries: false,
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
        topRatedSeries: topRatedSeries,
        popularSeries: popularSeries, // Incluye Popular Series aquí
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
      topRatedSeries,
      popularSeries, // Asegúrate de incluir Popular Series aquí
      windowSize,
    ]
  );

  const fetchMoviesByCategory = useCallback(
    async (category, setMovies, pages = 3) => {
      try {
        const movies = [];
        for (let page = 2; page <= pages; page++) {
          const response = await getMoviesByCategory(category, {
            page,
            size: 20,
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
      setAllImagesLoaded(false);

      try {
        const [
          popularMoviesData,
          topRatedMoviesData,
          upcomingMoviesData,
          nowPlayingMoviesData,
          trendingMoviesData,
          headerMoviesData,
          headerSeriesData,
          topRatedSeriesData,
          popularSeriesData,
        ] = await Promise.all([
          fetchMoviesByCategory("popular", setPopularMovies),
          fetchMoviesByCategory("top_rated", setTopRatedMovies),
          fetchMoviesByCategory("upcoming", setUpcomingMovies),
          fetchMoviesByCategory("now_playing", setNowPlayingMovies),
          fetchMoviesByCategory("trending", setTrendingMovies),
          gettingPopularHeaderMovies(),
          getHeaderSeries(),
          getSeriesByType("top_rated"),
          getSeriesByType("popular"),
        ]);

        const topRatedSeriesWithPosters = await Promise.all(
          topRatedSeriesData.map(async (series) => {
            const poster = await fetchSeriePosterPath(series.id);
            return { ...series, poster };
          })
        );

        const onTheAirSeriesWithPosters = await Promise.all(
          popularSeriesData.map(async (series) => {
            const poster = await fetchSeriePosterPath(series.id);
            return { ...series, poster };
          })
        );

        const popularMoviesWithPosters = await Promise.all(
          popularMoviesData.map(async (movie) => {
            const poster = await fetchMoviePosterPath(movie.id);
            return { ...movie, poster };
          })
        );

        const topRatedMoviesWithPosters = await Promise.all(
          topRatedMoviesData.map(async (movie) => {
            const poster = await fetchMoviePosterPath(movie.id);
            return { ...movie, poster };
          })
        );

        setPopularMovies(popularMoviesWithPosters || []);
        setTopRatedMovies(topRatedMoviesWithPosters || []);
        setUpcomingMovies(upcomingMoviesData || []);
        setNowPlayingMovies(nowPlayingMoviesData || []);
        setTrendingMovies(trendingMoviesData || []);
        setHeaderMovies(headerMoviesData?.content || []);
        setHeaderSeries(headerSeriesData || []);
        setTopRatedSeries(topRatedSeriesWithPosters || []);
        setPopularSeries(onTheAirSeriesWithPosters || []);
        setActiveHeader(true);
        setAllImagesLoaded(true);
      } catch (error) {
        console.error("Error loading content:", error);
        dispatch(setError(error.message));
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
    categoryItems = [],
    categoryKey,
    titleClass
  ) => (
    <motion.section
      key={categoryKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
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
                  <motion.img
                    src={adjustImageQuality(
                      item.poster_path || item.poster || item.cover,
                      "w300"
                    )}
                    alt={item.title}
                    className="w-[200px] h-[300px] object-cover rounded-lg cursor-pointer"
                    whileHover={{ opacity: 0.7 }}
                  />
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
      {!allImagesLoaded ? (
        <div className="flex justify-center items-center min-h-screen bg-[#0A0A1A]">
          <RingLoader color="#FF0000" size={200} />
        </div>
      ) : (
        <div className="min-h-screen overflow-x-hidden transition-colors text-white bg-[#0A0A1A]">
          <RealNavbar />
          <Header
            headerMovies={headerMovies}
            headerSeries={headerSeries}
            isCombinedPage
            activeHeader={activeHeader}
          />
          <div className="space-y-6 px-4 md:px-8 mt-4 text-white">
            {renderSliderSection("Popular Movies", popularMovies, "popular")}
            {renderSliderSection(
              "Top Rated Movies",
              topRatedMovies,
              "topRated"
            )}
            {renderSliderSection("Upcoming Movies", upcomingMovies, "upcoming")}
            {renderSliderSection(
              "Now Playing Movies",
              nowPlayingMovies,
              "nowPlaying"
            )}
            {renderSliderSection("Trending Movies", trendingMovies, "trending")}
            {renderSliderSection(
              "Top Rated Series",
              topRatedSeries,
              "topRatedSeries"
            )}
            {renderSliderSection(
              "Popular Series",
              popularSeries
                .filter((item) => item.poster) // Filtra solo series con pósteres válidos
                .map((item) => ({ ...item, poster: item.poster })),
              "popularSeries", // Asegúrate de que esta clave coincida con el estado
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Home;
