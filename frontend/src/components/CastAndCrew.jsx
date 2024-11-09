const CastAndCrew = ({ director, cast, audioLanguages, adult }) => {
    return (
      <div className="mt-10">
        <div className="font-bold text-lg mb-2">Director:</div>
        <div>{director || "Unknown"}</div>
        {cast.length > 0 && (
          <>
            <div className="font-bold text-lg mt-4 mb-2">Starring:</div>
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
          {adult ? "18+" : "13+"}
        </div>
        <div className="mt-2">
          <span className="font-semibold">Audio Languages: </span>
          {audioLanguages.join(", ") || "N/A"}
        </div>
      </div>
    );
  };
  
  export default CastAndCrew;
  