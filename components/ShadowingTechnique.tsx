"use client";

import { useYoutubeTranscript } from "@/app/hooks/useTranscriptTracker";
import { Button } from "./ui/button";
import { Pause, Play, RefreshCw, Volume2 } from "lucide-react";
import VoiceRecorder from "./voiceRecorder";
import AudioRecorder from "./Voice64";
import { useState } from "react";
import { getPronunciationScore } from "@/lib/pronunciation-ai/pronunciationScore";
import { PronunciationFeedback } from "./PronunciationFeedback";

export function ShadowingTechnique() {
  const videoId = "PaErPyEnDvk";
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
  const [recordedAudio, setRecordedAudio] = useState("");
  const [scoreData, setScoreData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const ContinueToShadowing = () => {
    setScoreData(null);
    handlePlay();
  };

  const handleAudioData = async (audioData: string) => {
    setRecordedAudio(audioData);
    setIsProcessing(true);
    try {
      const response = await getPronunciationScore(lastSentence, audioData);
      console.log(response);
      setScoreData(response);
    } catch (error) {
      console.error("Error getting pronunciation score:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = () => {
    if (!recordedAudio) return;

    // Extract the base64 part if it includes the data URI prefix
    let base64Data = recordedAudio;
    if (recordedAudio.includes("base64,")) {
      base64Data = recordedAudio.split("base64,")[1];
    }

    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Make sure the MIME type matches your actual audio format
      const blob = new Blob([byteArray], { type: "audio/webm" }); // or audio/mpeg, etc.
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audio.play().catch((e) => console.error("Audio playback error:", e));

      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error("Error processing audio data:", error);
    }
  };

  return (
    <div className="h-full w-full flex flex-col rounded-xl overflow-hidden shadow-lg bg-zinc-900 text-white">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Column: Video and Current Line (stacked vertically) */}
        <div
          className={`w-full md:w-3/5 flex flex-col ${
            isPlaying ? "block" : "hidden"
          } md:block transition-all duration-300 ease-in-out`}
        >
          {/* YouTube Player */}
          <div
            id="yt-player"
            className="w-full  bg-zinc-800 pointer-events-none"
          ></div>

          {/* Current Line Display - Animated with gradient border */}
          <div className="p-3 bg-zinc-800 border-t-2 border-indigo-500">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></div>
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
          } md:block border-l border-zinc-700 transition-all duration-300 ease-in-out overflow-y-auto`}
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
                  disabled={isPlaying || isRecording}
                  variant="outline"
                  size="sm"
                  className="bg-black hover:bg-zinc-700 border-zinc-700 text-white mr-1"
                >
                  <RefreshCw className="h-5 w-5 ml-0.5" />
                  Repeat
                </Button>
                <Button
                  onClick={handlePlay}
                  disabled={isPlaying || isRecording}
                  variant="outline"
                  size="sm"
                  className="bg-black hover:bg-zinc-700 border-zinc-700 text-white mr-1"
                >
                  <Play className="h-5 w-5 ml-0.5" />
                  Play
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
                  onClick={handlePause}
                  disabled={!isPlaying || isRecording}
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
                      onClick={ContinueToShadowing}
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800"
                      disabled={isRecording || isProcessing}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Continue
                    </Button>
                    <AudioRecorder onAudioData={handleAudioData} />
                    <button
                      onClick={() => playAudio()}
                      className="p-0.5 sm:p-0.5 rounded-lg bg-zinc-700 transition-colors text-white-400 hover:text-emerald-400"
                      aria-label="Play audio"
                      title="Play"
                    >
                      <div className="flex flex-row justify-center items-center gap-1 ">
                        <Volume2 size={16} className="sm:w-4 sm:h-4" />
                        <span className="text-[13px] mt-0.5 font-bold">
                          Listen
                        </span>
                      </div>
                    </button>
                  </div>

                  {isProcessing && (
                    <div className="mt-4 flex justify-center">
                      <div className="w-8 h-8 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-300">
                        Analyzing pronunciation...
                      </span>
                    </div>
                  )}
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

      {/* Pronunciation Feedback Section - Below both columns */}
      {scoreData && !isPlaying && (
        <div className="w-full p-2 bg-zinc-800 border-t border-zinc-700">
          <PronunciationFeedback scoreData={scoreData} />
        </div>
      )}
    </div>
  );
}
