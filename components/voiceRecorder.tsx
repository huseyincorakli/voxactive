"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Loader2 } from "lucide-react";

export interface VoiceRecorderRef {
  getAudioBlob: () => Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

// Mikrofon erişimi için durum, saniyeler içinde
const MICROPHONE_WARMUP_TIME = 1000; // 1 saniye mikrofon ısınma süresi

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(({ onRecordingComplete }, ref) => {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'recording' | 'recorded'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const microphoneInitializedRef = useRef<boolean>(false);

  // Temizlik işlemleri
  useEffect(() => {
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    return () => {
      cleanupResources();
    };
  }, []);

  const cleanupResources = () => {
    // Audio URLs temizleme
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    // Audio player temizleme
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = "";
      audioPlayerRef.current.removeEventListener("ended", () => {
        setIsPlaying(false);
      });
    }
    
    // Timer temizleme
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stream ve tracks temizleme
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // MediaRecorder temizleme
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("MediaRecorder durdurulurken hata:", e);
      }
    }
    mediaRecorderRef.current = null;
    microphoneInitializedRef.current = false;
  };

  // Mikrofon erişimi ve sesi kaydetmeye hazırlık
  const prepareMicrophone = async (): Promise<boolean> => {
    try {
      cleanupResources();
      setError(null);
      
      // 1. Ses akışı edinme
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      
      // 2. MediaRecorder'ı yapılandırma
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      });
      
      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          setError("Ses kaydedilemedi. Lütfen mikrofonunuzu kontrol edin.");
          setStatus('idle');
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        
        setAudioURL(url);
        setAudioBlob(audioBlob);
        setStatus('recorded');
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };
      
      mediaRecorderRef.current = recorder;
      
      // 3. Mikrofon kontrolü - sessiz test kayıt
      let testRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      let testStarted = false;
      let testStopped = false;
      
      return new Promise((resolve) => {
        // Test kayıt başlatma
        try {
          testRecorder.start();
          testStarted = true;
          
          // MICROPHONE_WARMUP_TIME ms sonra test kaydını durdur
          setTimeout(() => {
            if (testRecorder && testRecorder.state === 'recording') {
              testRecorder.stop();
              testStopped = true;
            }
          }, MICROPHONE_WARMUP_TIME);
          
          // Test kaydı durdurulduğunda
          testRecorder.onstop = () => {
            microphoneInitializedRef.current = true;
            resolve(true);
          };
          
          // Güvenlik zamanı aşımı (2x mikrofon ısınma süresi)
          setTimeout(() => {
            if (!testStopped) {
              if (testRecorder && testRecorder.state === 'recording') {
                testRecorder.stop();
              }
              if (!microphoneInitializedRef.current) {
                microphoneInitializedRef.current = true;
                resolve(true);
              }
            }
          }, MICROPHONE_WARMUP_TIME * 2);
          
        } catch (e) {
          console.error("Test kayıt başlatma hatası:", e);
          if (!testStarted && !testStopped && !microphoneInitializedRef.current) {
            microphoneInitializedRef.current = true;
            resolve(false);
          }
        }
      });
    } catch (err) {
      console.error("Mikrofona erişim hatası:", err);
      setError("Mikrofona erişilemedi. Lütfen tarayıcı izinlerinizi kontrol edin.");
      setStatus('idle');
      return false;
    }
  };

  // Kayıt başlatma işlemi
  const startRecording = async () => {
    setStatus('preparing');
    audioChunksRef.current = [];
    setRecordingTime(0);
    
    // Mikrofon hazırlama
    const micReady = await prepareMicrophone();
    
    if (!micReady || !mediaRecorderRef.current) {
      setError("Mikrofon hazırlanamadı. Lütfen tekrar deneyin.");
      setStatus('idle');
      return;
    }

    try {
      // Gerçek kayıt başlatma
      mediaRecorderRef.current.start(100); // Her 100ms'de bir veri alma
      setStatus('recording');
      
      // Süre sayacı
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error("Kayıt başlatma hatası:", e);
      setError("Kayıt başlatılamadı. Lütfen tekrar deneyin.");
      setStatus('idle');
      cleanupResources();
    }
  };

  // Kayıt durdurma
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        
        // Timer temizleme
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } catch (e) {
        console.error("Kayıt durdurma hatası:", e);
        setError("Kayıt durdurulurken bir hata oluştu.");
        setStatus('idle');
      }
    }
  };

  // Ses çalma/durdurma
  const togglePlayback = () => {
    if (!audioURL || !audioPlayerRef.current) return;
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.src = audioURL;
      audioPlayerRef.current.play()
        .catch(err => {
          console.error("Ses çalma hatası:", err);
          setError("Ses çalınamadı.");
          setIsPlaying(false);
        });
      setIsPlaying(true);
    }
  };

  // Saniye -> MM:SS formatına dönüştürme
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Parent component'e metodları açığa çıkarma
  useImperativeHandle(ref, () => ({
    getAudioBlob: () => audioBlob,
    startRecording: async () => {
      if (status !== 'recording' && status !== 'preparing') {
        await startRecording();
      }
    },
    stopRecording: () => {
      if (status === 'recording') {
        stopRecording();
      }
    }
  }));

  return (
    <div className="flex items-center gap-2">
      {error && <div className="text-red-500 text-xs">{error}</div>}
      
      {status === 'preparing' ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 bg-yellow-500 hover:bg-yellow-600 border-none text-white"
          disabled
        >
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          <span className="text-xs">Preparing the microphone...</span>
        </Button>
      ) : status === 'recording' ? (
        <Button 
          onClick={stopRecording} 
          variant="outline" 
          size="sm"
          className="h-8 bg-red-500 hover:bg-red-600 border-none text-white"
        >
          <Square className="h-3 w-3 mr-1" />
          <span className="text-xs">{formatTime(recordingTime)}</span>
        </Button>
      ) : (
        <Button 
          onClick={startRecording} 
          variant="outline" 
          size="sm"
          className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none text-white"
          disabled={isPlaying}
        >
          <Mic className="h-3 w-3 mr-1" />
          <span className="text-xs">Reply with Voice</span>
        </Button>
      )}
      
      {audioURL && (status === 'idle' || status === 'recorded') && (
        <Button 
          onClick={togglePlayback} 
          variant="outline" 
          size="sm"
          className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none text-white"
        >
          {isPlaying ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span className="text-xs">Playing...</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              <span className="text-xs">Play</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
});

VoiceRecorder.displayName = "VoiceRecorder";

export default VoiceRecorder;