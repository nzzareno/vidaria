import { motion } from "framer-motion";
import { FaPlus, FaCheck } from "react-icons/fa";
import { adjustImageQuality } from "../utils/sliderSettings";

const DetailsHeader = ({
  details = {},
  tagline = "",
  isSeries = false,
  formatRating = () => {},
  handleAddToWatchlist = () => {},
  handleRemoveFromWatchlist = () => {},
  streamingLinks = [],
  renderStreamingLinks = () => {},
  director = "",
  cast = [],
  audioLanguages = [],
  adultVerification = () => {},
  isInWatchlist = false,
}) => {
  return (
    <>
      {details && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
          <div className="lg:col-span-2 space-y-6 w-full">
            <div className="flex flex-col lg:flex-row items-start space-x-0 lg:space-x-8 space-y-6 lg:space-y-0">
              <motion.img
                src={
                  adjustImageQuality(
                    details?.cover || details?.poster_path,
                    "original"
                  ) ||
                  `https://image.tmdb.org/t/p/original${
                    details?.poster_path || details?.backdrop_path
                  }`
                }
                alt={details?.title || "Image not available"}
                className="w-56 h-80 lg:w-[20rem] lg:h-full rounded-lg object-cover shadow-lg"
                transition={{ duration: 1 }}
              />
              <div className="space-y-3 max-w-4xl">
                <motion.h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  {details?.title || details?.name || "Title not available"}
                </motion.h1>
                <div className="flex items-center space-x-4 text-md lg:text-lg">
                  <span>
                    {isSeries
                      ? details?.releaseYear ===
                        details?.last_air_date?.slice(0, 4)
                        ? details?.releaseYear
                        : `${
                            details?.releaseYear || "Unknown"
                          } - ${details?.last_air_date?.slice(0, 4)}`
                      : details?.releaseYear || "Unknown"}
                  </span>
                  {((!isSeries && details?.runtime) || details?.duration) && (
                    <span>{details?.runtime || details?.duration} min</span>
                  )}
                  {isSeries && (
                    <span>
                      {details?.numberOfSeasons === 1
                        ? `${details.numberOfSeasons} Season, `
                        : `${details?.numberOfSeasons || 0} Seasons, `}
                      {details?.numberOfEpisodes ||
                        details?.number_of_episodes ||
                        0}{" "}
                      Episodes
                    </span>
                  )}
                  <span className="text-yellow-300 font-bold">
                    {formatRating(
                      details?.rating || details?.vote_average || 0
                    )}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm lg:text-base">
                  {(details?.genres || details?.genre_id || []).map((genre) => (
                    <span
                      key={genre.id || genre}
                      className="px-3 mb-2 py-1 bg-gray-800 rounded"
                    >
                      {genre.name || genre}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-4 mt-4">
                  <motion.button
                    className="bg-white text-black px-10 py-2 text-sm lg:text-base font-medium rounded hover:bg-gray-200"
                    onClick={() => window.open(details?.trailer, "_blank")}
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
            <div className="font-bold text-base lg:text-lg mb-2">Director:</div>
            <div>{director || "Unknown"}</div>
            {cast.length > 0 && (
              <>
                <div className="font-bold text-base lg:text-lg mt-4 mb-2">
                  Starring:
                </div>
                <div className="flex flex-wrap max-w-full overflow-x-auto">
                  {cast.slice(0, 15).map((actor, index) => (
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
      )}
    </>
  );
};

export default DetailsHeader;
