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
  slidesToScroll: slidesToShow, // Cambia a 1 en mobile
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
        slidesToShow: 5,
        slidesToScroll: 4,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 2, // Reduce el scroll en pantallas más pequeñas
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1, // Ajusta a 1 para un desplazamiento más controlado en móviles
      },
    },
  ],
});

export const adjustImageQuality = (url, quality = "original") => {
  return url ? url.replace(/\/w\d+/, `/${quality}`) : "";
};

export const formatCategoryTitle = (category) => {
  return category
    .replace(/([A-Z])/g, " $1") // Inserta un espacio antes de cada letra mayúscula
    .replace(/^./, (str) => str.toUpperCase()); // Capitaliza la primera letra
};

export const getMoviesByCategory = async (category, options) => {
  const response = await axios.get(`/api/movies/${category}`, {
    params: options,
  });
  return response.data;
};
