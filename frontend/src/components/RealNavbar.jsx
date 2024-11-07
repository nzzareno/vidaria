import { useEffect, useState } from "react";
import { FaBars, FaBookmark } from "react-icons/fa";
import { GrLogout } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Search from "./Search";

const RealNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "auth/logout" });
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isDetailsPage =
    location.pathname.startsWith("/movies/") ||
    location.pathname.startsWith("/series/");
  const isHomePage = location.pathname === "/home";
  const isMoviesPage = location.pathname === "/movies";

  const navbarStyle =
    isMobile ||
    (isScrolled && isDetailsPage) ||
    (!isDetailsPage && !isHomePage && !isMoviesPage)
      ? "bg-[#0A0A1A]"
      : "bg-transparent";

  const handleSearchResults = (results) => {
    console.log("Resultados de búsqueda:", results);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 ${navbarStyle} text-white transition-colors duration-200`}
    >
      <div className="flex items-center justify-between py-4 px-4">
        <h1 className="text-3xl font-bold text-white">
          <Link to={"/"}>vidaria</Link>
        </h1>

        <div
          className={`hidden ${
            isMobile ? "flex" : "md:flex"
          } flex-1 justify-center space-x-6`}
        >
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

        {/* Componente de búsqueda */}
        {/* Componente de búsqueda */}
        <div className="flex items-center space-x-3">
          <Search onResults={handleSearchResults} />

          {/* Icono de Watchlist */}
          <Link
            to="/watchlist"
            className="flex pr-[1.4rem] items-center hover:text-red-400"
            style={{ display: "flex", alignItems: "center" }}
          >
            <FaBookmark size={24} />
          </Link>

          {/* Botón de logout */}
          <a
            onClick={handleLogout}
            className="flex items-center cursor-pointer hover:text-gray-400"
            style={{ display: "flex", alignItems: "center" }}
          >
            <GrLogout size={24} />
          </a>
        </div>

        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FaBars size={24} />
        </button>
      </div>

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
          <div className="flex flex-col items-end mt-4 space-y-2">
            {/* Icono de Watchlist en menú desplegable */}
            <Link to="/watchlist" className="hover:text-gray-400">
              <FaBookmark size={24} />
            </Link>

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
