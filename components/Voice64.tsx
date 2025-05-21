"use client";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { CircleStop, Speech } from "lucide-react";

export default function AudioRecorder({ onAudioData }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result.toString();
            setAudioData(base64data);
            if (onAudioData) {
              onAudioData(base64data);
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Ses kaydı başatılırken hata oluştu:", error);
        alert("Ses erişim izni gerekiyor veya bir hata oluştu");
      }
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800"
        onClick={toggleRecording}
      >
        {isRecording ? (
          <>
            <CircleStop />
            Send to Analyze
          </>
        ) : (
          <>
            <Speech />
            Try Pronounce
          </>
        )}
      </Button>
    </>
  );
}
