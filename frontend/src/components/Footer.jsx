import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
library.add(fab);

const Footer = () => {
  return (
    <footer
      className=" text-white bg-[#0A0A1A]
      
     text-center p-14"
    >
      <div className="flex flex-col items-center ">
        <strong className="text-xl">
          <span className="text-blue-500 "> JOIN TO VIDARIA</span>
        </strong>
        <p className="text-light text-sm mb-4 mt-5">
          Stay connected with us on social media!
        </p>

        <div className="flex justify-center space-x-4 text-xl">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light transition duration-300 hover:text-blue-500"
          >
            <FontAwesomeIcon icon={["fab", "facebook-f"]} />
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light transition duration-300 hover:text-blue-400"
          >
            <FontAwesomeIcon icon={["fab", "twitter"]} />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light transition duration-300 hover:text-pink-500"
          >
            <FontAwesomeIcon icon={["fab", "instagram"]} />
          </a>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-light">
          © {new Date().getFullYear()} Vidaria. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
