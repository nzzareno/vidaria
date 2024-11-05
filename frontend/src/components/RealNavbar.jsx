// RealNavbar.js
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { GrLogout } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";

const RealNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Cambiado a 1230px
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Estado para scroll
  const location = useLocation(); // Para obtener la ruta actual

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "auth/logout" });
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Cambiado a 1230px
    };

    const handleScroll = () => {
      // Cambiar estado isScrolled según el desplazamiento
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Definir el estilo de fondo según la ruta, scroll y modo (móvil o pantalla completa)
  const isDetailsPage = location.pathname.startsWith("/movies/") || location.pathname.startsWith("/series/");
  const isHomePage = location.pathname === "/home";
  const isMoviesPage = location.pathname === "/movies";

  // Aplicar un fondo de color en móvil, y en desktop solo si ha hecho scroll o no es la página de detalles
  const navbarStyle =
    isMobile || (isScrolled && isDetailsPage) || (!isDetailsPage && !isHomePage && !isMoviesPage)
      ? "bg-[#0A0A1A]" // Fondo de color en mobile y cuando hay scroll en detalles
      : "bg-transparent"; // Fondo transparente solo para Details en pantalla completa sin scroll

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 ${navbarStyle} text-white transition-colors duration-200`}
    >
      <div className="flex items-center justify-between py-4 px-4">
        <h1 className="text-3xl font-bold text-white">
          <Link to={"/"}>vidaria</Link>
        </h1>

        {/* Opciones de navegación centradas */}
        <div className={`hidden ${isMobile ? 'flex' : 'md:flex'} flex-1 justify-center space-x-6`}>
          <a href="/" className="hover:text-gray-400">
            Home
          </a>
          <a href="/movies" className="hover:text-gray-400">
            Movies
          </a>
          <a href="/series" className="hover:text-gray-400">
            TV Shows
          </a>
        </div>

        {!isMobile && (
          <div className="flex space-x-4">
            <a
              onClick={handleLogout}
              className="cursor-pointer hover:text-gray-400"
            >
              <GrLogout size={24} />
            </a>
          </div>
        )}

        {/* Botón de menú para móviles */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Menú desplegable para móviles */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col space-y-2 px-4 pb-4 bg-[#0a0a1a00]">
          <a href="/" className="hover:text-gray-400">
            Home
          </a>
          <a href="/movies" className="hover:text-gray-400">
            Movies
          </a>
          <a href="/series" className="hover:text-gray-400">
            TV Shows
          </a>

          {/* Botones separados en la parte inferior derecha */}
          <div className="flex flex-col items-end mt-4 space-y-2">
            <a
              onClick={handleLogout}
              className="cursor-pointer hover:text-gray-400"
            >
              <GrLogout size={24} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RealNavbar;
