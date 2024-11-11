import { useState, useRef, useEffect } from "react";

const Reviews = ({ reviews, openModal, formatReviewContent }) => {
  const [showMoreOptions, setShowMoreOptions] = useState({});
  const reviewRefs = useRef([]);

  useEffect(() => {
    reviewRefs.current.forEach((ref, index) => {
      if (ref && ref.scrollHeight > ref.clientHeight) {
        setShowMoreOptions((prev) => ({ ...prev, [index]: true }));
      }
    });
  }, [reviews]);

  return (
    <div className="w-full py-10 mt-10">
      <h2 className="text-xl lg:text-2xl font-bold mb-6">Reviews</h2>
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
              <span className="font-bold">{review.author || "Anonymous"}</span>
            </div>
            <p
              ref={(el) => (reviewRefs.current[index] = el)}
              className="text-white line-clamp-3"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: formatReviewContent(review.content),
                }}
              ></span>
            </p>
            {showMoreOptions[index] && (
              <button
                onClick={() => openModal(review)}
                className="text-blue-500 hover:text-blue-700 mt-2"
              >
                View More
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
