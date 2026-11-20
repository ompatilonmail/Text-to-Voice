import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  Sliders,
  Play,
  Download,
  RotateCcw,
  Clock,
  Wand2,
  HelpCircle,
  FileAudio,
  Layers,
  CheckCircle2,
  AlertCircle,
  Users,
  Radio,
  Cpu,
  Flame,
  Activity,
  ShieldCheck,
  X,
} from "lucide-react";
import { VoiceSelector } from "./components/VoiceSelector";
import { AudioWaveformPlayer } from "./components/AudioWaveformPlayer";
import { TakesHistory } from "./components/TakesHistory";
import { PresetScriptPicker } from "./components/PresetScriptPicker";
import { MultiSpeakerEditor } from "./components/MultiSpeakerEditor";
import { SSMLTagToolbar } from "./components/SSMLTagToolbar";
import { VoiceCalibrationPanel } from "./components/VoiceCalibrationPanel";
import { VoiceCloningModal } from "./components/VoiceCloningModal";
import { VoiceDesignerModal } from "./components/VoiceDesignerModal";
import { VoiceChangerModal } from "./components/VoiceChangerModal";
import {
  VoiceInfo,
  EmotionOption,
  SampleScript,
  AudioTake,
  MultiSpeakerLine,
  ClonedVoice,
  SyntheticVoiceDesign,
  VoiceCalibrationSettings,
} from "./types";
import { base64ToBlobUrl, calculateReadingTime } from "./utils/audioUtils";

const DEFAULT_TEXT =
  "Welcome to the next generation of voice synthesis. With Google Gemini neural audio models, written content transforms seamlessly into expressive, natural-sounding voiceovers tailored with human cadence, emotion, and crystal-clear articulation.";

