"use client";
type Video = {
  id: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
};

type Props = {
  category: string;
  videos: Video[];
};
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

const SCROLL_AMOUNT = 320;

export const ClientCarousel = ({ category, videos }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const EPSILON = 1;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    const leftEdge = Math.floor(scrollLeft);
    const rightEdge = Math.ceil(scrollLeft + clientWidth);

    setShowLeft(leftEdge > EPSILON);
    setShowRight(rightEdge < scrollWidth - EPSILON);
  };

  useEffect(() => {
    checkScroll();
  }, [videos]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScroll);
    checkScroll();

    return () => {
      container.removeEventListener("scroll", checkScroll);
    };
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <div className="space-y-4 relative">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          {category}
        </h2>
        <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
      </div>

      {/* Scroll buttons */}
      <div className="relative">
        {showLeft && (
          <button
            onClick={scrollLeft}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        )}

        {showRight && (
          <button
            onClick={scrollRight}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        )}

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth px-4 sm:px-8"
          style={{ scrollbarWidth: "none" }}
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className="min-w-[220px] max-w-[260px] mt-3 sm:min-w-[280px] sm:max-w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:-translate-y-1"
            >
              <div className="relative">
                <Image
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  width={480}
                  height={360}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 scale-90 hover:scale-100 transition-all duration-300 backdrop-blur-sm">
                    <svg
                      className="w-5 h-5 text-gray-800 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {video.category}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      video.level === "Beginner"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : video.level === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {video.level}
                  </Badge>
                </div>
                <Link
                  key={video.id}
                  href={`/learn/shadowing/${toSlug(video.title)}`}
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {video.title}
                  </h3>
                </Link>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Quality Content
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
