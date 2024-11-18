import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { adjustImageQuality } from "../utils/sliderSettings";
import { Link } from "react-router-dom";

const Header = ({
  headerMovies = [],
  headerSeries = [],
  isSeriesPage = false,
  isMoviesPage = false,
  isCombinedPage = false,
  activeHeader,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Usaremos un solo índice
  const [allContentLoaded, setAllContentLoaded] = useState(false);

  // Obtener contenido actual según el tipo de página
  const currentContent = isSeriesPage
    ? headerSeries[currentIndex]
    : isMoviesPage
    ? headerMovies[currentIndex]
    : isCombinedPage
    ? currentIndex % 2 === 0
      ? headerMovies[Math.floor(currentIndex / 2) % headerMovies.length]
      : headerSeries[Math.floor(currentIndex / 2) % headerSeries.length]
    : null;

  const backgroundImage =
    currentContent?.background || currentContent?.backdrop;

  const handleImageLoad = () => {
    setAllContentLoaded(true);
  };

  useEffect(() => {
    // Validar que las listas no estén vacías
    if (
      (isSeriesPage && !headerSeries.length) ||
      (isMoviesPage && !headerMovies.length) ||
      (isCombinedPage && (!headerMovies.length || !headerSeries.length))
    ) {
      return;
    }

    // Configurar intervalo para cambiar contenido
    const interval = setInterval(() => {
      setAllContentLoaded(false);

      setTimeout(() => {
        setAllContentLoaded(true); // Volver a cargar después de la transición
      }, 1500);

      // Incrementar índice según el tipo de página
      setCurrentIndex((prevIndex) => {
        if (isSeriesPage) {
          return (prevIndex + 1) % headerSeries.length;
        }
        if (isMoviesPage) {
          return (prevIndex + 1) % headerMovies.length;
        }
        if (isCombinedPage) {
          const totalItems = headerMovies.length + headerSeries.length;
          return (prevIndex + 1) % totalItems;
        }
        return prevIndex;
      });
    }, 5000);

    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, [
    headerMovies.length,
    headerSeries.length,
    isSeriesPage,
    isMoviesPage,
    isCombinedPage,
  ]);

  if (!currentContent) {
    return <div className="h-full w-full bg-[#0A0A1A]"></div>; // Fallback para contenido vacío
  }

  return (
    <AnimatePresence mode="wait">
      <motion.header
        key={currentContent.id} // Clave única para cada contenido
        className="relative h-[50vh] md:h-[80vh] w-full mt-16 overflow-hidden bg-[#0A0A1A]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} // Sincronizar salida completa
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {!activeHeader && (
          <div className="absolute inset-0 bg-[#0A0A1A] animate-pulse"></div>
        )}

        {/* Imagen de fondo */}
        <div style={{ width: "100%", height: "100%" }}>
          <motion.img
            src={adjustImageQuality(
              backgroundImage || "/fallback-image.jpg",
              "original"
            )}
            alt={currentContent?.title || "No Title Available"}
            className="absolute inset-0 w-full h-full object-cover object-top"
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </div>

        {/* Gradientes */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#0A0A1A] via-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A1A] to-transparent"></div>

        {/* Contenido del header */}
        {allContentLoaded && (
          <motion.div
            className="absolute bottom-8 left-0 z-20 max-w-lg md:max-w-xl lg:max-w-3xl p-2 text-left"
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <h1 className="text-3xl text-white sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              {currentContent.title || "Title not available"}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white md:text-lg lg:text-xl leading-relaxed line-clamp-3">
              {currentContent.description || "No description available"}
            </p>

            <div className="mt-6 space-x-4">
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-500 transition-all">
                Play
              </button>
              {currentContent && (
                <Link
                  to={`/${
                    isSeriesPage ||
                    (isCombinedPage &&
                      currentContent ===
                        headerSeries[currentIndex % headerSeries.length])
                      ? "series"
                      : "movies"
                  }/${currentContent.id}`}
                >
                  <button className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-700 transition-all">
                    More Info
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.header>
    </AnimatePresence>
  );
};

export default Header;
