"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { getTranscriptYoutube } from "@/app/action";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface TranscriptOptions {
  minSentenceLength?: number;
}

export function useYoutubeTranscript(
  videoId: string,
  delay: number,
  options: TranscriptOptions = {}
) {
  // Memoized helper functions inside the hook
  const decodeHtml = useCallback((html: string) => {
    if (!html) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }, []);

  const getWordCount = useCallback((text: string) => {
    return (
      text
        ?.trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length || 0
    );
  }, []);

  // Memoized patterns
  const creditPatterns = useMemo(
    () => [
      /(^|\s)(transcriber|reviewer|translator):?\s*[\w\s.-]+/gi,
      /(^|\s)(transcribed|reviewed|translated)\s*by:?\s*[\w\s.-]+/gi,
      /[\w\s]+(credit|thanks)\s*to:?\s*[\w\s.-]+/gi,
    ],
    []
  );

  const namePatterns = useMemo(
    () => [
      /\b[A-Z][a-z]+ [A-Z]{2}\b/g,
      /(^|\s)(transcriber|reviewer|translator|subtitler|editor):?\s*[\w\s.-]+/gi,
      /(^|\s)(transcribed|reviewed|translated|subtitled)\s*(by|for):?\s*[\w\s.-]+/gi,
      /(^|\s)[\w\s]*(credit|thanks|special\s+thanks)\s*(to|for):?\s*[\w\s.-]+/gi,
    ],
    []
  );

  const getLastFullSentence = useCallback(
    (text: string): string => {
      if (!text) return "";

      let cleanedText = text;
      creditPatterns.forEach((pattern) => {
        cleanedText = cleanedText.replace(pattern, "").trim();
        cleanedText = cleanedText.replace(/(^|\s):\s*/, "").trim();
      });

      const sentenceRegex = /([^.!?]*[.!?]["']?(?:\s|$))/g;
      const sentences: string[] = [];
      let match;

      while ((match = sentenceRegex.exec(cleanedText)) !== null) {
        const sentence = match[0].trim();
        if (sentence) sentences.push(sentence);
      }

      return sentences.length > 0 ? sentences[sentences.length - 1] : "";
    },
    [creditPatterns]
  );

  const cleanTranscriptData = useCallback(
    (transcript: any[]) => {
      if (!transcript?.length) return [];

      const cleanedTranscript = transcript.map((item) => ({
        ...item,
        text: decodeHtml(item.text),
      }));

      const segmentsToCheck = Math.min(10, cleanedTranscript.length);
      for (let i = 0; i < segmentsToCheck; i++) {
        let text = cleanedTranscript[i].text.trim();
        namePatterns.forEach((pattern) => {
          text = text.replace(pattern, "").trim();
        });
        text = text.replace(/^[:,-]\s*/, "").trim();
        cleanedTranscript[i].text = text;
      }

      return cleanedTranscript.filter(
        (segment) => segment.text.trim().length > 0
      );
    },
    [decodeHtml, namePatterns]
  );

  // Rest of the hook implementation remains the same...
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [transcriptReady, setTranscriptReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const minSentenceLength = options.minSentenceLength || 1;
  const sentenceHistory = useRef<string[]>([]);
  const lastProcessedIndex = useRef<number>(-1);
  const accumulatedText = useRef("");
  const lastPausedPosition = useRef<number>(-1);
  const manuallyPlayed = useRef<boolean>(false);

  // Memoized transcript processor
  const processTranscript = useCallback(
    (data: any[]) => {
      const cleaned = cleanTranscriptData(data);
      return cleaned.map((item, index) => ({
        ...item,
        originalIndex: index,
        text: decodeHtml(item.text),
        wordCount: getWordCount(item.text),
        isSentenceEnd: /[.!?]\s*$/.test(item.text),
      }));
    },
    [cleanTranscriptData, decodeHtml, getWordCount]
  );

  // Load transcript
  useEffect(() => {
    getTranscriptYoutube(videoId)
      .then((response) => {
        setTranscript(processTranscript(response as any[]));
        setTranscriptReady(true);
      })
      .catch(console.error);
  }, [videoId, processTranscript]);

  // Initialize YouTube player
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    const handleAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          disablekb: 1,
          showinfo: 0,
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (event: any) => {
            const newIsPlaying = event.data === window.YT.PlayerState.PLAYING;
            setIsPlaying(newIsPlaying);

            if (newIsPlaying && event.data === window.YT.PlayerState.PLAYING) {
              manuallyPlayed.current = true;
              setTimeout(() => {
                manuallyPlayed.current = false;
              }, 1000);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      handleAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = handleAPIReady;
    }

    document.body.appendChild(tag);
    return () => {
      window.onYouTubeIframeAPIReady = null;
      document.body.removeChild(tag);
    };
  }, [videoId]);

  // Check readiness
  useEffect(() => {
    if (playerReady && transcriptReady) setIsReady(true);
  }, [playerReady, transcriptReady]);

  // Tracking effect with optimized processing
  useEffect(() => {
    if (!isReady || !transcript.length) return;

    const interval = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;

      const currentTime = playerRef.current.getCurrentTime();
      setCurrentTime(currentTime);

      // Find active segments with early exit
      let currentText = "";
      let currentSegmentWordCount = 0;
      let currentSegmentIndex = -1;

      for (let i = 0; i < transcript.length; i++) {
        const seg = transcript[i];
        if (
          currentTime >= seg.offset &&
          currentTime < seg.offset + seg.duration
        ) {
          currentText = seg.text;
          currentSegmentWordCount = seg.wordCount;
          currentSegmentIndex = i;
          break;
        }
      }

      setCurrentLine(currentText);

      // Build accumulated text only when needed
      if (
        currentSegmentIndex >= 0 &&
        currentSegmentIndex > lastProcessedIndex.current
      ) {
        const startIndex = Math.max(0, currentSegmentIndex - 5);
        let newAccumulatedText = "";

        for (let i = startIndex; i <= currentSegmentIndex; i++) {
          if (transcript[i]?.text) {
            newAccumulatedText += " " + transcript[i].text;
          }
        }

        accumulatedText.current = newAccumulatedText.trim();
        lastProcessedIndex.current = currentSegmentIndex;

        const newSentence = getLastFullSentence(accumulatedText.current);
        if (newSentence && !sentenceHistory.current.includes(newSentence)) {
          sentenceHistory.current = [
            ...sentenceHistory.current.slice(-4),
            newSentence,
          ];
        }
      }

      // Check for pause points
      transcript.forEach((seg, index) => {
        if (
          seg.isSentenceEnd &&
          seg.wordCount >= minSentenceLength &&
          currentTime >= seg.offset + seg.duration &&
          currentTime < seg.offset + seg.duration + 0.3 &&
          Math.abs(currentTime - lastPausedPosition.current) > 1.0 &&
          index < transcript.length - 1
        ) {
          setTimeout(() => {
            if (playerRef.current?.getPlayerState() === 1) {
              playerRef.current.pauseVideo();
              lastPausedPosition.current = currentTime;
            }
          }, delay);
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isReady, transcript, delay, minSentenceLength, getLastFullSentence]);

  const handlePlay = useCallback(() => {
    playerRef.current?.playVideo?.();
  }, []);

  const handlePause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  return {
    playerRef,
    currentTime,
    currentLine,
    lastSentence:
      sentenceHistory.current[sentenceHistory.current.length - 1] || "",
    isReady,
    isPlaying,
    handlePlay,
    handlePause,
  };
}
