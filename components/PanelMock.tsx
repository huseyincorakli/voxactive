export default function PanelMock({
  title,
  innerText,
  imagePath,
  imageAlt,
}: {
  title: string;
  innerText: string;
  imagePath: string;
  imageAlt: string;
}) {
  return (
    <div className="w-full group relative flex flex-col items-center gap-6 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-transparent border border-zinc-700/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl max-w-6xl mx-auto hover:border-blue-500/20 transition-all duration-500 ease-in-out overflow-hidden">
      {/* Softened background elements */}
      <div className="absolute -inset-1 opacity-0 group-hover:opacity-30 transition-opacity duration-700 ease-in-out">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-500/3 via-transparent to-transparent"></div>
      </div>

      {/* Title and Description */}
      <div className="relative z-10 text-white w-full text-center space-y-4">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500/90 to-indigo-500/90 animate-pulse transition-all duration-1000 ease-in-out"></div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400/90 to-indigo-400/90 transition-all duration-300">
            {title}
          </h2>
        </div>
        <p className="text-zinc-300/80 text-base leading-relaxed max-w-3xl mx-auto transition-colors duration-300">
          {innerText}
        </p>
      </div>

      {/* Image with smoother transition */}
      <div className="relative z-10 w-full transition-all duration-500 ease-in-out">
        <div className="bg-gradient-to-b from-zinc-900/60 to-transparent rounded-xl overflow-hidden shadow-xl  ring-white/10 group-hover:ring-blue-500/20 transition-all duration-700 ease-in-out">
          <img
            src={imagePath}
            alt={imageAlt}
            className="w-full h-auto object-contain transition-transform duration-700 ease-in-out group-hover:scale-[1.012]"
          />
        </div>
      </div>
    </div>
  );
}
