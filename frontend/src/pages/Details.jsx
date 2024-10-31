import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchMovieDetails,
  fetchSerieDetails,
  fetchCast,
  fetchMovieAudio,
  fetchTagline,
} from "../services/detailsService";
import { RingLoader } from "react-spinners";
import { adjustImageQuality } from "../utils/sliderSettings";
import { useDispatch } from "react-redux";
import { setMovieTagline } from "../redux/movieSlice";
import RealNavbar from "../components/RealNavbar";

const Details = ({ type }) => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioLanguages, setAudioLanguages] = useState([]);

  const dispatch = useDispatch();

  const formatRating = (value) => (value ? value.toFixed(1) : "N/A");
  const formatDate = (date) => new Date(date).getFullYear();
  const adultVerification = (adult) => (adult ? "18+" : "13+");
  const getLanguages = (languages) =>
    languages.map((lang) => lang.english_name);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        let data;
        if (type === "movie") {
          data = await fetchMovieDetails(id);
        } else {
          data = await fetchSerieDetails(id);
        }
        const castData = await fetchCast(id, type);
        const audioData = await fetchMovieAudio(id, type);
        const tagline = await fetchTagline(id, type);
        setDetails({
          ...data,
          adult: adultVerification(data.adult),
          numberOfSeasons: data.numberOfSeasons || "N/A",
          numberOfEpisodes: data.numberOfEpisodes || "N/A",
          releaseYear:
            type === "movie"
              ? formatDate(data.releaseDate)
              : `${formatDate(data.release_date)} - ${
                  data.last_air_date // cambiar!
                    ? formatDate(data.last_air_date)
                    : "Present"
                }`,
        });

        dispatch(setMovieTagline(tagline));
        setAudioLanguages(getLanguages(audioData));
        setCast(castData.slice(0, 6));
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type, dispatch]);
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen bg-[#0A0A1A]">
          <RingLoader color="#FF0000" size={200} />
        </div>
      ) : (
        <>
          <RealNavbar />
          <div className="font-montserrat">
            <div
              className="relative w-full h-screen bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                  url(${adjustImageQuality(
                    details?.background || details?.backdrop,
                    "original"
                  )})`,
                backgroundSize: "cover",
                backgroundPosition: "top center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-center items-start p-8 text-white">
                <h1 className="text-5xl font-bold mb-4">
                  {details?.title || "Title not available"}
                </h1>

                <div className="flex items-center space-x-4 mb-6">
                  {/* Display Release Year for movies or Airing Years for series */}
                  <span>{details?.releaseYear}</span>
                  {type === "series" && (
                    <span>
                      {details?.numberOfSeasons} Seasons,{" "}
                      {details?.numberOfEpisodes} Episodes
                    </span>
                  )}
                  <span className="text-yellow-300">
                    {formatRating(details?.rating)}
                  </span>
                  <span>4K UHD</span>
                </div>

                {/* Genres for both movies and series */}
                <div className="flex text-sm flex-wrap space-x-2 mb-8">
                  {details?.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-gray-800 rounded"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <button
                  className="bg-white text-black px-32 py-4 font-semibold text-lg rounded hover:bg-gray-200 mb-6"
                  onClick={() => window.open(details?.trailer, "_blank")}
                >
                  Watch Trailer Now
                </button>

                <p className="text-lg max-w-3xl mb-6">
                  {details?.description || "Description not available"}
                </p>

                <div className="flex flex-col space-y-2 font-montserrat font-light">
                  <div className="font-bold text-lg -mb-1">
                    Classification:{" "}
                  </div>
                  <span>{adultVerification(details?.adult)}</span>

                  <div className="font-bold text-lg mb-1 mt-2">
                    Audio Language:
                  </div>
                  {audioLanguages.length > 0 ? (
                    <span>{audioLanguages.join(", ")}</span>
                  ) : (
                    <span>No audio information available</span>
                  )}

                  <div className="mt-6 font-light">
                    <div className="font-bold mb-1 mt-2 text-lg">Starring:</div>
                    <div className="flex flex-wrap w-full max-w-[50%] overflow-x-auto scrollbar-hide">
                      {cast.length > 0 ? (
                        cast.map((actor, index) => (
                          <span
                            key={actor.id}
                            className="whitespace-nowrap mr-1"
                          >
                            {actor.name}
                            {index < cast.length - 1 && ", "}
                          </span>
                        ))
                      ) : (
                        <span className="text-md">No info available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
        </>
      )}
    </>
  );
};

export default Details;
