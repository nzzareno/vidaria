import { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchMovieDetails,
  fetchSerieDetails,
  fetchCast,
  fetchCrew,
  fetchMovieAudio,
  fetchTagline,
  fetchReviews,
  fetchSimilar,
  fetchMovieIfNotInDB,
  fetchStreamingLinks,
  addToWatchlist,
  checkIfInWatchlist,
  removeFromWatchlist,
} from "../services/detailsService";
import { RingLoader } from "react-spinners";
import { adjustImageQuality } from "../utils/sliderSettings";
import { useDispatch } from "react-redux";
import { setMovieTagline } from "../redux/movieSlice";
import RealNavbar from "../components/RealNavbar";
import Slider from "react-slick";
import { NextArrow, PrevArrow } from "../utils/sliderUtils";
import { motion } from "framer-motion";
import Modal from "../utils/Modal";
import { fetchUserData } from "../services/authService";
import { FaPlus, FaCheck } from "react-icons/fa";
import ModalContext from "../context/ModalContext";

const adultVerification = (adult) => (adult ? "18+" : "13+");
const formatRating = (rating) => (rating ? rating.toFixed(1) : "N/A");

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isSeries = location.pathname.includes("/series");
  const internalType = isSeries ? "series" : "movies";
  const externalType = isSeries ? "tv" : "movie";

  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioLanguages, setAudioLanguages] = useState([]);
  const [tagline, setTagline] = useState("");
  const [reviews, setReviews] = useState([]);
  const [similarContent, setSimilarContent] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [selectedReview, setSelectedReview] = useState({});
  const [expandedReviews, setExpandedReviews] = useState({});
  const [showMoreOptions, setShowMoreOptions] = useState({});
  const [streamingLinks, setStreamingLinks] = useState([]);

  const { isInWatchlist, setIsInWatchlist } = useContext(ModalContext);
  const dispatch = useDispatch();
  const reviewRefs = useRef([]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        let data = isSeries
          ? await fetchSerieDetails(id)
          : await fetchMovieDetails(id);

        if (!data) {
          data = await fetchMovieIfNotInDB(id, externalType);
        }

        const userData = await fetchUserData();
        if (userData?.id) {
          const existsInWatchlist = await checkIfInWatchlist(
            userData.id,
            isSeries ? null : id,
            isSeries ? id : null
          );
          setIsInWatchlist(existsInWatchlist);
        }

        if (isSeries && !data.last_air_date) {
          const externalData = await fetchMovieIfNotInDB(id, externalType);
          data.last_air_date =
            externalData?.last_air_date || data.last_air_date;
        }

        if (data) {
          const streamingData = await fetchStreamingLinks(id, externalType);
          setStreamingLinks(streamingData || []);

          const castData = await fetchCast(id, externalType);
          const crewData = await fetchCrew(id, externalType);
          const audioData = await fetchMovieAudio(id, externalType);
          const taglineData = await fetchTagline(id, externalType);
          const reviewsData = (await fetchReviews(id, externalType)).slice(
            0,
            3
          );
          const similarData = (await fetchSimilar(id, externalType)).filter(
            (item) => item.poster_path
          );

          const executiveProducer = crewData
            .filter((member) => member.job === "Executive Producer")
            .reduce(
              (mostPopular, current) =>
                current.popularity > (mostPopular?.popularity || 0)
                  ? current
                  : mostPopular,
              null
            );

          const directorData = crewData.find(
            (member) => member.job === "Director"
          );

          setDirector(
            directorData
              ? directorData.name
              : executiveProducer?.name || "Unknown"
          );

          setDetails({
            ...data,
            adult: data.adult ? "18+" : "13+",
            releaseYear:
              data.release_date ||
              data.releaseDate ||
              data.first_air_date ||
              data.last_air_date
                ? new Date(
                    data.release_date ||
                      data.first_air_date ||
                      data.last_air_date ||
                      data.releaseDate
                  ).getFullYear()
                : "Unknown",
            numberOfSeasons: data.numberOfSeasons || (isSeries ? "N/A" : null),
            numberOfEpisodes:
              data.numberOfEpisodes || (isSeries ? "N/A" : null),
          });

          dispatch(setMovieTagline(taglineData));
          setAudioLanguages(audioData.map((lang) => lang.english_name));
          setTagline(taglineData);
          setCast(castData.slice(0, 15));
          setReviews(reviewsData);
          setSimilarContent(similarData);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isSeries, externalType, internalType, dispatch, setIsInWatchlist]);

  const handleAddToWatchlist = async () => {
    try {
      const userData = await fetchUserData();
      const userId = userData?.id;

      if (!userId) {
        return;
      }

      if (!isInWatchlist) {
        const response = await addToWatchlist(
          userId,
          isSeries ? null : id,
          isSeries ? id : null
        );
        if (response) {
          setIsInWatchlist(true); // Cambia el estado a "En Watchlist"
        }
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    try {
      const userData = await fetchUserData();
      const userId = userData?.id;

      if (!userId) return;

      const response = await removeFromWatchlist(
        userId,
        isSeries ? null : id,
        isSeries ? id : null
      );

      if (response) {
        setIsInWatchlist(false); // Cambia el estado para reflejar que ya no está en la Watchlist
      } else {
        console.error("Failed to remove from watchlist");
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  useEffect(() => {
    reviewRefs.current.forEach((ref, index) => {
      if (ref && ref.scrollHeight > ref.clientHeight) {
        setShowMoreOptions((prev) => ({ ...prev, [index]: true }));
      }
    });
  }, [reviews]);

  const toggleExpandReview = (index) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const openModal = (review) => {
    setModalContent(formatReviewContent(review.content));
    setSelectedReview({
      authorName: review.author,
      avatar: review.avatar || "default-avatar.jpg",
    });
    setModalOpen(true);
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: false,
    arrows: true,
    draggable: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  const handleSimilarClick = (item) => {
    const itemType = item.media_type || (item.title ? "movies" : "series");
    navigate(`/${itemType}/${item.id}`, { state: { type: itemType } });
  };

  const formatReviewContent = (content) => {
    content = content.replace(/\*\*\*(.*?)\*\*\*/g, "<i>$1</i>");
    content = content.replace(/\*(.*?)\*/g, "<b>$1</b>");
    content = content.replace(/__(.*?)__/g, "<strong>$1</strong>");
    content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    content = content.replace(/^>(.*)/gm, "<blockquote>$1</blockquote>");
    content = content.replace(/```(.*)```/g, "<code>$1</code>");
    content = content.replace(/---/g, "<hr>");
    content = content.replace(/_(.*?)_/g, "<b>$1</b>");
    content = content.replace(/\. [a-z]/g, (match) =>
      match.toUpperCase().replace(" ", "")
    );
    content = content.replace(/\./g, ".<br>");
    return content;
  };

  const renderStreamingLinks = (links) => {
    const filteredLinks = links.filter(
      (link) => !link.provider.toLowerCase().includes("maxamazonchannel")
    );

    return (
      <div className="flex flex-wrap gap-4 mt-4">
        {filteredLinks.map((link) => (
          <div
            key={link.provider}
            className="p-2 rounded-full bg-gray-900 cursor-pointer"
            onClick={() =>
              window.open(
                `https://www.${link.provider
                  .toLowerCase()
                  .replace(/\s+/g, "")}.com`,
                "_blank"
              )
            }
          >
            <img
              src={link.logo}
              className="w-12 h-12 rounded-full object-cover transition-transform duration-200 hover:scale-110"
              alt={link.provider}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen bg-[#0A0A1A]">
          <RingLoader color="#FF0000" size={200} />
        </div>
      ) : (
        <>
          <RealNavbar />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-montserrat min-h-screen text-white relative bg-[#0A0A1A]"
            style={{
              backgroundImage: `linear-gradient(rgba(10, 10, 26, .95), rgba(10, 10, 26, 1)), url(${adjustImageQuality(
                details?.background ||
                  details?.backdrop ||
                  "https://image.tmdb.org/t/p/w500" + details?.backdrop_path,
                "original"
              )})`,
              backgroundSize: "cover",
              backgroundPosition: "top",
            }}
          >
            <div className="relative px-4 lg:px-8 py-36 mx-auto z-20 max-w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
                <div className="lg:col-span-2 space-y-6 w-full">
                  <div className="flex flex-col lg:flex-row items-start space-x-0 lg:space-x-8 space-y-6 lg:space-y-0">
                    <motion.img
                      src={adjustImageQuality(
                        details?.cover ||
                          details?.poster ||
                          "https://image.tmdb.org/t/p/w500" +
                            details?.poster_path ||
                          "https://image.tmdb.org/t/p/w500" +
                            details?.backdrop_path,
                        "original"
                      )}
                      alt={details?.title}
                      className="w-56 h-80 lg:w-[20rem] lg:h-full rounded-lg object-cover shadow-lg"
                      transition={{ duration: 0.3 }}
                    />
                    <div className="space-y-3 max-w-4xl">
                      <motion.h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                        {details?.title ||
                          details?.name ||
                          "Title not available"}
                      </motion.h1>
                      <div className="flex items-center space-x-4 text-md lg:text-lg">
                        <span>
                          {isSeries
                            ? details?.releaseYear ===
                              details?.last_air_date.slice(0, 4)
                              ? details?.releaseYear
                              : `${
                                  details?.releaseYear
                                } - ${details?.last_air_date.slice(0, 4)}`
                            : details?.releaseYear}
                        </span>
                        {isSeries && (
                          <span>
                            {details?.numberOfSeasons} Seasons,{" "}
                            {details?.numberOfEpisodes} Episodes
                          </span>
                        )}
                        <span className="text-yellow-300">
                          {formatRating(
                            details?.rating || details?.vote_average
                          )}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm lg:text-base">
                        {(details?.genres || details?.genre_id)?.map(
                          (genre) => (
                            <span
                              key={genre.id || genre}
                              className="px-3 mb-2 py-1 bg-gray-800 rounded"
                            >
                              {genre.name || genre}
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex space-x-4 mt-4">
                        <motion.button
                          className="bg-white text-black px-10 py-2 text-sm lg:text-base font-medium rounded hover:bg-gray-200"
                          onClick={() =>
                            window.open(details?.trailer, "_blank")
                          }
                        >
                          Watch Trailer
                        </motion.button>
                        <motion.button
                          onClick={
                            isInWatchlist
                              ? handleRemoveFromWatchlist
                              : handleAddToWatchlist
                          }
                          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 hover:border-white transition duration-200"
                          style={{
                            backgroundColor: isInWatchlist
                              ? "#1db954"
                              : "transparent",
                          }}
                          title={
                            isInWatchlist
                              ? "Remove from Watchlist"
                              : "Add to Watchlist"
                          }
                        >
                          {isInWatchlist ? (
                            <FaCheck className="text-white text-lg" />
                          ) : (
                            <FaPlus className="text-white text-lg" />
                          )}
                        </motion.button>
                      </div>

                      {streamingLinks.length > 0 && (
                        <div className="mt-4">
                          {renderStreamingLinks(streamingLinks)}
                        </div>
                      )}

                      <p className="text-md lg:text-base leading-relaxed">
                        {details?.description ||
                          details?.overview ||
                          "Description not available"}
                      </p>
                      {tagline && (
                        <p className="text-lg italic font-semibold text-gray-300 mt-4">
                          &quot;{tagline}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="-mt-4 lg:mt-0">
                  <div className="font-bold text-base lg:text-lg mb-2">
                    Director:
                  </div>
                  <div>{director || "Unknown"}</div>
                  {cast.length > 0 && (
                    <>
                      <div className="font-bold text-base lg:text-lg mt-4 mb-2">
                        Starring:
                      </div>
                      <div className="flex flex-wrap max-w-full overflow-x-auto">
                        {cast.map((actor, index) => (
                          <span key={actor.id} className="whitespace-pre-wrap">
                            {actor.name}
                            {index < cast.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="mt-4">
                    <span className="font-semibold">Classification: </span>
                    {adultVerification(details?.adult)}
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold">Audio Languages: </span>
                    {audioLanguages.join(", ") || "N/A"}
                  </div>
                </div>
              </div>

              {reviews.length > 0 && (
                <div className="w-full py-10 mt-10">
                  <h2 className="text-xl lg:text-2xl font-bold mb-6">
                    Reviews
                  </h2>
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <div
                        key={index}
                        onClick={() => openModal(review)}
                        className="w-full p-6 rounded-lg shadow-lg bg-[#0A0A1A] text-white relative flex flex-col items-start cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 mb-2 w-full">
                          <img
                            src={review.avatar}
                            alt="User"
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="font-bold">
                            {review.author || "Anonymous"}
                          </span>
                        </div>
                        <p
                          ref={(el) => (reviewRefs.current[index] = el)}
                          className={`text-white ${
                            expandedReviews[index] ? "" : "line-clamp-3"
                          }`}
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: formatReviewContent(review.content),
                            }}
                          ></span>
                        </p>
                        {showMoreOptions[index] && (
                          <button
                            onClick={() => toggleExpandReview(index)}
                            className="text-blue-500 hover:text-blue-700 mt-2"
                          >
                            {expandedReviews[index] ? "View Less" : "View More"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {similarContent.length > 0 && (
                <div className="w-full py-10 mt-10">
                  <h2 className="text-xl lg:text-2xl font-bold mb-6">
                    Maybe you like it too
                  </h2>
                  <Slider {...sliderSettings} className="overflow-hidden">
                    {similarContent.map((item) => {
                      const releaseYear = item.release_date
                        ? new Date(item.release_date).getFullYear()
                        : "";
                      const imageUrl = item.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
                        : item.poster_path
                        ? `https://image.tmdb.org/t/p/original${item.poster_path}`
                        : null;
                      if (!imageUrl) return null;
                      return (
                        <motion.div
                          key={item.id}
                          className="w-32 h-64 lg:w-36 flex-shrink-0 p-2 relative"
                          onClick={() => handleSimilarClick(item)}
                        >
                          <motion.img
                            src={imageUrl}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover rounded-lg"
                            style={{ transition: "box-shadow 0.01s linear" }}
                          />
                          <motion.div
                            className="absolute inset-2 bg-black cursor-pointer bg-opacity-60 rounded-lg flex items-center justify-center opacity-100 transition-opacity duration-300"
                            initial={{ opacity: 1 }}
                            whileHover={{ opacity: 0.7 }}
                            transition={{ duration: 0.3 }}
                          >
                            <span className="text-white text-center text-lg font-semibold px-4">
                              {item.title || item.name}{" "}
                              {releaseYear && `(${releaseYear})`}
                            </span>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </Slider>
                </div>
              )}
            </div>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setModalOpen(false)}
              authorName={selectedReview.authorName}
              avatar={selectedReview.avatar}
            >
              <span dangerouslySetInnerHTML={{ __html: modalContent }}></span>
            </Modal>
          </motion.div>
        </>
      )}
    </>
  );
};

export default Details;
