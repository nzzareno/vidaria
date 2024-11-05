import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import WatchFilm from "./WatchFilm";

const WatchFilmList = ({ movies }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const animationVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-[#0A0A1A] text-white">
      <h1 className="font-afacadFlux font-light text-center pt-32 sm:pt-20 text-3xl md:text-4xl lg:text-5xl xl:text-6xl ">
        Find amazing & memorial films.
      </h1>

      <div
        ref={ref}
        className="flex flex-wrap justify-center py-12 gap-2 sm:gap-6 items-center"
      >
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={animationVariants}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center"
        >
          {movies?.map((movie) => (
            <WatchFilm key={movie.id} movie={movie} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WatchFilmList;
