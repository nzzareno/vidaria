import { motion } from "framer-motion";

const WatchFilm = ({ movie }) => {
  const genreName = movie.genres.length > 0 ? movie.genres[0].name : "No genre";

  const animationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      className="relative cursor-default rounded-lg overflow-hidden transition-all duration-500 w-64 mx-2 my-12 transform"
      initial="hidden"
      animate="visible"
      variants={animationVariants}
      transition={{ duration: 0.5 }}
    >
      {/* Imagen con transición más lenta al pasar a blanco y negro */}
      <motion.img
        className="h-96 w-full object-cover grayscale-0 hover:grayscale filter transition-all duration-[1200ms] ease-in-out brightness-125 ontrast-125"
        src={movie.cover}
        alt={movie.title}
      />

      {/* Ajuste del div del gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50 hover:opacity-75 transition-opacity duration-[2000ms] ease-in-out pointer-events-none" />

      {/* Contenedor de información de la película */}
      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 p-2 text-white text-center transition-colors duration-[2000ms] ease-in-out hover:bg-opacity-80">
        <h2 className="text-md sm:text-lg font-light font-afacadFlux transition-all duration-[2000ms] ease-in-out">
          {genreName}
        </h2>
      </div>
    </motion.div>
  );
};

export default WatchFilm;
