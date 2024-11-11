const StreamingLinks = ({ links }) => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Where to Watch</h2>
      <div className="flex flex-wrap gap-4">
        {links.map((link) => (
          <div
            key={link.provider}
            className="p-2 rounded-full bg-gray-900 cursor-pointer"
            onClick={() =>
              window.open(
                `https://www.${link.provider.toLowerCase()}.com`,
                "_blank"
              )
            }
          >
            <img
              src={link.logo}
              className="w-12 h-12 rounded-full object-cover transition-transform duration-200  "
              alt={link.provider}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamingLinks;
