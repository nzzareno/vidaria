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
            numberOfSeasons: data.numberOfSeasons || data.number_of_seasons,
            numberOfEpisodes:
              data.numberOfEpisodes || data.number_of_episodes || "Unknown",
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

  const openModal = (review) => {
    setModalContent(formatReviewContent(review.content));
    setSelectedReview({
      authorName: review.author,
      avatar: review.avatar || "default-avatar.jpg",
    });
    setModalOpen(true);
  };

  const handleSimilarClick = (item) => {
    // Asegurarse de que el tipo es correcto. Si media_type no está, usar el contexto de la página.
    const itemType = item.media_type || (isSeries ? "series" : "movies");

    // Si el item es una serie y estamos en la vista de series, navega como serie.
    if (itemType === "tv" || isSeries) {
      navigate(`/series/${item.id}`, { state: { type: "series" } });
    } else {
      // Si es una película, navega a la vista de películas.
      navigate(`/movies/${item.id}`, { state: { type: "movies" } });
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
              <DetailsHeader
                details={details}
                isSeries={isSeries}
                formatRating={formatRating}
                handleAddToWatchlist={handleAddToWatchlist}
                handleRemoveFromWatchlist={handleRemoveFromWatchlist}
                streamingLinks={streamingLinks}
                renderStreamingLinks={renderStreamingLinks}
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
                  formatReviewContent={formatReviewContent}
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
