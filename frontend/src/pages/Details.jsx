import { useEffect, useState, useContext } from "react";
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
import { motion } from "framer-motion";
import Modal from "../utils/Modal";
import { fetchUserData } from "../services/authService";
import ModalContext from "../context/ModalContext";
import SimilarContentSlider from "../components/SimilarContentSlider";
import Reviews from "../components/Reviews";
import DetailsHeader from "../components/DetailsHeader";
import { fetchPosterPath } from "../services/serieService";

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
  const [streamingLinks, setStreamingLinks] = useState([]);

  const { isInWatchlist, setIsInWatchlist } = useContext(ModalContext);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

        if (data) {
          const [
            streamingData,
            castData,
            crewData,
            audioData,
            taglineData,
            reviewsData,
            similarData,
          ] = await Promise.all([
            fetchStreamingLinks(id, externalType),
            fetchCast(id, externalType),
            fetchCrew(id, externalType),
            fetchMovieAudio(id, externalType),
            fetchTagline(id, externalType),
            fetchReviews(id, externalType),
            fetchSimilar(id, externalType),
          ]);

          setStreamingLinks(streamingData || []);

          const filteredSimilarData = (similarData || [])
            .filter(
              (item) => item.backdrop_path || item.backdrop || item.background
            )
            .map((item) => ({
              ...item,
              backdrop_path: item.backdrop_path
                ? item.backdrop_path
                : item.background || item.backdrop,
            }));

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
              data.release_date || data.releaseDate || data.first_air_date
                ? new Date(
                    data.release_date || data.first_air_date || data.releaseDate
                  ).getFullYear()
                : "Unknown",
            numberOfSeasons: data.numberOfSeasons || data.number_of_seasons,
            numberOfEpisodes:
              data.numberOfEpisodes || data.number_of_episodes || "Unknown",
            poster_path: await fetchPosterPath(id),
          });

          dispatch(setMovieTagline(taglineData));
          setAudioLanguages(audioData.map((lang) => lang.english_name));
          setTagline(taglineData);
          setCast(castData.slice(0, 15));
          setReviews(reviewsData.slice(0, 3));
          setSimilarContent(filteredSimilarData);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isSeries, externalType, dispatch, setIsInWatchlist, internalType]);

  const handleAddToWatchlist = async () => {
    try {
      const userData = await fetchUserData();
      const userId = userData?.id;

      if (!userId) return;

      if (!isInWatchlist) {
        const response = await addToWatchlist(
          userId,
          isSeries ? null : id,
          isSeries ? id : null
        );
        if (response) setIsInWatchlist(true);
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

      if (response) setIsInWatchlist(false);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
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
    return content.replace(/\./g, ".<br>");
  };

  const openModal = (review) => {
    setModalContent(formatReviewContent(review.content));
    setSelectedReview({
      authorName: review.author,
      avatar: review.avatar || "default-avatar.jpg",
    });
    setModalOpen(true);
  };

  const handleSimilarClick = (item) => {
    const itemType = item.media_type || (isSeries ? "series" : "movies");
    if (itemType === "tv" || isSeries) {
      navigate(`/series/${item.id}`, { state: { type: "series" } });
    } else {
      navigate(`/movies/${item.id}`, { state: { type: "movies" } });
    }
  };
   
  const backgroundUrl =
    details?.background ||
    details?.backdrop ||
    "https://image.tmdb.org/t/p/original" + details?.backdrop_path;
  const backgroundImageStyle = backgroundUrl
    ? `linear-gradient(rgba(10, 10, 26, .95), rgba(10, 10, 26, 1)), url(${adjustImageQuality(
        backgroundUrl,
        "w1280"
      )})`
    : "none";

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
              backgroundImage: backgroundImageStyle,
              backgroundSize: "cover",
              backgroundPosition: "top",
            }}
          >
            <div className="relative px-4 lg:px-8 py-36 mx-auto z-20 max-w-full">
              <DetailsHeader
                details={details}
                isSeries={isSeries}
                formatRating={formatRating}
                handleAddToWatchlist={handleAddToWatchlist}
                handleRemoveFromWatchlist={handleRemoveFromWatchlist}
                streamingLinks={streamingLinks}
                renderStreamingLinks={(links) => (
                  <div className="flex gap-4">
                    {links.map((link, index) => {
                      const providerUrl =
                        link.provider.toLowerCase() === "amazon prime video"
                          ? "https://www.primevideo.com"
                          : `https://www.${link.provider.toLowerCase()}.com`;
                      
                      return (
                        <a
                          key={index}
                          href={link.url || providerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full overflow-hidden w-12 h-12"
                        >
                          <img
                            src={link.logo}
                            alt={link.provider}
                            className="object-cover w-full h-full"
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
                tagline={tagline}
                director={director}
                audioLanguages={audioLanguages}
                adultVerification={adultVerification}
                cast={cast}
                isInWatchlist={isInWatchlist}
                setIsInWatchlist={setIsInWatchlist}
              />

              {reviews.length > 0 && (
                <Reviews
                  reviews={reviews}
                  openModal={openModal}
                  formatReviewContent={(content) => {
                    content = content.replace(
                      /\*\*\*(.*?)\*\*\*/g,
                      "<i>$1</i>"
                    );
                    content = content.replace(/\*(.*?)\*/g, "<b>$1</b>");
                    content = content.replace(
                      /__(.*?)__/g,
                      "<strong>$1</strong>"
                    );
                    content = content.replace(
                      /\[(.*?)\]\((.*?)\)/g,
                      '<a href="$2">$1</a>'
                    );
                    content = content.replace(
                      /^>(.*)/gm,
                      "<blockquote>$1</blockquote>"
                    );
                    content = content.replace(/```(.*)```/g, "<code>$1</code>");
                    content = content.replace(/---/g, "<hr>");
                    content = content.replace(/_(.*?)_/g, "<b>$1</b>");
                    return content.replace(/\./g, ".<br>");
                  }}
                />
              )}

              {similarContent.length > 0 && (
                <SimilarContentSlider
                  similarContent={similarContent}
                  handleSimilarClick={handleSimilarClick}
                  isSeries={isSeries}
                />
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
