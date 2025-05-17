import { useEffect, useRef, useState } from "react";
import { getTranscriptYoutube } from "@/app/action";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

function decodeHtml(html: string) {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  const firstPass = txt.value;
  txt.innerHTML = firstPass;
  return txt.value;
}

function getLastFourCompleteSentences(text: string): string {
  if (!text) return "";

  const sentenceEndRegex = /[.!?]\s+/g;

  const sentenceEndIndices = [];
  let match;

  while ((match = sentenceEndRegex.exec(text)) !== null) {
    sentenceEndIndices.push(match.index + match[0].length);
  }

  if (sentenceEndIndices.length === 0) return "";

  let startIndex = 0;
  if (sentenceEndIndices.length > 3) {
    startIndex = sentenceEndIndices[sentenceEndIndices.length - 3];
  }

  // Son 4 cümle (veya daha az varsa tümünü) döndür
  return text.slice(startIndex).trim();
}

export function useYoutubeTranscript(videoId: string) {
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [currentLine, setCurrentLine] = useState<string>("");
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [transcriptReady, setTranscriptReady] = useState(false);

  // Transcript yükleme
  useEffect(() => {
    getTranscriptYoutube(videoId)
      .then((response) => {
        setTranscript(response as any);
        setTranscriptReady(true);
        console.log(response);
      })
      .catch((error) => {
        console.error("Transcript fetch error:", error);
      });
  }, [videoId]);

  // YouTube Player oluşturma
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    const handleAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        height: "390",
        width: "640",
        videoId: videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 1,
        },
        events: {
          onReady: () => setPlayerReady(true),
        },
      });
    };

    // API hazır olduğunda çalışacak fonksiyon
    if (window.YT && window.YT.Player) {
      handleAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = handleAPIReady;
    }

    document.body.appendChild(tag);

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId]);

  // Player ve transcript hazır olduğunda isReady durumunu güncelle
  useEffect(() => {
    if (playerReady && transcriptReady) {
      setIsReady(true);
    }
  }, [playerReady, transcriptReady]);

  // Hazır olduğunda veri izlemeyi başlat
  useEffect(() => {
    if (!isReady || transcript.length === 0) return;

    const interval = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;

      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);

      const current = transcript.find(
        (item) => time >= item.offset && time <= item.offset + item.duration
      );

      setCurrentLine(current ? current.text : "");

      const accumulated = transcript
        .filter((item) => item.offset <= time)
        .map((item) => decodeHtml(item.text))
        .join(" ");

      const lastFourSentences = getLastFourCompleteSentences(accumulated);
      setAccumulatedText(lastFourSentences);
    }, 300);

    return () => clearInterval(interval);
  }, [isReady, transcript]);

  return {
    playerRef,
    currentTime,
    currentLine: decodeHtml(currentLine),
    accumulatedText,
    isReady,
  };
}