export default function App() {
  const [voices, setVoices] = useState<VoiceInfo[]>([
    {
      id: "Kore",
      name: "Kore",
      gender: "Female",
      tone: "Clear, smooth, articulate & calm",
      bestFor: "Explainers, tutorials, audiobooks, e-learning",
      color: "amber",
      language: "en",
    },
    {
      id: "Puck",
      name: "Puck",
      gender: "Male",
      tone: "Warm, engaging, conversational & approachable",
      bestFor: "Podcasts, product demos, friendly narration",
      color: "blue",
      language: "en",
    },
    {
      id: "Fenrir",
      name: "Fenrir",
      gender: "Male",
      tone: "Deep, bold, energetic & charismatic",
      bestFor: "Commercials, trailers, motivation, sports",
      color: "emerald",
      language: "en",
    },
    {
      id: "Charon",
      name: "Charon",
      gender: "Male",
      tone: "Authoritative, resonant, cinematic & deep",
      bestFor: "Documentaries, investigative, drama",
      color: "purple",
      language: "en",
    },
    {
      id: "Zephyr",
      name: "Zephyr",
      gender: "Neutral / Soft",
      tone: "Gentle, soothing, rhythmic & balanced",
      bestFor: "Meditation, mindfulness, sleep stories",
      color: "rose",
      language: "en",
    },
    {
      id: "Aanya",
      name: "Aanya (आन्या)",
      nativeName: "आन्या",
      gender: "Female",
      tone: "प्राकृतिक, स्पष्ट, मधुर और आत्मीय (Warm, Natural & Eloquent)",
      bestFor: "कहानी वाचन, पॉडकास्ट, ई-लर्निंग, यूट्यूब",
      color: "rose",
      language: "hi",
      accent: "Modern Conversational Hindi",
    },
    {
      id: "Kabir",
      name: "Kabir (कबीर)",
      nativeName: "कबीर",
      gender: "Male",
      tone: "गंभीर, आत्मविश्वासी, दोस्ताना और प्रभावशाली (Warm Baritone)",
      bestFor: "पॉडकास्ट, विज्ञापन, बिजनेस, वृत्तचित्र",
      color: "amber",
      language: "hi",
      accent: "Urban Hindi / Hindustani",
    },
    {
      id: "Dev",
      name: "Dev (देव)",
      nativeName: "देव",
      gender: "Male",
      tone: "गहरा, प्रभावशाली, जोशीला और सिनेमाई (Deep & Cinematic)",
      bestFor: "प्रेरणादायक भाषण, सिनेमाई प्रोमो, खेल",
      color: "emerald",
      language: "hi",
      accent: "Dramatic Hindi",
    },
    {
      id: "Priya",
      name: "Priya (प्रिया)",
      nativeName: "प्रिया",
      gender: "Female",
      tone: "शांत, कोमल, ध्यानमग्न और सुकून देने वाला (Gentle & Meditative)",
      bestFor: "ध्यान (Meditation), नींद की कहानियां, वेलनेस",
      color: "teal",
      language: "hi",
      accent: "Soft Meditative Hindi",
    },
    {
      id: "Samar",
      name: "Samar (समर)",
      nativeName: "समर",
      gender: "Male",
      tone: "गंभीर, विद्वत्तापूर्ण, आधिकारिक और शांत (Scholarly & Dignified)",
      bestFor: "समाचार, वृत्तचित्र, ज्ञानवर्धक व्याख्यान",
      color: "purple",
      language: "hi",
      accent: "Refined Classic Hindi",
    },
  ]);

  const [emotions, setEmotions] = useState<EmotionOption[]>([
    { id: "natural", label: "Natural Conversational (सहज)", directive: "Speak naturally and casually." },
    { id: "cheerful", label: "Cheerful & Warm (मधुर)", directive: "Speak cheerfully with smiling warmth." },
    { id: "storyteller", label: "Storyteller & Emotional (कथावाचक)", directive: "Speak like an expressive storyteller." },
    { id: "calm", label: "Calm & Meditative (शांत)", directive: "Speak soothingly and quietly." },
    { id: "dramatic", label: "Dramatic & Cinematic (गंभीर)", directive: "Speak with cinematic gravity and tension." },
    { id: "professional", label: "Professional (आधिकारिक)", directive: "Speak with corporate polish and clarity." },
    { id: "energetic", label: "High Energy (जोशीला)", directive: "Speak with vibrant dynamic enthusiasm." },
  ]);

  const [sampleScripts, setSampleScripts] = useState<SampleScript[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("Kore");
  const [selectedEmotionId, setSelectedEmotionId] = useState<string>("natural");
  const [selectedPace, setSelectedPace] = useState<string>("normal");
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [scriptText, setScriptText] = useState<string>(DEFAULT_TEXT);
  const [multiSpeakerLines, setMultiSpeakerLines] = useState<MultiSpeakerLine[]>([
    {
      id: "line-1",
      speaker: "Alex",
      voice: "Puck",
      text: "Welcome back to the podcast. Today we are looking at how artificial intelligence is transforming audio production.",
    },
    {
      id: "line-2",
      speaker: "Taylor",
      voice: "Kore",
      text: "It is incredible, Alex. What used to take hours in a recording booth can now be generated with astonishing emotion and cadence in seconds.",
    },
  ]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentTake, setCurrentTake] = useState<AudioTake | null>(null);
  const [takesArchive, setTakesArchive] = useState<AudioTake[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Advanced Voice Features State
  const [calibrationSettings, setCalibrationSettings] = useState<VoiceCalibrationSettings>({
    styleExaggeration: 100,
    stability: 75,
    similarityClarity: 80,
  });

  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [syntheticVoices, setSyntheticVoices] = useState<SyntheticVoiceDesign[]>([]);

  // Active custom speaker override (if using a trained clone or synthetic model)
  const [activeCustomVoice, setActiveCustomVoice] = useState<{
    id: string;
    name: string;
    type: "cloned" | "synthetic";
    promptDirective?: string;
    baseModelVoice?: string;
  } | null>(null);

  // Modals visibility
  const [isCloningModalOpen, setIsCloningModalOpen] = useState(false);
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
  const [isChangerModalOpen, setIsChangerModalOpen] = useState(false);

  // Load voices & presets on mount
  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => {
        if (data.voices) setVoices(data.voices);
        if (data.emotions) setEmotions(data.emotions);
        if (data.sampleScripts) setSampleScripts(data.sampleScripts);
      })
      .catch((err) => {
        console.warn("Could not load dynamic voices catalog, using defaults", err);
      });
  }, []);

  const stats = calculateReadingTime(
    mode === "single"
      ? scriptText
      : multiSpeakerLines.map((l) => l.text).join(" ")
  );

  // Insert cue tag into text at current cursor position
  const handleInsertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setScriptText((prev) => prev + " " + tag);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = scriptText;
    const updated = current.substring(0, start) + tag + current.substring(end);
    setScriptText(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // AI Script Polish
  const handlePolishScript = async () => {
    if (!scriptText.trim()) return;
    setIsPolishing(true);
    setErrorMessage(null);
    setStatusMessage("Refining phrasing for natural vocal cadence...");

    try {
      const res = await fetch("/api/tts/polish-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText,
          targetTone: selectedEmotionId,
          purpose: "voiceover",
        }),
      });

      const data = await res.json();
      if (data.polishedScript) {
        setScriptText(data.polishedScript);
        setStatusMessage("Script polished for voiceover delivery!");
      } else {
        throw new Error(data.error || "Could not polish script");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to polish script";
      setErrorMessage(msg);
    } finally {
      setIsPolishing(false);
      setTimeout(() => setStatusMessage(""), 3500);
    }
  };

  // Custom Voice Selection & Handlers
  const handleSelectClonedVoice = (voice: ClonedVoice) => {
    setActiveCustomVoice({
      id: voice.id,
      name: `${voice.name} (Cloned Replica)`,
      type: "cloned",
      promptDirective: voice.customPromptDirective,
      baseModelVoice: voice.baseModelVoice,
    });
    setStatusMessage(`Active voice set to Cloned Replica: "${voice.name}"`);
  };

  const handleSelectSyntheticVoice = (voice: SyntheticVoiceDesign) => {
    setActiveCustomVoice({
      id: voice.id,
      name: `${voice.name} (Custom Synthetic)`,
      type: "synthetic",
      promptDirective: voice.promptDescription,
      baseModelVoice: voice.baseModelVoice,
    });
    setStatusMessage(`Active voice set to Synthetic Design: "${voice.name}"`);
  };

  const handleResetCustomVoice = () => {
    setActiveCustomVoice(null);
    setStatusMessage("Reverted to standard studio voice model.");
  };

  const handleLoadTaggedDemo = () => {
    setMode("single");
    setScriptText(
      "The night was unnervingly silent. [whisper] Don't make a sound, they might still be lurking in the corridor. [gasp] Did you see that shadow move? [pause: 1.5s] [sigh] Never mind, it was just the wind. [excited] Look over there! The extraction team is finally here!"
    );
    setSelectedEmotionId("storyteller");
    setSelectedVoiceId("Charon");
  };

  // Generate Voiceover
  const handleGenerateVoiceover = async () => {
    const content =
      mode === "single"
        ? scriptText.trim()
        : multiSpeakerLines.map((l) => l.text.trim()).join(" ");

    if (!content) {
      setErrorMessage("Please enter text before generating audio.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage("Synthesizing neural speech with Gemini TTS (24kHz)...");

    try {
      const payload =
        mode === "single"
          ? {
              text: scriptText,
              voice: selectedVoiceId,
              emotion: selectedEmotionId,
              pace: selectedPace,
              mode: "single",
              styleExaggeration: calibrationSettings.styleExaggeration,
              stability: calibrationSettings.stability,
              similarityClarity: calibrationSettings.similarityClarity,
              customPromptDirective: activeCustomVoice?.promptDirective,
              baseModelVoiceOverride: activeCustomVoice?.baseModelVoice,
            }
          : {
              mode: "multi",
              multiSpeakerLines: multiSpeakerLines,
              styleExaggeration: calibrationSettings.styleExaggeration,
              stability: calibrationSettings.stability,
              similarityClarity: calibrationSettings.similarityClarity,
            };

      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || "Failed to generate voiceover");
      }

      const blobUrl = base64ToBlobUrl(data.audioBase64, "audio/wav");
      const voiceInfo = voices.find((v) => v.id === selectedVoiceId);
      const voiceName =
        mode === "multi"
          ? "Multi-Speaker"
          : activeCustomVoice
          ? activeCustomVoice.name
          : voiceInfo?.name || selectedVoiceId;
      const emotionName = emotions.find((e) => e.id === selectedEmotionId)?.label || selectedEmotionId;

      const newTake: AudioTake = {
        id: "take-" + Date.now(),
        timestamp: Date.now(),
        text: mode === "single" ? scriptText : multiSpeakerLines.map((l) => `${l.speaker}: ${l.text}`).join(" | "),
        voice: voiceName,
        emotion: emotionName,
        mode: mode,
        duration: data.duration || stats.estSeconds,
        audioBlobUrl: blobUrl,
        audioBase64: data.audioBase64,
        mimeType: "audio/wav",
        fileName: `voiceover-${voiceName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.wav`,
      };

      setCurrentTake(newTake);
      setTakesArchive((prev) => [newTake, ...prev]);
      setStatusMessage("Voiceover generated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating voiceover";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const handleSelectPreset = (sample: SampleScript) => {
    setMode("single");
    setScriptText(sample.text);
    if (sample.voice) setSelectedVoiceId(sample.voice);
    if (sample.emotion) setSelectedEmotionId(sample.emotion);
  };

  const handleSelectTake = (take: AudioTake) => {
    setCurrentTake(take);
    if (take.mode === "single") {
      setMode("single");
      setScriptText(take.text);
    }
  };

  const handleDeleteTake = (id: string) => {
    setTakesArchive((prev) => prev.filter((t) => t.id !== id));
    if (currentTake?.id === id) {
      setCurrentTake(null);
    }
  };

  return (
    <div id="tts-generator-app" className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Studio Header */}
      <header className="border-b border-stone-800/80 bg-stone-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-md">
              <Mic className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-100 flex items-center gap-2">
                AI Text to Speech Generator
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Gemini Neural TTS
                </span>
              </h1>
              <p className="text-xs text-stone-400">
                Natural-sounding studio voiceovers from written content
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Advanced Studios Launchers */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsCloningModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Train voice clones with multi-dataset audio & built-in isolation"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Voice Cloning</span>
                {clonedVoices.length > 0 && (
                  <span className="text-[10px] px-1 rounded-full bg-amber-500/30 font-mono">
                    {clonedVoices.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsDesignerModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Synthesize unique voices from descriptive text prompts"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Voice Designer</span>
                {syntheticVoices.length > 0 && (
                  <span className="text-[10px] px-1 rounded-full bg-purple-500/30 font-mono">
                    {syntheticVoices.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsChangerModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Record acting performance & swap vocal identity entirely"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Voice Changer</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center space-x-2 text-xs text-stone-400 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Studio Engine: 24kHz PCM</span>
            </div>

            {takesArchive.length > 0 && (
              <span className="text-xs text-stone-400 font-mono px-2.5 py-1 rounded-md bg-stone-800">
                {takesArchive.length} {takesArchive.length === 1 ? "Take" : "Takes"}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Workstation */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Curated Presets Bar */}
        {sampleScripts.length > 0 && (
          <PresetScriptPicker
            samples={sampleScripts}
            onSelectSample={handleSelectPreset}
            disabled={isGenerating || isPolishing}
          />
        )}

        {/* Master Active Player (when take is available) */}
        {currentTake && (
          <AudioWaveformPlayer
            audioBlobUrl={currentTake.audioBlobUrl}
            voiceName={currentTake.voice}
            emotion={currentTake.emotion}
            textSnippet={currentTake.text}
            durationSec={currentTake.duration}
            fileName={currentTake.fileName}
            autoPlay={true}
          />
        )}

        {/* Studio Control Deck */}
        <div className="grid grid-cols-1 gap-6">
          {/* Active Custom Voice Banner */}
          {activeCustomVoice && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-stone-900 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  {activeCustomVoice.type === "cloned" ? (
                    <Layers className="w-4 h-4" />
                  ) : (
                    <Cpu className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      Active Model: {activeCustomVoice.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                      {activeCustomVoice.type === "cloned" ? "Custom Voice Clone" : "Synthetic Model"}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate max-w-xl">
                    {activeCustomVoice.promptDirective || "Trained neural acoustic profile applied"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetCustomVoice}
                className="px-2.5 py-1 text-xs rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Revert to Stock Voice</span>
              </button>
            </div>
          )}

          {/* Voice Model Selection */}
          <div className="p-5 rounded-2xl bg-stone-900/50 border border-stone-800/80 shadow-sm space-y-4">
            <VoiceSelector
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={setSelectedVoiceId}
              disabled={isGenerating || isPolishing || mode === "multi"}
            />
          </div>

          {/* Dynamic Style Exaggeration & Acoustic Calibration */}
          <VoiceCalibrationPanel
            settings={calibrationSettings}
            onChange={setCalibrationSettings}
            disabled={isGenerating}
          />

          {/* Script & Voiceover Direction Deck */}
          <div className="p-5 rounded-2xl bg-stone-900/50 border border-stone-800/80 shadow-sm space-y-4">
            {/* Mode & Style Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
              {/* Mode Switcher */}
              <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
                <button
                  id="mode-single-btn"
                  type="button"
                  onClick={() => setMode("single")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === "single"
                      ? "bg-amber-500 text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Single Voiceover
                </button>
                <button
                  id="mode-multi-btn"
                  type="button"
                  onClick={() => setMode("multi")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === "multi"
                      ? "bg-amber-500 text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Dialogue Scene</span>
                </button>
              </div>

              {/* Delivery Emotion Selector (Single mode) */}
              {mode === "single" && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-stone-500 mr-1 font-medium">Delivery Tone:</span>
                  {emotions.map((emotion) => {
                    const isSelected = emotion.id === selectedEmotionId;
                    return (
                      <button
                        key={emotion.id}
                        id={`emotion-btn-${emotion.id}`}
                        type="button"
                        onClick={() => setSelectedEmotionId(emotion.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                            : "bg-stone-800/60 hover:bg-stone-800 text-stone-400 border border-transparent"
                        }`}
                      >
                        {emotion.label.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Editor Area */}
            {mode === "single" ? (
              <div className="space-y-3">
                {/* SSML and Directorial Audio Tags Toolbar */}
                <SSMLTagToolbar
                  onInsertTag={handleInsertTag}
                  onLoadTaggedSample={handleLoadTaggedDemo}
                  disabled={isGenerating || isPolishing}
                />

                {/* AI Polish Button */}
                <div className="flex justify-end">
                  <button
                    id="btn-polish-script"
                    type="button"
                    disabled={isPolishing || !scriptText.trim()}
                    onClick={handlePolishScript}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isPolishing ? "Polishing..." : "Polish Phrasing (AI)"}</span>
                  </button>
                </div>

                {/* Primary Script Text Area */}
                <textarea
                  id="script-input-textarea"
                  ref={textareaRef}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  rows={6}
                  placeholder="Paste or write your voiceover script here... Use inline tags like [whisper] or [excited] to shift delivery mid-sentence!"
                  className="w-full p-4 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-y text-sm sm:text-base leading-relaxed font-sans"
                />

                {/* Text Stats */}
                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <div className="flex items-center space-x-3">
                    <span>{stats.words} words</span>
                    <span>·</span>
                    <span>{stats.chars} characters</span>
                  </div>
                  <div className="flex items-center space-x-1 font-mono text-stone-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Est. Duration: ~{stats.estSeconds}s</span>
                  </div>
                </div>
              </div>
            ) : (
              <MultiSpeakerEditor
                lines={multiSpeakerLines}
                onChangeLines={setMultiSpeakerLines}
                voices={voices}
                disabled={isGenerating}
              />
            )}

            {/* Error or Status Feedback */}
            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {statusMessage && !errorMessage && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs animate-fadeIn">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-stone-500">
                Selected: <span className="text-stone-300 font-medium">{voices.find((v) => v.id === selectedVoiceId)?.name}</span> ({emotions.find((e) => e.id === selectedEmotionId)?.label})
              </div>

              <div className="flex items-center space-x-3">
                <button
                  id="btn-reset-script"
                  type="button"
                  onClick={() => setScriptText(DEFAULT_TEXT)}
                  className="px-3 py-2 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                >
                  Reset Sample
                </button>

                <button
                  id="btn-generate-voiceover"
                  type="button"
                  disabled={isGenerating || isPolishing}
                  onClick={handleGenerateVoiceover}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Voiceover...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Generate Voiceover</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Takes History / Archive */}
          <TakesHistory
            takes={takesArchive}
            activeTakeId={currentTake?.id}
            onSelectTake={handleSelectTake}
            onDeleteTake={handleDeleteTake}
            onClearAll={() => setTakesArchive([])}
          />
        </div>
      </main>

      {/* Professional Voice Cloning Modal */}
      <VoiceCloningModal
        isOpen={isCloningModalOpen}
        onClose={() => setIsCloningModalOpen(false)}
        onSelectClonedVoice={handleSelectClonedVoice}
        clonedVoices={clonedVoices}
        onSaveClonedVoice={(voice) => setClonedVoices((prev) => [voice, ...prev])}
      />

      {/* Text-Based Custom Voice Designer Modal */}
      <VoiceDesignerModal
        isOpen={isDesignerModalOpen}
        onClose={() => setIsDesignerModalOpen(false)}
        onSelectSyntheticVoice={handleSelectSyntheticVoice}
        savedSyntheticVoices={syntheticVoices}
        onSaveSyntheticVoice={(voice) => setSyntheticVoices((prev) => [voice, ...prev])}
      />

      {/* Voice Changer Overlays Modal */}
      <VoiceChangerModal
        isOpen={isChangerModalOpen}
        onClose={() => setIsChangerModalOpen(false)}
        availableVoices={voices}
        onUseTranscriptionInStudio={(text, voiceId) => {
          setMode("single");
          setScriptText(text);
          setSelectedVoiceId(voiceId);
          setStatusMessage("Loaded acting performance script and target voice into studio!");
        }}
      />
    </div>
  );
}
