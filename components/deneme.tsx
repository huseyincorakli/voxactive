"use client";
import { useYoutubeTranscript } from "@/app/hooks/useTranscriptTracker";
import VoiceRecorder2 from "./deneme2";

// Client component
export function YouTubePlayer() {
  const videoId = "eIho2S0ZahI";
  const { playerRef, currentTime, currentLine, accumulatedText, isReady } =
    useYoutubeTranscript(videoId);

  return (
    <div>
      <div id="yt-player"></div>

      {isReady ? (
        <>
          <p>⏱ Şu anki zaman: {currentTime.toFixed(2)} saniye</p>
          <p>💬 Şu anki altyazı: {currentLine}</p>
          <p>📜 Şu ana kadar birikmiş metin: {accumulatedText}</p>
        </>
      ) : (
        <p>Video ve altyazı yükleniyor, lütfen bekleyin...</p>
      )}

      <VoiceRecorder2 />
    </div>
  );
}
