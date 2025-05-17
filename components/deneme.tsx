"use client";

import { useYoutubeTranscript } from "@/app/hooks/useTranscriptTracker";

export function ShadowingTechnique() {
  const videoId = "aImrjNPrh30";
  const {
    handlePlay,
    handlePause,
    currentTime,
    currentLine,
    lastSentence,
    isReady,
    isPlaying,
  } = useYoutubeTranscript(videoId, 0, {
    minSentenceLength: 1, // Minimum word count for pausing
  });

  return (
    <div className="shadowing-container">
      <div id="yt-player" className="video-container"></div>
      {isReady ? (
        <div className="transcript-container">
          <div className="controls">
            <p>Status: {isPlaying ? "Playing" : "Paused"}</p>
            <p>Current Time: {currentTime.toFixed(3)}s</p>
            <div className="control-buttons">
              <button onClick={handlePlay} disabled={isPlaying}>
                Play
              </button>
              <button onClick={handlePause} disabled={!isPlaying}>
                Pause
              </button>
            </div>
          </div>
          <div className="transcript-content">
            <p className="current-line">Current Line: {currentLine}</p>
            {!isPlaying && lastSentence && (
              <div className="sentence-box">
                <h3>Repeat This Sentence:</h3>
                <p className="last-sentence">{lastSentence}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
