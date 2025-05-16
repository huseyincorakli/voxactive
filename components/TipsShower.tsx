"use client";
import { useState } from "react";

function TipsShower({ tips }: { tips: string }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const tipList = tips
    ? tips
        .split("#")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  const prev = () => {
    setActiveIndex((prev) => (prev === 0 ? tipList.length - 1 : prev - 1));
  };

  const next = () => {
    setActiveIndex((prev) => (prev === tipList.length - 1 ? 0 : prev + 1));
  };

  // Yardımcı: Tırnak içindeki metinleri ayırır ve span'ler
  const renderFormattedSentence = (sentence: string) => {
    const parts = sentence.split(/(".*?")/g); // "..." deseninde ayır
    return parts.map((part, idx) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return (
          <span key={idx} className="text-red-600 font-bold">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="bg-gray-100 rounded-xl mt-2 p-3 shadow-md w-full max-w-full">
      <h3 className="text-base text-blue-600 font-bold mb-2 border-b border-blue-300 pb-1 text-center">
        Tips
        {activeIndex !== -1 && (
          <span>-({tips ? `${tipList.length}/${activeIndex + 1}` : 0})</span>
        )}
      </h3>

      <div className="relative flex items-center overflow-hidden w-full max-w-full">
        {/* Prev button */}
        <button
          onClick={prev}
          className="z-10 p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
          aria-label="Previous tip"
        >
          ‹
        </button>

        {/* Carousel container */}
        <div className="flex-1 mx-1 overflow-hidden w-full max-w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {tipList.map((sentence, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-full bg-white rounded-lg px-2 py-1 cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300"
                onClick={() => setActiveIndex(idx === activeIndex ? -1 : idx)}
              >
                <p
                  className={`text-gray-800 text-sm transition duration-300 break-words whitespace-normal ${
                    activeIndex === idx ? "filter-none" : "filter blur-xs"
                  }`}
                >
                  <span className=" text-blue-600 font-bold">{idx + 1}- </span>
                  {renderFormattedSentence(sentence)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="z-10 p-2 text-amber-600 hover:text-amber-800 focus:outline-none"
          aria-label="Next tip"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default TipsShower;
