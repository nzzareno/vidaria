import axios from "axios";

export const createSliderSettings = (
  category,
  currentSlide,
  setIsNextDisabled,
  slidesToShow,
  isNextDisabled,
  PrevArrow,
  NextArrow,
  handleBeforeChange = () => {}
) => ({
  dots: false,
  infinite: false,
  speed: 500,
  autoplay: false,
  arrows: true,
  prevArrow: currentSlide[category] > 0 ? <PrevArrow /> : null,
  nextArrow: <NextArrow isDisabled={isNextDisabled[category]} />,
  draggable: true,
  beforeChange: (current, next) => handleBeforeChange(category, current, next),
  slidesToShow: slidesToShow,
  slidesToScroll: slidesToShow,
  responsive: [
    {
      breakpoint: 1440,
      settings: {
        slidesToShow: 6,
        slidesToScroll: 5,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 800,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 550,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
  ],
});

export const adjustImageQuality = (url, quality = "original") => {
  return url ? url.replace(/\/w\d+/, `/${quality}`) : "";
};

export const formatCategoryTitle = (category) => {
  return category
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

export const getMoviesByCategory = async (category, options) => {
  const response = await axios.get(`/api/movies/${category}`, {
    params: options,
  });
  return response.data;
};
