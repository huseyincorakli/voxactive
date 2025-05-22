"use client";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
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

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(
  ({ onRecordingComplete, showAudio = true }, ref) => {
    const [status, setStatus] = useState<
      "idle" | "preparing" | "recording" | "recorded"
    >("idle");
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [microphoneReady, setMicrophoneReady] = useState(false);

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize audio player and prepare microphone
    useEffect(() => {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.addEventListener("ended", () =>
        setIsPlaying(false)
      );

      // Initialize microphone on component mount
      initializeMicrophone();

      return () => {
        cleanupAllResources();
      };
    }, []);

    // Initialize microphone once and keep it ready
    const initializeMicrophone = async () => {
      try {
        setError(null);

        // Clean any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });

        streamRef.current = stream;
        setMicrophoneReady(true);

        // Setup MediaRecorder with the stream
        setupMediaRecorder(stream);
      } catch (err) {
        console.error("Microphone initialization error:", err);
        setError(
          "Could not access microphone. Please check browser permissions."
        );
        setMicrophoneReady(false);
      }
    };

    // Setup MediaRecorder with existing stream
    const setupMediaRecorder = (stream: MediaStream) => {
      try {
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
          audioBitsPerSecond: 128000,
        });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (audioChunksRef.current.length === 0) {
            setError("Recording failed. Please try again.");
            setStatus("idle");
            return;
          }

          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

          // Clean up previous audio URL
          if (audioURL) {
            URL.revokeObjectURL(audioURL);
          }

          const newAudioURL = URL.createObjectURL(blob);
          setAudioURL(newAudioURL);
          setAudioBlob(blob);
          setStatus("recorded");
          onRecordingComplete?.(blob);

          // Reset audio chunks for next recording
          audioChunksRef.current = [];
        };

        recorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setError("Recording error occurred");
          setStatus("idle");
        };

        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error("MediaRecorder setup error:", err);
        setError("Failed to setup recording");
      }
    };

    // Start recording with optimized flow
    const startRecording = async () => {
      try {
        setError(null);

        // If microphone not ready, try to initialize
        if (!microphoneReady || !streamRef.current) {
          setStatus("preparing");
          await initializeMicrophone();

          if (!microphoneReady || !streamRef.current) {
            setError("Microphone not available");
            setStatus("idle");
            return;
          }
        }

        // If MediaRecorder not ready or inactive, recreate it
        if (
          !mediaRecorderRef.current ||
          mediaRecorderRef.current.state === "inactive"
        ) {
          setupMediaRecorder(streamRef.current);
        }

        if (!mediaRecorderRef.current) {
          setError("Recording setup failed");
          setStatus("idle");
          return;
        }

        // Clear previous recording data
        audioChunksRef.current = [];
        setRecordingTime(0);

        // Clear any pending cleanup
        if (cleanupTimeoutRef.current) {
          clearTimeout(cleanupTimeoutRef.current);
          cleanupTimeoutRef.current = null;
        }

        // Start recording
        mediaRecorderRef.current.start(100); // Collect data every 100ms
        setStatus("recording");

        // Start timer
        timerRef.current = setInterval(
          () => setRecordingTime((prev) => prev + 1),
          1000
        );
      } catch (err) {
        console.error("Start recording error:", err);
        setError("Failed to start recording");
        setStatus("idle");
      }
    };

    // Stop recording with optimized cleanup
    const stopRecording = (cancel = false) => {
      try {
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          if (cancel) {
            // Cancel recording - don't process data
            mediaRecorderRef.current.ondataavailable = null;
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
            audioChunksRef.current = [];
            setStatus("idle");
          } else {
            // Normal stop - process recording
            mediaRecorderRef.current.stop();
          }
        } else {
          setStatus("idle");
        }

        setRecordingTime(0);

        // Schedule microphone cleanup after a delay to avoid frequent re-initialization
        if (!cancel) {
          cleanupTimeoutRef.current = setTimeout(() => {
            // Only cleanup if not recording again
            if (status !== "recording" && status !== "preparing") {
              cleanupMicrophoneStream();
            }
          }, 5000); // 5 second delay
        }
      } catch (err) {
        console.error("Stop recording error:", err);
        setError("Error stopping recording");
        setStatus("idle");
      }
    };

    // Cleanup microphone stream (delayed)
    const cleanupMicrophoneStream = () => {
      if (
        streamRef.current &&
        status !== "recording" &&
        status !== "preparing"
      ) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setMicrophoneReady(false);
        mediaRecorderRef.current = null;
      }
    };

    // Complete cleanup on unmount
    const cleanupAllResources = () => {
      // Clear timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);

      // Stop audio playback
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
        audioPlayerRef.current.removeEventListener("ended", () =>
          setIsPlaying(false)
        );
      }

      // Clean up audio URL
      if (audioURL) URL.revokeObjectURL(audioURL);

      // Stop microphone stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Stop media recorder
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
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
        audioPlayerRef.current.play().catch((err) => {
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
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    };

    useImperativeHandle(ref, () => ({
      getAudioBlob: () => audioBlob,
      startRecording,
      stopRecording,
    }));

    return (
      <div className="flex items-center gap-2">
        {error && <div className="text-red-500 text-xs">{error}</div>}

        {status === "preparing" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-yellow-500 hover:bg-yellow-600 border-none text-white"
            disabled
          >
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            <span className="text-xs">Preparing...</span>
          </Button>
        ) : status === "recording" ? (
          <Button
            onClick={() => stopRecording()}
            variant="outline"
            size="sm"
            className="h-8 bg-red-500 hover:bg-red-600 border-none text-white animate-pulse"
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
            <span className="text-xs">
              {microphoneReady ? "Reply with Voice" : "Enable Microphone"}
            </span>
          </Button>
        )}

        {showAudio &&
          audioURL &&
          (status === "idle" || status === "recorded") && (
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
  }
);

VoiceRecorder.displayName = "VoiceRecorder";
export default VoiceRecorder;
