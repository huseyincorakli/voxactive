"use client";
import React, { useEffect, useRef, useState } from "react";

const VoiceRecorder2: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Mikrofon başlatılıyor..."
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
          },
        });

        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; // Daha hızlı tepki için daha küçük FFT
        analyserRef.current.smoothingTimeConstant = 0.4; // Daha az yumuşatma
        sourceRef.current = audioContextRef.current.createMediaStreamSource(
          streamRef.current
        );
        sourceRef.current.connect(analyserRef.current);

        // Önceden buffer oluştur
        const buffer = audioContextRef.current.createBuffer(
          1,
          audioContextRef.current.sampleRate * 0.1, // 100ms buffer
          audioContextRef.current.sampleRate
        );

        mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
          mimeType: "audio/webm",
          audioBitsPerSecond: 128000,
        });

        // Daha sık data available event'i
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          setAudioUrl(URL.createObjectURL(audioBlob));
          audioChunksRef.current = [];
        };

        setStatusMessage("Ses bekleniyor...");
        detectVoice();
      } catch (err) {
        setStatusMessage("Mikrofon izni gerekli!");
        console.error(err);
      }
    };

    const drawVolumeMeter = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      let count = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > 5) {
          sum += dataArray[i];
          count++;
        }
      }
      const average = count > 0 ? sum / count : 0;
      setVolumeLevel(average);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgb(200, 200, 200)";
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const hue = Math.min(120 + dataArray[i] * 0.5, 360);
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(drawVolumeMeter);
    };

    const detectVoice = () => {
      const bufferLength = analyserRef.current!.frequencyBinCount;
      const timeDomainData = new Uint8Array(bufferLength);
      const frequencyData = new Uint8Array(bufferLength);

      let speaking = false;
      const volumeThreshold = 15; // Daha düşük eşik
      const minRecordingDuration = 1000; // Minimum kayıt süresi (ms)
      const silenceDuration = 1500; // Kaydı durdurmak için sessizlik süresi (ms)
      const minSoundDuration = 100; // Çok kısa sesler için minimum süre (ms)

      let recordingStartTime = 0;
      let lastSoundTime = 0;
      let soundStartTime = 0;
      let isSoundActive = false;

      const check = () => {
        analyserRef.current!.getByteTimeDomainData(timeDomainData);
        analyserRef.current!.getByteFrequencyData(frequencyData);

        // Hızlı RMS hesaplama
        let sum = 0;
        for (let i = 0; i < 50; i++) {
          // Sadece ilk 50 sample
          const value = (timeDomainData[i] - 128) / 128;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / 50) * 100;

        // Ses algılama
        const isSoundDetected = rms > volumeThreshold;

        if (isSoundDetected) {
          lastSoundTime = Date.now();

          if (!isSoundActive) {
            soundStartTime = Date.now();
            isSoundActive = true;
          }

          // Hemen kayda başla (minimum süre bekleme)
          if (!speaking) {
            speaking = true;
            if (mediaRecorderRef.current?.state === "inactive") {
              mediaRecorderRef.current.start(0); // 100ms'lik chunks
              recordingStartTime = Date.now();
              setIsRecording(true);
              setStatusMessage("Kayıt yapılıyor...");
              console.log("Konuşma algılandı: Kayıt başladı.");
            }
          }
        } else {
          isSoundActive = false;
        }

        // Kayıt devam ederken sessizlik kontrolü
        if (speaking) {
          const timeSinceLastSound = Date.now() - lastSoundTime;

          if (timeSinceLastSound > silenceDuration) {
            speaking = false;
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
              setStatusMessage("Sessizlik algılandı, kayıt durdu.");
              console.log("Uzun sessizlik algılandı: Kayıt durdu.");
            }
          } else {
            setStatusMessage(
              `Kayıt yapılıyor (${Math.floor(
                (silenceDuration - timeSinceLastSound) / 1000
              )}s)`
            );
          }
        }

        animationRef.current = requestAnimationFrame(check);
      };

      drawVolumeMeter();
      check();
    };

    init();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, []);

  return (
    <div className="p-4 border rounded-xl shadow w-full max-w-md mx-auto mt-10 text-center">
      <h2 className="text-xl font-bold mb-4">Otomatik Ses Kaydedici</h2>
      <p className="mb-4">
        {isRecording ? (
          <span className="text-green-600 font-medium">{statusMessage}</span>
        ) : (
          <span className="text-gray-600 font-medium">{statusMessage}</span>
        )}
      </p>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width="300"
          height="100"
          className="w-full h-25 bg-gray-200 rounded"
        />
        <p className="mt-2">Ses Seviyesi: {volumeLevel.toFixed(1)}</p>
      </div>

      {audioUrl && (
        <div className="mt-4">
          <p className="mb-2 font-semibold">Kaydedilen Ses:</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder2;
