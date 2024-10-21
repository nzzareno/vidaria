import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export const WatchedSerie = ({ serie }) => {
  const [genreName, setGenreName] = useState("");

  const animationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const genreName =
      serie.genre_id.length > 0 ? serie.genre_id[0].name : "NO GENRE";
    setGenreName(genreName);
  }, [serie]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={animationVariants}
      transition={{ duration: 0.5 }}
      className="relative cursor-default rounded-lg overflow-hidden transition-all duration-500 w-64 mx-2 my-12 transform"
    >
      {/* Imagen con transición suave para el grayscale */}
      <motion.img
        className="h-96 w-full object-cover grayscale-0 hover:grayscale filter transition-all duration-[1200ms] ease-in-out brightness-125 contrast-125"
        src={serie.poster}
        alt={serie.title}
      />

      {/* Gradiente con transición suave */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50 hover:opacity-75 transition-opacity duration-[2000ms] ease-in-out pointer-events-none" />

      {/* Contenedor de información */}
      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 p-2 text-white text-center transition-colors duration-[2000ms] ease-in-out hover:bg-opacity-80">
        <h2 className="text-md sm:text-lg font-light font-afacadFlux transition-all duration-[2000ms] ease-in-out">
          {genreName}
        </h2>
      </div>
    </motion.div>
  );
};
