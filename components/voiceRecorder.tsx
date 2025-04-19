"use client";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Loader2 } from "lucide-react";

export interface VoiceRecorderRef {
  getAudioBlob: () => Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: (cancel?: boolean) => void;
}

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  showAudio?: boolean; 
}

const MICROPHONE_WARMUP_TIME = 1000;

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(
  ({ onRecordingComplete, showAudio = true }, ref) => {
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

    useEffect(() => {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.addEventListener("ended", () => setIsPlaying(false));
      return cleanupResources;
    }, []);

    const cleanupResources = () => {
      if (audioURL) URL.revokeObjectURL(audioURL);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
        audioPlayerRef.current.removeEventListener("ended", () => setIsPlaying(false));
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop();
      }
      mediaRecorderRef.current = null;
    };

    const prepareMicrophone = async (): Promise<boolean> => {
      try {
        cleanupResources();
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 128000,
        });
        
        recorder.ondataavailable = event => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        
        recorder.onstop = () => {
          if (audioChunksRef.current.length === 0) {
            setError("Recording failed. Please check your microphone.");
            setStatus('idle');
            return;
          }
          
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioURL(URL.createObjectURL(blob));
          setAudioBlob(blob);
          setStatus('recorded');
          onRecordingComplete?.(blob);
        };
        
        mediaRecorderRef.current = recorder;
        return true;
      } catch (err) {
        console.error("Microphone access error:", err);
        setError("Could not access microphone. Please check browser permissions.");
        setStatus('idle');
        return false;
      }
    };

    const startRecording = async () => {
      setStatus('preparing');
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      const micReady = await prepareMicrophone();
      if (!micReady || !mediaRecorderRef.current) {
        setError("Microphone initialization failed");
        setStatus('idle');
        return;
      }

      try {
        mediaRecorderRef.current.start(100);
        setStatus('recording');
        timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      } catch (e) {
        console.error("Recording start error:", e);
        setError("Failed to start recording");
        setStatus('idle');
        cleanupResources();
      }
    };

    const stopRecording = (cancel = false) => {
      if (mediaRecorderRef.current?.state === 'recording') {
        try {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          if (cancel) {
            mediaRecorderRef.current.ondataavailable = null;
            mediaRecorderRef.current.onstop = null;
            streamRef.current?.getTracks().forEach(track => track.stop());
            audioChunksRef.current = [];
            setStatus('idle');
          } else {
            mediaRecorderRef.current.stop();
          }

          setRecordingTime(0);
        } catch (e) {
          console.error("Stop recording error:", e);
          setError("Error stopping recording");
          setStatus('idle');
        }
      }
    };

    const togglePlayback = () => {
      if (!audioURL || !audioPlayerRef.current) return;
      
      if (isPlaying) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.src = audioURL;
        audioPlayerRef.current.play().catch(err => {
          console.error("Playback error:", err);
          setError("Playback failed");
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useImperativeHandle(ref, () => ({
      getAudioBlob: () => audioBlob,
      startRecording,
      stopRecording,
    }));

    return (
      <div className="flex items-center gap-2">
        {error && <div className="text-red-500 text-xs">{error}</div>}
        
        {status === 'preparing' ? (
          <Button variant="outline" size="sm" className="h-8 bg-yellow-500 hover:bg-yellow-600 border-none text-white" disabled>
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            <span className="text-xs">Preparing microphone...</span>
          </Button>
        ) : status === 'recording' ? (
          <Button onClick={() => stopRecording()} variant="outline" size="sm" className="h-8 bg-red-500 hover:bg-red-600 border-none text-white">
            <Square className="h-3 w-3 mr-1" />
            <span className="text-xs">{formatTime(recordingTime)}</span>
          </Button>
        ) : (
          <Button onClick={startRecording} variant="outline" size="sm" className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none text-white" disabled={isPlaying}>
            <Mic className="h-3 w-3 mr-1" />
            <span className="text-xs">Reply with Voice</span>
          </Button>
        )}
        
        {showAudio && audioURL && (status === 'idle' || status === 'recorded') && (
          <Button onClick={togglePlayback} variant="outline" size="sm" className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none text-white">
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
  }
);

VoiceRecorder.displayName = "VoiceRecorder";
export default VoiceRecorder;