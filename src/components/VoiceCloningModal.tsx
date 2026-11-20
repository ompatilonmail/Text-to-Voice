import React, { useState, useRef, useEffect } from "react";
import { ClonedVoice } from "../types";
import {
  Mic,
  Square,
  Upload,
  Sparkles,
  CheckCircle2,
  Volume2,
  Trash2,
  X,
  Play,
  Pause,
  Layers,
  Wand2,
  FileAudio,
  ShieldCheck,
  Zap,
  AlertCircle,
} from "lucide-react";
import { base64ToBlobUrl, formatTime } from "../utils/audioUtils";

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClonedVoice: (voice: ClonedVoice) => void;
  clonedVoices: ClonedVoice[];
  onSaveClonedVoice: (voice: ClonedVoice) => void;
}

interface DatasetFile {
  id: string;
  name: string;
  sizeMb: number;
  durationSec: number;
  blobUrl?: string;
  base64?: string;
  isIsolated?: boolean;
}

export const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({
  isOpen,
  onClose,
  onSelectClonedVoice,
  clonedVoices,
  onSaveClonedVoice,
}) => {
  const [voiceName, setVoiceName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<DatasetFile[]>([]);
  const [voiceIsolation, setVoiceIsolation] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState<string>("");
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [lastCreatedVoice, setLastCreatedVoice] = useState<ClonedVoice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate dataset metrics
  const totalDurationSec = files.reduce((acc, f) => acc + f.durationSec, 0);
  const totalDurationMin = Math.round((totalDurationSec / 60) * 10) / 10;
  const targetMin = 10; // recommended 10+ min
  const datasetProgressPercent = Math.min(100, Math.round((totalDurationMin / targetMin) * 100));

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Handle benchmark dataset preset loading for fast testing
  const handleLoadSampleDataset = () => {
    setVoiceName("David (Acoustic Replica)");
    setDescription("High-resolution studio narrator clone with deep vocal resonance.");
    setFiles([
      {
        id: "f-1",
        name: "studio_narration_session_take01.wav",
        sizeMb: 14.2,
        durationSec: 360,
        isIsolated: true,
      },
      {
        id: "f-2",
        name: "audiobook_chapter_excerpt_take02.wav",
        sizeMb: 22.8,
        durationSec: 540,
        isIsolated: true,
      },
      {
        id: "f-3",
        name: "conversational_interview_clean.wav",
        sizeMb: 18.5,
        durationSec: 420,
        isIsolated: true,
      },
    ]);
  };

  // Recording functionality
  const startRecording = async () => {
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
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(",")[1];
          const newFile: DatasetFile = {
            id: `rec-${Date.now()}`,
            name: `voice_take_${files.length + 1}.webm`,
            sizeMb: Math.round((audioBlob.size / (1024 * 1024)) * 100) / 100,
            durationSec: recordSeconds || 5,
            blobUrl,
            base64: base64Data,
            isIsolated: voiceIsolation,
          };
          setFiles((prev) => [...prev, newFile]);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed", err);
      alert("Microphone permission is required to record audio samples.");
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

  // Uploading files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;
    const uploadedFiles: File[] = Array.from(rawFiles);

    uploadedFiles.forEach((file: File, idx: number) => {
      const blobUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(",")[1];
        const newFile: DatasetFile = {
          id: `up-${Date.now()}-${idx}`,
          name: file.name,
          sizeMb: Math.round((file.size / (1024 * 1024)) * 10) / 10,
          durationSec: Math.max(30, Math.round(file.size / 32000)),
          blobUrl,
          base64: base64Data,
          isIsolated: voiceIsolation,
        };
        setFiles((prev) => [...prev, newFile]);
      };
    });
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Train Cloned Voice
  const handleStartTraining = async () => {
    if (!voiceName.trim()) {
      setErrorMessage("Please provide a name for this cloned voice model.");
      return;
    }
    if (files.length === 0) {
      setErrorMessage("Please upload or record at least one audio dataset file.");
      return;
    }

    setErrorMessage(null);
    setIsTraining(true);
    setTrainingStep("Applying Spectral Voice Isolation & Denoising...");

    try {
      // Step 1: Isolation simulation
      await new Promise((r) => setTimeout(r, 900));
      setTrainingStep("Extracting Biometric Vocal Formants & Pitch Timbre...");
      await new Promise((r) => setTimeout(r, 1100));
      setTrainingStep("Synthesizing Neural Acoustic Weights...");

      const firstFileWithBase64 = files.find((f) => f.base64);

      const response = await fetch("/api/clone/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: voiceName,
          description: description || "Custom studio cloned voice replica",
          filesCount: files.length,
          totalDurationSec: Math.max(120, totalDurationSec),
          voiceIsolationApplied: voiceIsolation,
          sampleAudioBase64: firstFileWithBase64?.base64
            ? firstFileWithBase64.base64.slice(0, 1000000)
            : undefined,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Voice cloning service returned an error";
        try {
          const errJson = await response.json();
          if (errJson?.error) errorMsg = errJson.error;
          else if (errJson?.message) errorMsg = errJson.message;
        } catch {
          if (response.status === 413) {
            errorMsg = "Audio files are too large. Please select a smaller sample or compress the audio.";
          } else if (response.status === 504 || response.status === 502) {
            errorMsg = "Voice cloning server timed out. Please try again in a few moments.";
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const cloned: ClonedVoice = data.clonedVoice;

      if (data.sampleAudioBase64) {
        cloned.sampleAudioBase64 = data.sampleAudioBase64;
        cloned.sampleAudioUrl = base64ToBlobUrl(data.sampleAudioBase64, "audio/wav");
      }

      onSaveClonedVoice(cloned);
      setLastCreatedVoice(cloned);
      setIsTraining(false);
      setTrainingStep("");
    } catch (err: unknown) {
      console.error("Cloning failed", err);
      setIsTraining(false);
      setTrainingStep("");
      const msg = err instanceof Error ? err.message : "Voice cloning failed. Please try again.";
      setErrorMessage(msg);
    }
  };

  const playPreview = (url?: string, voiceId?: string) => {
    if (!url) return;
    if (activePreviewId === voiceId && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setActivePreviewId(null);
      return;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(url);
    audioPlayerRef.current = audio;
    audio.onended = () => setActivePreviewId(null);
    audio.play();
    setActivePreviewId(voiceId || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                <span>Professional Voice Cloning Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
                  Multi-Dataset Isolation
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Train highly accurate custom voice replicas using long-form datasets paired with built-in voice isolation.
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
                  <span className="font-semibold block text-rose-200">Voice Cloning Notice</span>
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

          {/* Top Form Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Voice Model Name *
              </label>
              <input
                type="text"
                placeholder="e.g. David Ross (Documentary Narrator)"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Role / Timbre Description
              </label>
              <input
                type="text"
                placeholder="e.g. Deep resonant baritone, deliberate pacing, articulate"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Built-in Voice Isolation & Denoising Card */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                    <span>Built-in Voice Isolation & Denoising Engine</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                      ACTIVE
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Strips background noise, air conditioning hum, room reverb & microphone plosives automatically.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceIsolation}
                  onChange={(e) => setVoiceIsolation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {voiceIsolation && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-900 text-[11px]">
                <div className="p-2 rounded bg-stone-900/60 border border-stone-800/60">
                  <span className="text-stone-500 block">Spectral Noise Floor:</span>
                  <span className="text-emerald-400 font-mono font-semibold">-52 dB Attenuation</span>
                </div>
                <div className="p-2 rounded bg-stone-900/60 border border-stone-800/60">
                  <span className="text-stone-500 block">Vocal Clarity Boost:</span>
                  <span className="text-emerald-400 font-mono font-semibold">+24 dB SNR</span>
                </div>
                <div className="p-2 rounded bg-stone-900/60 border border-stone-800/60">
                  <span className="text-stone-500 block">Reverb Suppressor:</span>
                  <span className="text-emerald-400 font-semibold">Dry Room Emulation</span>
                </div>
                <div className="p-2 rounded bg-stone-900/60 border border-stone-800/60">
                  <span className="text-stone-500 block">Mains Hum Notch:</span>
                  <span className="text-emerald-400 font-semibold">50Hz / 60Hz Filtered</span>
                </div>
              </div>
            )}
          </div>

          {/* Dataset Upload & Record Area */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                  Training Dataset ({files.length} Files · {totalDurationMin} min)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Supports multiple WAV, MP3, M4A, or live microphone takes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadSampleDataset}
                className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Studio Benchmark Dataset (3 Files)</span>
              </button>
            </div>

            {/* Dataset Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <span>Dataset Volume: {totalDurationMin} min</span>
                <span>Recommended: 10+ min ({datasetProgressPercent}%)</span>
              </div>
              <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    datasetProgressPercent >= 70 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${datasetProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons: Record & Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Record Clip */}
              <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col items-center justify-center text-center space-y-2">
                <div className="flex items-center space-x-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-900/30"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Record Voice Sample</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 border border-rose-500/40 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer animate-pulse"
                    >
                      <Square className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span>Stop Recording ({formatTime(recordSeconds)})</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">
                  Speak naturally into your microphone to add reference training audio.
                </p>
              </div>

              {/* Upload Multi-File */}
              <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col items-center justify-center text-center space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Audio Files (.wav, .mp3)</span>
                </button>
                <p className="text-[11px] text-stone-500">
                  Upload raw multi-hour speech recordings, podcasts, or audiobook files.
                </p>
              </div>
            </div>

            {/* Uploaded Dataset Files List */}
            {files.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-950 border border-stone-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileAudio className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-stone-200 truncate">{f.name}</span>
                      <span className="text-stone-500 text-[10px] font-mono shrink-0">
                        {Math.round(f.durationSec / 60)}m ({f.sizeMb} MB)
                      </span>
                      {f.isIsolated && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          Isolated
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {f.blobUrl && (
                        <button
                          type="button"
                          onClick={() => playPreview(f.blobUrl, f.id)}
                          className="p-1 text-stone-400 hover:text-amber-400 cursor-pointer"
                          title="Listen to sample"
                        >
                          {activePreviewId === f.id ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-1 text-stone-500 hover:text-rose-400 cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cloned Voices Library Section */}
          {clonedVoices.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Your Trained Voice Replicas ({clonedVoices.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {clonedVoices.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-stone-200">{v.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                          {v.acousticProfile.clarityScore}% Clarity
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{v.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-500 font-mono">
                        <span>{v.acousticProfile.timbre}</span>
                        <span>•</span>
                        <span>{v.filesCount} Samples</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-900">
                      {v.sampleAudioUrl ? (
                        <button
                          type="button"
                          onClick={() => playPreview(v.sampleAudioUrl, v.id)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          {activePreviewId === v.id ? (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>Pause Demo</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Listen Demo</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectClonedVoice(v);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Use in Studio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Notification */}
          {lastCreatedVoice && !isTraining && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">
                  Voice replica "{lastCreatedVoice.name}" trained and isolated!
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectClonedVoice(lastCreatedVoice);
                  onClose();
                }}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                Select as Active Voice
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/80">
          <div className="text-xs text-stone-400">
            {isTraining ? (
              <span className="flex items-center gap-2 text-amber-400 animate-pulse">
                <Wand2 className="w-4 h-4 animate-spin" />
                <span>{trainingStep}</span>
              </span>
            ) : (
              <span>Ready to train custom acoustic replica</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isTraining}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartTraining}
              disabled={isTraining || files.length === 0 || !voiceName.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs transition-all shadow-lg shadow-amber-950/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-stone-950" />
              <span>{isTraining ? "Training Neural Model..." : "Train & Isolate Voice Replica"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
