import { useEffect, useState } from "react";
import { getTranscriptYoutube } from "@/app/action";

export function useTranscript(videoId: string) {
  const [transcript, setTranscript] = useState<any[]>([]);

  useEffect(() => {
    getTranscriptYoutube(videoId)
      .then((response) => {
        setTranscript(response as any);
      })
      .catch((error) => {
        console.error("Transcript fetch error:", error);
      });
  }, [videoId]);

  return transcript;
}
