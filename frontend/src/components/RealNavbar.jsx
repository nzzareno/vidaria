import { useEffect, useState } from "react";
import { FaBars, FaBookmark } from "react-icons/fa";
import { GrLogout } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Search from "./Search";

const RealNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1120);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "auth/logout" });
    navigate("/index");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1120);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const navbarStyle = "bg-[#0A0A1A]";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 ${navbarStyle} text-white transition-colors duration-200`}
    >
      <div className="flex items-center justify-between py-4 px-4">
        <h1 className="text-3xl font-bold text-white">
          <Link to={"/"}>vidaria</Link>
        </h1>

        {/* Desktop Nav Links */}
        {!isMobile && (
          <div className="flex flex-1 justify-center space-x-6">
            <Link to="/" className="hover:text-gray-400">
              Home
            </Link>
            <Link to="/movies" className="hover:text-gray-400">
              Movies
            </Link>
            <Link to="/series" className="hover:text-gray-400">
              TV Shows
            </Link>
          </div>
        )}

        {/* Icons and Search for Desktop */}
        {!isMobile && (
          <div className="flex items-center space-x-4">
            <Search />
            <Link to="/watchlist" className="hover:text-red-400 ">
              <FaBookmark size={24} />
            </Link>
            <a
              onClick={handleLogout}
              className="cursor-pointer hover:text-gray-400"
            >
              <GrLogout size={24} />
            </a>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            className="focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaBars size={24} />
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && isMobile && (
        <div className="flex flex-col items-center space-y-4 px-4 pb-4 bg-[#0A0A1A] text-white">
          <Link to="/" className="hover:text-gray-400">
            Home
          </Link>
          <Link to="/movies" className="hover:text-gray-400">
            Movies
          </Link>
          <Link to="/series" className="hover:text-gray-400">
            TV Shows
          </Link>

          {/* Watchlist Link in Mobile Menu */}
          <Link to="/watchlist" className="hover:text-gray-400 ">
            Watchlist
          </Link>

          {/* Logout and Search Icons for Mobile */}
          <div className="flex items-center justify-between w-full mt-4 px-4">
            <a
              onClick={handleLogout}
              className="cursor-pointer hover:text-gray-400"
            >
              <GrLogout size={24} />
            </a>
            <div className="flex-1 max-w-xs text-right">
              <Search />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RealNavbar;
