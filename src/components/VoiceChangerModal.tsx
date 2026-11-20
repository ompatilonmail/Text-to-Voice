import React, { useState, useRef, useEffect } from "react";
import { VoiceInfo } from "../types";
import {
  Mic,
  Square,
  Upload,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
  FileAudio,
  UserCheck,
  Radio,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { base64ToBlobUrl, formatTime } from "../utils/audioUtils";

interface VoiceChangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVoices: VoiceInfo[];
  onUseTranscriptionInStudio?: (text: string, voiceId: string) => void;
}

export const VoiceChangerModal: React.FC<VoiceChangerModalProps> = ({
  isOpen,
  onClose,
  availableVoices,
  onUseTranscriptionInStudio,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [inputAudioBlobUrl, setInputAudioBlobUrl] = useState<string | null>(null);
  const [inputAudioBase64, setInputAudioBase64] = useState<string | null>(null);
  const [selectedTargetVoiceId, setSelectedTargetVoiceId] = useState<string>("Charon");
  const [isProcessing, setIsProcessing] = useState(false);

  // Result state
  const [transcription, setTranscription] = useState<string>("");
  const [detectedIntonation, setDetectedIntonation] = useState<string>("");
  const [outputAudioBlobUrl, setOutputAudioBlobUrl] = useState<string | null>(null);
  const [outputAudioBase64, setOutputAudioBase64] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Audio Playback
  const [playingOriginal, setPlayingOriginal] = useState(false);
  const [playingOverlay, setPlayingOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const overlayAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (originalAudioRef.current) originalAudioRef.current.pause();
      if (overlayAudioRef.current) overlayAudioRef.current.pause();
    };
  }, []);

  if (!isOpen) return null;

  // Load benchmark dramatic take for instant demonstration
  const handleLoadSampleTake = () => {
    setErrorMessage(null);
    setInputAudioBase64("DEMO_SAMPLE_BASE64");
    setInputAudioBlobUrl("sample");
    setTranscription("I can't believe we actually made it out alive... [sigh] look at that dawn on the horizon.");
    setDetectedIntonation("Breathless, relieved dramatic delivery with an audible sigh pause and quiet wonder at the finish.");
  };

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const blobUrl = URL.createObjectURL(audioBlob);
        setInputAudioBlobUrl(blobUrl);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(",")[1];
          setInputAudioBase64(base64Data);
        };
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error", err);
      setErrorMessage("Microphone permission was denied or unavailable. You can also upload an audio file instead.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setInputAudioBlobUrl(blobUrl);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(",")[1];
      setInputAudioBase64(base64Data);
    };
  };

  const handleProcessVoiceChanger = async () => {
    if (!inputAudioBase64) {
      setErrorMessage("Please record or upload an acting performance first.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const targetVoice = availableVoices.find((v) => v.id === selectedTargetVoiceId);

      const response = await fetch("/api/voice-changer/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: inputAudioBase64,
          mimeType: "audio/webm",
          targetVoiceId: selectedTargetVoiceId,
          targetVoiceName: targetVoice?.name || selectedTargetVoiceId,
          baseModelVoice: targetVoice?.baseModelVoice || targetVoice?.id || "Charon",
          customPromptDirective: targetVoice?.naturalPromptGuide,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to process voice changer overlay");
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setDetectedIntonation(data.detectedIntonation);
      setOutputAudioBase64(data.outputAudioBase64);
      setDuration(data.duration);

      const blobUrl = base64ToBlobUrl(data.outputAudioBase64, "audio/wav");
      setOutputAudioBlobUrl(blobUrl);

      // Play the generated overlay take
      const audio = new Audio(blobUrl);
      overlayAudioRef.current = audio;
      audio.onended = () => setPlayingOverlay(false);
      audio.play();
      setPlayingOverlay(true);
    } catch (err) {
      console.error("Voice changer error:", err);
      const msg = err instanceof Error ? err.message : "Failed to process voice changer overlay. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayOriginal = () => {
    if (!inputAudioBlobUrl) return;
    if (playingOriginal && originalAudioRef.current) {
      originalAudioRef.current.pause();
      setPlayingOriginal(false);
      return;
    }
    if (overlayAudioRef.current) {
      overlayAudioRef.current.pause();
      setPlayingOverlay(false);
    }
    const audio = new Audio(inputAudioBlobUrl);
    originalAudioRef.current = audio;
    audio.onended = () => setPlayingOriginal(false);
    audio.play();
    setPlayingOriginal(true);
  };

  const togglePlayOverlay = () => {
    if (!outputAudioBlobUrl) return;
    if (playingOverlay && overlayAudioRef.current) {
      overlayAudioRef.current.pause();
      setPlayingOverlay(false);
      return;
    }
    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      setPlayingOriginal(false);
    }
    const audio = new Audio(outputAudioBlobUrl);
    overlayAudioRef.current = audio;
    audio.onended = () => setPlayingOverlay(false);
    audio.play();
    setPlayingOverlay(true);
  };

  const handleDownloadWav = () => {
    if (!outputAudioBlobUrl) return;
    const a = document.createElement("a");
    a.href = outputAudioBlobUrl;
    a.download = `voice_overlay_${selectedTargetVoiceId.toLowerCase()}_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                <span>Voice Changer Overlays (Performance Transfer)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono">
                  Intonation Capture
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Record your acting performance and intonation while letting the AI swap the vocal identity entirely.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-200">
          {/* Error Notice Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-semibold block text-rose-200">Voice Overlay Notice</span>
                  <p className="text-rose-300/90 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-200 p-1 rounded-md hover:bg-rose-500/20 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Input Performance Recording */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-[10px] font-mono">
                  1
                </span>
                <span>Capture Actor Performance</span>
              </h3>

              <button
                type="button"
                onClick={handleLoadSampleTake}
                className="text-xs px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Sample Performance</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950/70 border border-stone-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex items-center space-x-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-900/30"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Actor's Voice</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 border border-rose-500/40 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer animate-pulse"
                  >
                    <Square className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Stop Recording ({formatTime(recordSeconds)})</span>
                  </button>
                )}

                <span className="text-xs text-stone-600 font-semibold">OR</span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-stone-400" />
                  <span>Upload Performance Audio</span>
                </button>
              </div>

              {inputAudioBlobUrl && (
                <div className="flex items-center space-x-3 pt-2 text-xs text-stone-300">
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Performance Audio Loaded
                  </span>
                  {inputAudioBlobUrl !== "sample" && (
                    <button
                      type="button"
                      onClick={togglePlayOriginal}
                      className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {playingOriginal ? (
                        <Pause className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Play className="w-3 h-3 text-amber-400" />
                      )}
                      <span>Listen to Input</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Target Voice Model Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-[10px] font-mono">
                2
              </span>
              <span>Select Target Voice Model for Vocal Identity Swap</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableVoices.slice(0, 8).map((v) => {
                const isSelected = selectedTargetVoiceId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedTargetVoiceId(v.id)}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-rose-500/10 border-rose-500/50 shadow-md shadow-rose-950/30"
                        : "bg-stone-950 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-stone-200">{v.name}</span>
                      <span className="text-[10px] text-stone-500 uppercase">{v.gender}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-1">{v.tone}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Overlay Results Side-by-Side */}
          {outputAudioBlobUrl && (
            <div className="space-y-3 p-4 rounded-2xl bg-stone-950/90 border border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Performance Transfer Complete</span>
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {duration}s Duration
                </span>
              </div>

              {/* Performance Analysis Breakdown */}
              <div className="space-y-2 p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-xs">
                <div>
                  <span className="text-stone-400 font-semibold block text-[11px] uppercase tracking-wider">
                    Transcribed Performance Script:
                  </span>
                  <p className="text-stone-200 italic font-serif text-sm mt-0.5 leading-relaxed">
                    "{transcription}"
                  </p>
                </div>
                {detectedIntonation && (
                  <div className="pt-2 border-t border-stone-800/60">
                    <span className="text-amber-400 font-semibold block text-[10px] uppercase tracking-wider">
                      Detected Acting Nuance & Intonation:
                    </span>
                    <p className="text-stone-300 text-xs mt-0.5">{detectedIntonation}</p>
                  </div>
                )}
              </div>

              {/* Side-by-Side Audio Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Original Actor */}
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-400">Actor Performance (Original)</span>
                    <span className="text-[10px] text-stone-500">Source Track</span>
                  </div>
                  {inputAudioBlobUrl && inputAudioBlobUrl !== "sample" ? (
                    <button
                      type="button"
                      onClick={togglePlayOriginal}
                      className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {playingOriginal ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{playingOriginal ? "Pause Original" : "Play Original Track"}</span>
                    </button>
                  ) : (
                    <div className="text-xs text-stone-500 italic py-2 text-center">
                      Demo actor reference loaded
                    </div>
                  )}
                </div>

                {/* AI Swapped Output */}
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-300">
                      Target Vocal Identity: {selectedTargetVoiceId}
                    </span>
                    <span className="text-[10px] text-rose-400 font-mono">Swapped</span>
                  </div>
                  <button
                    type="button"
                    onClick={togglePlayOverlay}
                    className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-rose-950/40"
                  >
                    {playingOverlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{playingOverlay ? "Pause AI Performance" : "Play Voice Swapped Performance"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadWav}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download WAV Take</span>
                </button>

                {onUseTranscriptionInStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseTranscriptionInStudio(transcription, selectedTargetVoiceId);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Send Script to Main Studio</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/80">
          <div className="text-xs text-stone-400">
            {isProcessing ? (
              <span className="flex items-center gap-2 text-rose-400 animate-pulse">
                <Radio className="w-4 h-4 animate-spin" />
                <span>Transcribing acting cadence & swapping vocal identity...</span>
              </span>
            ) : (
              <span>Transfers exact acting performance, pauses, and cadence</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleProcessVoiceChanger}
              disabled={isProcessing || !inputAudioBase64}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Radio className="w-4 h-4" />
              <span>{isProcessing ? "Processing Overlay..." : "Swap Vocal Identity"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
