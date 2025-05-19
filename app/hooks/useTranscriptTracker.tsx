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
      const sentences = [];
      const segments = cleanedText.split(/([.!?]["']?\s+|[.!?]["']?$)/);
      let currentSentence = "";
      for (let i = 0; i < segments.length; i += 2) {
        if (i + 1 < segments.length) {
          currentSentence += segments[i] + segments[i + 1];
          const quoteCount = (currentSentence.match(/"/g) || []).length;
          const isInQuotes = quoteCount % 2 !== 0;
          if (!isInQuotes || segments[i + 1].trim().endsWith('"')) {
            sentences.push(currentSentence.trim());
            currentSentence = "";
          }
        } else if (segments[i]) {
          currentSentence += segments[i];
          if (currentSentence.trim()) {
            sentences.push(currentSentence.trim());
          }
        }
      }
      if (currentSentence.trim()) {
        sentences.push(currentSentence.trim());
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

  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [transcriptReady, setTranscriptReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false); // 👈 yeni state
  const [lastSentenceTimestamp, setLastSentenceTimestamp] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const minSentenceLength = options.minSentenceLength || 1;
  const sentenceHistory = useRef<string[]>([]);
  const lastProcessedIndex = useRef<number>(-1);
  const accumulatedText = useRef("");
  const lastPausedPosition = useRef<number>(-1);
  const manuallyPlayed = useRef<boolean>(false);

  const processTranscript = useCallback(
    (data: any[]) => {
      const cleaned = cleanTranscriptData(data);
      return cleaned.map((item, index) => ({
        ...item,
        originalIndex: index,
        text: decodeHtml(item.text),
        wordCount: getWordCount(item.text),
        isSentenceEnd: ((text) => {
          const quoteCount = (text.match(/"/g) || []).length;
          if (/[.!?]$/.test(text) && quoteCount % 2 === 0) return true;
          if (/[.!?]"$/.test(text)) return true;
          return false;
        })(item.text),
      }));
    },
    [cleanTranscriptData, decodeHtml, getWordCount]
  );

  useEffect(() => {
    getTranscriptYoutube(videoId)
      .then((response) => {
        setTranscript(processTranscript(response as any[]));
        setTranscriptReady(true);
      })
      .catch(console.error);
  }, [videoId, processTranscript]);

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
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (event: any) => {
            const newIsPlaying = event.data === window.YT.PlayerState.PLAYING;
            setIsPlaying(newIsPlaying);
            if (newIsPlaying) {
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
      if (tag.parentNode) document.body.removeChild(tag);
    };
  }, [videoId]);

  useEffect(() => {
    if (playerReady && transcriptReady) setIsReady(true);
  }, [playerReady, transcriptReady]);

  useEffect(() => {
    if (!isReady || !transcript.length) return;

    let rafId: number;

    const tick = () => {
      if (!playerRef.current?.getCurrentTime) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const currentTime = playerRef.current.getCurrentTime();
      setCurrentTime(currentTime);

      // 🛑 repeat mode kontrolü
      if (
        repeatMode &&
        lastSentenceTimestamp &&
        currentTime >= lastSentenceTimestamp.end - 0.1
      ) {
        playerRef.current.pauseVideo();
        setRepeatMode(false); // tekrar bittiğinde repeat moddan çık
        return;
      }

      let currentSegmentIndex = -1;
      for (let i = 0; i < transcript.length; i++) {
        const seg = transcript[i];
        if (
          currentTime >= seg.offset &&
          currentTime < seg.offset + seg.duration
        ) {
          currentSegmentIndex = i;
          setCurrentLine(seg.text);
          break;
        }
      }

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

      if (currentSegmentIndex >= 0) {
        const seg = transcript[currentSegmentIndex];
        const nextIndex = currentSegmentIndex + 1;

        if (
          seg.isSentenceEnd &&
          seg.wordCount >= minSentenceLength &&
          currentTime >= seg.offset + seg.duration - 0.15 &&
          currentTime < seg.offset + seg.duration + 0.15 &&
          Math.abs(currentTime - lastPausedPosition.current) > 1.0 &&
          nextIndex < transcript.length &&
          !repeatMode // ❗️repeat sırasında durdurma olmasın
        ) {
          playerRef.current.pauseVideo();
          lastPausedPosition.current = currentTime;

          let sentenceStartIndex = currentSegmentIndex;
          for (let i = currentSegmentIndex; i >= 0; i--) {
            if (i === 0 || transcript[i - 1].isSentenceEnd) {
              sentenceStartIndex = i;
              break;
            }
          }

          setLastSentenceTimestamp({
            start: transcript[sentenceStartIndex].offset,
            end:
              transcript[currentSegmentIndex].offset +
              transcript[currentSegmentIndex].duration,
          });
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    isReady,
    transcript,
    delay,
    minSentenceLength,
    getLastFullSentence,
    repeatMode,
  ]);

  const handlePlay = useCallback(() => {
    playerRef.current?.playVideo?.();
  }, []);

  const handlePause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  // ✅ Repeat: sadece belirtilen cümle aralığında çalış ve sonunda dur
  const handleRepeat = useCallback(() => {
    if (lastSentenceTimestamp && playerRef.current?.seekTo) {
      playerRef.current.seekTo(lastSentenceTimestamp.start, true);
      lastProcessedIndex.current = -1;
      setRepeatMode(true); // 🔥 tekrar modunu başlat
      setTimeout(() => {
        playerRef.current?.playVideo?.();
      }, 100);
    }
  }, [lastSentenceTimestamp]);

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
    handleRepeat,
    lastSentenceTimestamp,
  };
}
