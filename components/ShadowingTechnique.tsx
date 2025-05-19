"use client";

import { useYoutubeTranscript } from "@/app/hooks/useTranscriptTracker";
import { Button } from "./ui/button";
import {
  Pause,
  Play,
  RefreshCw,
  Volume2,
  SkipForward,
  SkipBack,
} from "lucide-react";

export function ShadowingTechnique() {
  const videoId = "5MgBikgcWnY";
  const {
    handlePlay,
    handlePause,
    handleRepeat,
    currentTime,
    currentLine,
    lastSentence,
    isReady,
    isPlaying,
  } = useYoutubeTranscript(videoId, 0, {
    minSentenceLength: 1,
  });

  return (
    <div className="container w-full mx-auto rounded-xl overflow-hidden shadow-lg bg-zinc-900 text-white">
      <div className="flex flex-col md:flex-row">
        {/* Left Column: Video and Current Line (stacked vertically) */}
        <div
          className={`w-full md:w-3/5 ${
            isPlaying ? "block" : "hidden"
          } md:block transition-all duration-300 ease-in-out`}
        >
          {/* YouTube Player */}
          <div
            id="yt-player"
            className="w-full aspect-video bg-zinc-800  "
          ></div>

          {/* Current Line Display - Animated with gradient border */}
          <div className="p-3 bg-zinc-800 border-t-2 border-indigo-500">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-indigo-500 rounded-full mr-3 "></div>
              <p className="text-sm font-medium tracking-wide overflow-hidden">
                {currentLine || "Waiting for speech..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Controls and Status */}
        <div
          className={`w-full md:w-2/5 p-5 bg-zinc-800 ${
            isPlaying ? "hidden" : "block"
          } md:block border-l border-zinc-700 transition-all duration-300 ease-in-out`}
        >
          {isReady ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isPlaying ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-300">
                    {isPlaying ? "Playing" : "Paused"}
                  </span>
                </div>
                <span className="text-xs text-gray-400 bg-zinc-700 px-2 py-1 rounded-md">
                  {currentTime.toFixed(1)}s
                </span>
              </div>

              {/* Control Panel */}
              <div>
                <Button
                  onClick={handleRepeat}
                  disabled={isPlaying}
                  variant="outline"
                  size="sm"
                  className="bg-black hover:bg-zinc-700 border-zinc-700 text-white mr-1"
                >
                  <RefreshCw className="h-5 w-5 ml-0.5" />
                  Repeat
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
                  onClick={handlePause}
                  disabled={!isPlaying}
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              </div>

              {/* Repeat Sentence Section */}
              {!isPlaying && lastSentence && (
                <div className="bg-zinc-900 rounded-lg p-4 border-l-4 border-indigo-500">
                  <h3 className="text-sm font-bold mb-3 text-gray-300 uppercase tracking-wider">
                    Shadow This Phrase
                  </h3>
                  <p className="text-lg text-white font-medium">
                    "{lastSentence}"
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlay}
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-12 h-12 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading transcript...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
