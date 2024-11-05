import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center p-8">
        <h1 className="text-8xl font-bold text-indigo-500">404</h1>
        <h2 className="text-2xl mt-4 mb-6">Oops! Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          It seems the page you are looking for doesn&#39;t exist. You may have
          mistyped the address or the page may have moved.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
