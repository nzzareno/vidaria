import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError } from "../redux/movieSlice";
import Slider from "react-slick";
import { getMoviesByCategory } from "../services/movieService";
import { RingLoader } from "react-spinners";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";
import {
  adjustImageQuality,
  createSliderSettings,
} from "../utils/sliderSettings.jsx";
import RealNavbar from "../components/RealNavbar.jsx";
import { searchSeries } from "../services/serieService.js";
import {
  setAnimationSeries,
  setFamilySeries,
  setLoadingSerie,
  setPopularSeries,
  setTopRatedSeries,
} from "../redux/serieSlice.js";
import { Link } from "react-router-dom";

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [headerMovies, setHeaderMovies] = useState([]);
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
  const {
    topRatedSeries,
    popularSeries,
    animationSeries,
    familySeries,
    loadingSerie,
  } = useSelector((state) => state.series);
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
        animationSeries: animationSeries,
        familySeries: familySeries,
        topRatedSeries: topRatedSeries,
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
      animationSeries,
      familySeries,
      topRatedSeries,
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
      dispatch(setLoadingSerie(true));

      try {
        // Fetch movies
        const [popular, topRated, upcoming, nowPlaying, trending] = await Promise.all([
          fetchMoviesByCategory("popular", setPopularMovies, 2),
          fetchMoviesByCategory("top_rated", setTopRatedMovies, 2),
          fetchMoviesByCategory("upcoming", setUpcomingMovies, 2),
          fetchMoviesByCategory("now_playing", setNowPlayingMovies, 2),
          fetchMoviesByCategory("trending", setTrendingMovies, 2),
        ]);

        const allMovies = [...popular, ...topRated, ...upcoming, ...nowPlaying, ...trending];
        const highPopularityMovies = allMovies.filter((movie) => movie.popularity && movie.popularity > 50);
        const shuffledMovies = highPopularityMovies.sort(() => 0.5 - Math.random());
        setHeaderMovies(shuffledMovies.slice(0, 10));

        // Fetch series
        await Promise.all([
          dispatch(setPopularSeries(await searchSeries("popular", 2))),
          dispatch(setTopRatedSeries(await searchSeries("top_rated", 2))),
          dispatch(setAnimationSeries(await searchSeries("animation", 2))),
          dispatch(setFamilySeries(await searchSeries("family", 2))),
        ]);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        dispatch(setLoading(false));
        dispatch(setLoadingSerie(false));
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

  useEffect(() => {
    const fetchSeries = async () => {
      dispatch(setLoadingSerie(true));
      try {
        const fetchSeriesByPages = async (params, totalPages) => {
          const resultArray = [];
          for (let page = 1; page <= totalPages; page++) {
            const response = await searchSeries({ ...params, page, size: 10 });
            if (response?.content?.length) {
              resultArray.push(...response.content);
            }
          }
          return resultArray;
        };
  
        const totalPages = 3;
        const addedSeriesIds = new Set(); // Set to track unique series IDs
  
        // Fetch and filter series for each category
        const popularSeriesArray = (await fetchSeriesByPages({ genres: "drama" }, totalPages)).filter(
          (serie) => {
            const isUnique = !addedSeriesIds.has(serie.id);
            if (isUnique) addedSeriesIds.add(serie.id);
            return isUnique;
          }
        );
  
        const topRatedSeriesArray = (await fetchSeriesByPages({ ratingFrom: 7 }, totalPages)).filter(
          (serie) => {
            const isUnique = !addedSeriesIds.has(serie.id);
            if (isUnique) addedSeriesIds.add(serie.id);
            return isUnique;
          }
        );
  
        const animationSeriesArray = (await fetchSeriesByPages({ genres: "animation" }, totalPages)).filter(
          (serie) => {
            const isUnique = !addedSeriesIds.has(serie.id);
            if (isUnique) addedSeriesIds.add(serie.id);
            return isUnique;
          }
        );
  
        const familySeriesArray = (await fetchSeriesByPages({ genres: "family" }, totalPages)).filter(
          (serie) => {
            const isUnique = !addedSeriesIds.has(serie.id);
            if (isUnique) addedSeriesIds.add(serie.id);
            return isUnique;
          }
        );
  
        // Dispatch filtered series arrays to Redux
        dispatch(setPopularSeries(popularSeriesArray));
        dispatch(setTopRatedSeries(topRatedSeriesArray));
        dispatch(setAnimationSeries(animationSeriesArray));
        dispatch(setFamilySeries(familySeriesArray));
      } catch (error) {
        console.error("Error al obtener series:", error);
      } finally {
        dispatch(setLoadingSerie(false)); // Asegura que loadingSerie se desactive al final
      }
    };
  
    fetchSeries();
  }, [dispatch]);
  

  const renderSliderSection = useCallback(
    (title, categoryItems, categoryKey) => (
      <motion.section
        key={categoryKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-10 mt-10 px-2 md:px-4 lg:px-8"
      >
        {categoryItems.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
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
                <Link to={`/${categoryKey.includes("Series") ? "series" : "movies"}/${item.id}`} key={item.id}>
                  <motion.div className="px-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    <motion.div className="relative bg-[#0A0A1A] cursor-pointer transition-colors rounded-lg">
                      <motion.img
                        src={adjustImageQuality(item.cover || item.poster, "w300")}
                        alt={item.title}
                        whileHover={{ opacity: 0.7 }}
                        className="w-full h-[19rem] object-cover"
                      />
                    </motion.div>
                  </motion.div>
                </Link>
              ))}
            </Slider>
          </div>
        )}
      </motion.section>
    ),
    [currentSlide, isNextDisabled, handleBeforeChange, windowSize]
  );

  return (
    <>
      {loading || loadingSerie ? (
        <div className="flex justify-center items-center min-h-screen bg-[#0A0A1A]">
          <RingLoader color="#FF0000" size={200} />
        </div>
      ) : (
        <div className="min-h-screen overflow-x-hidden transition-colors text-white bg-[#0A0A1A] ">
          <RealNavbar />
          <Header headerMovies={headerMovies} />
          {/* Movies Sections */}
          {renderSliderSection("Popular Movies", popularMovies, "popular")}
          {renderSliderSection("Top Rated Movies", topRatedMovies, "topRated")}
          {renderSliderSection("Upcoming Movies", upcomingMovies, "upcoming")}
          {renderSliderSection("Now Playing Movies", nowPlayingMovies, "nowPlaying")}
          {renderSliderSection("Trending Movies", trendingMovies, "trending")}
          {/* Series Sections */}
          {renderSliderSection("Animation Series", animationSeries, "animationSeries")}
          {renderSliderSection("Family Series", familySeries, "familySeries")}
          {renderSliderSection("Popular Series", popularSeries, "popularSeries")}
          {renderSliderSection("Top Rated Series", topRatedSeries, "topRatedSeries")}
        </div>
      )}
    </>
  );
};

export default Home;
