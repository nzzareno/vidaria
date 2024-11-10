import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RingLoader } from "react-spinners";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import RealNavbar from "../components/RealNavbar";
import Header from "../components/Header";
import {
  setAnimationSeries,
  setCrimeSeries,
  setComedySeries,
  setDramaSeries,
  setActionAndAventureSeries,
  setDocumentalSeries,
  setWesternSeries,
  setMysterySeries,
  setFamilySeries,
  setLoadingSerie,
  setFeaturedSeries,
  setTopSeries,
} from "../redux/serieSlice";
import {
  getSeriesByGenre,
  getFeaturedSeries,
  getTopSeries,
  getHeaderSeries,
} from "../services/serieService";
import Slider from "react-slick";
import { createSliderSettings } from "../utils/sliderSettings";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";

const Series = () => {
  const dispatch = useDispatch();
  const [topRatedSeries, setTopRatedSeries] = useState([]);
  const [headerSerie, setHeaderSerie] = useState(null); // Serie destacada para el Header
  const {
    animationSeries,
    crimeSeries,
    comedySeries,
    dramaSeries,
    actionAndAventureSeries,
    documentalSeries,
    westernSeries,
    mysterySeries,
    familySeries,
    featuredSeries,
    loadingSerie,
    topSeries,
  } = useSelector((state) => state.series);

  const [currentSlide, setCurrentSlide] = useState({
    crimeSeries: 0,
    comedySeries: 0,
    dramaSeries: 0,
    actionAndAventureSeries: 0,
    documentalSeries: 0,
    westernSeries: 0,
    mysterySeries: 0,
    animationSeries: 0,
    familySeries: 0,
    topSeries: 0,
  });
  const [isNextDisabled, setIsNextDisabled] = useState({
    crimeSeries: false,
    comedySeries: false,
    dramaSeries: false,
    actionAndAventureSeries: false,
    documentalSeries: false,
    westernSeries: false,
    mysterySeries: false,
    animationSeries: false,
    familySeries: false,
    topSeries: false,
  });
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoadingSerie(true));

      try {
        const titles = [
          "breaking bad",
          "game of thrones",
          "stranger things",
          "the mandalorian",
          "the sopranos",
          "the witcher",
          "money heist",
          "dark",
          "chernobyl",
          "the boys",
        ];

        const headerSeriesData = await getHeaderSeries(); // Llamada a `getHeaderSeries`
        setHeaderSerie(headerSeriesData[0]);
        setTopRatedSeries(headerSeriesData.slice(1));

        const [
          animation,
          family,
          crime,
          comedy,
          drama,
          actionAndAventure,
          documental,
          western,
          mystery,
          featured,
          topSeries,
        ] = await Promise.all([
          getSeriesByGenre("Animation"),
          getSeriesByGenre("Family"),
          getSeriesByGenre("Crime"),
          getSeriesByGenre("Comedy"),
          getSeriesByGenre("Drama"),
          getSeriesByGenre("Action & Adventure"),
          getSeriesByGenre("Documentary"),
          getSeriesByGenre("Western"),
          getSeriesByGenre("Mystery"),
          getFeaturedSeries(),
          getTopSeries(titles),
        ]);

        dispatch(setCrimeSeries(crime?.content || []));
        dispatch(setComedySeries(comedy?.content || []));
        dispatch(setDramaSeries(drama?.content || []));
        dispatch(setActionAndAventureSeries(actionAndAventure?.content || []));
        dispatch(setDocumentalSeries(documental?.content || []));
        dispatch(setWesternSeries(western?.content || []));
        dispatch(setMysterySeries(mystery?.content || []));
        dispatch(setAnimationSeries(animation?.content || []));
        dispatch(setFamilySeries(family?.content || []));
        dispatch(setFeaturedSeries(featured || []));
        dispatch(setTopSeries(topSeries || []));
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        dispatch(setLoadingSerie(false));
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
      setCurrentSlide({
        animationSeries: 0,
        familySeries: 0,
        crimeSeries: 0,
        comedySeries: 0,
        dramaSeries: 0,
        actionAndAventureSeries: 0,
        documentalSeries: 0,
        westernSeries: 0,
        mysterySeries: 0,
        topSeries: 0,
      });
      setIsNextDisabled({
        animationSeries: false,
        familySeries: false,
        crimeSeries: false,
        comedySeries: false,
        dramaSeries: false,
        actionAndAventureSeries: false,
        documentalSeries: false,
        westernSeries: false,
        mysterySeries: false,
        topSeries: false,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSlidesToShow = (width) => {
    if (width >= 1440) return 8;
    if (width >= 1200) return 5;
    if (width >= 1100) return 4;
    if (width >= 768) return 2;
    return 1;
  };

  const handleBeforeChange = useCallback(
    (category, current, next) => {
      const slidesToShow = getSlidesToShow(windowSize);
      setCurrentSlide((prev) => ({ ...prev, [category]: next }));

      const categoryItems = {
        animationSeries,
        familySeries,
        crimeSeries,
        comedySeries,
        dramaSeries,
        actionAndAventureSeries,
        documentalSeries,
        westernSeries,
        mysterySeries,
        featuredSeries,
        topSeries,
      }[category];

      const totalItems = categoryItems.length;
      const isAtEnd = next + slidesToShow >= totalItems;

      setIsNextDisabled((prev) => ({ ...prev, [category]: isAtEnd }));
    },
    [
      animationSeries,
      familySeries,
      crimeSeries,
      comedySeries,
      dramaSeries,
      actionAndAventureSeries,
      documentalSeries,
      westernSeries,
      mysterySeries,
      windowSize,
      featuredSeries,
      topSeries,
    ]
  );

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
      {categoryItems.length > 0 ? (
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
          >
            {categoryItems.map((item, index) => (
              <Link to={`/series/${item.id}`} key={item.id}>
                <motion.div
                  className="px-2 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div className="relative bg-[#0A0A1A] cursor-pointer transition-colors rounded-lg">
                    <motion.img
                      src={item.poster || item.cover}
                      alt={item.title || "No Title"}
                      className="w-full h-auto max-h-[200px] md:max-h-[300px] object-cover rounded-lg"
                      whileHover={{ opacity: 0.7 }}
                    />
                    {categoryKey === "topSeries" && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center text-xl">
                        {index + 1}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </Slider>
        </div>
      ) : (
        <p className="text-white text-center">
          No series available in this category
        </p>
      )}
    </motion.section>
  );

  return (
    <>
      {loadingSerie ? (
        <div className="flex justify-center items-center min-h-screen bg-[#0A0A1A]">
          <RingLoader color="#FF0000" size={200} />
        </div>
      ) : (
        <div className="min-h-screen overflow-x-hidden transition-colors text-white bg-[#0A0A1A]">
          <RealNavbar />
          {headerSerie ? (
            <Header
              headerSeries={[headerSerie, ...topRatedSeries]}
              isSeriesPage={true}
              isCombinedPage={false}
            />
          ) : (
            <p className="text-white text-center mt-6">
              No featured series available
            </p>
          )}
          {renderSliderSection(
            "Top 10 Series",
            topSeries,
            "topSeries",
            "text-2xl md:text-3xl font-bold mb-4 text-white"
          )}
          <div className="space-y-6 px-4 md:px-8 mt-4">
            {renderSliderSection(
              "Animation Series",
              animationSeries,
              "animationSeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Family Series",
              familySeries,
              "familySeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Crime Series",
              crimeSeries,
              "crimeSeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Comedy Series",
              comedySeries,
              "comedySeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Drama Series",
              dramaSeries,
              "dramaSeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Action & Adventure Series",
              actionAndAventureSeries,
              "actionAndAventureSeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Documental Series",
              documentalSeries,
              "documentalSeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Western Series",
              westernSeries,
              "westernSeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
            {renderSliderSection(
              "Mystery Series",
              mysterySeries,
              "mysterySeries",
              "text-2xl md:text-3xl font-bold mb-4 text-white"
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Series;
