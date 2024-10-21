import { useEffect, useState } from "react";
import { WatchedSerie } from "./watchedSerie";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const WatchSerieList = ({ series }) => {
  const [mySeries, setMySeries] = useState({ content: [] });
  const currentPage = useSelector((state) => state.series.currentPage);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    setMySeries(series);
  }, [series, currentPage]);

  const animationVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-[#0A0A1A] text-white">
      <h1 className="font-afacadFlux font-light text-center  pt-4   text-3xl md:text-4xl lg:text-5xl xl:text-6xl pb-6">
        The best tv shows are waiting for you
      </h1>

      <div
        ref={ref} // Referencia para el Intersection Observer
        className="flex flex-wrap justify-center py-24 gap-2 sm:gap-6 pb-20 items-center"
      >
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={animationVariants}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center"
        >
          {Array.isArray(mySeries) && mySeries.length > 0 ? (
            mySeries.map((serie) => (
              <WatchedSerie key={serie.id} serie={serie} />
            ))
          ) : (
            <p>No series available</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WatchSerieList;
