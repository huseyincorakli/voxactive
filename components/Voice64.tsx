"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { CircleStop, Speech } from "lucide-react";

export default function AudioRecorder({ onAudioData }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [audioData, setAudioData] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Mikrofonu başlangıçta aç ve hazır halde tut
  useEffect(() => {
    const initializeMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        streamRef.current = stream;

        // MediaRecorder'ı hazırla ama başlatma
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        mediaRecorderRef.current = mediaRecorder;

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

        setIsReady(true);
      } catch (error) {
        console.error("Mikrofon erişimi başarısız:", error);
        alert("Ses erişim izni gerekiyor veya bir hata oluştu");
      }
    };

    initializeMicrophone();

    // Cleanup function - component unmount olduğunda stream'i kapat
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!isReady || !mediaRecorderRef.current) {
      alert("Mikrofon henüz hazır değil, lütfen bekleyin.");
      return;
    }

    if (isRecording) {
      // Kaydı durdur
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Yeni kayıt için chunks'ı temizle ve kaydı başlat
      chunksRef.current = [];
      mediaRecorderRef.current.start(100); // 100ms'de bir veri al
      setIsRecording(true);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`${
          isReady
            ? "text-indigo-400 hover:text-indigo-300 hover:bg-pink-600"
            : "text-white cursor-not-allowed"
        } ${
          isRecording ? "animate-pulse bg-red-500 hover:bg-pink-600" : ""
        } mr-1`}
        onClick={toggleRecording}
        disabled={!isReady}
      >
        {isRecording ? (
          <>
            <CircleStop className="animate-pulse text-white" />
            <span className="text-white">Send to Analyze</span>
          </>
        ) : (
          <>
            <Speech className={isReady ? "" : "opacity-50"} />
            {isReady ? "Try Pronounce" : "Preparing..."}
          </>
        )}
      </Button>
    </>
  );
}
