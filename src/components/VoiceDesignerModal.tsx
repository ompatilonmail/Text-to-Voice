import React, { useState, useRef } from "react";
import { SyntheticVoiceDesign } from "../types";
import {
  Wand2,
  Sparkles,
  X,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Volume2,
  Cpu,
  User,
  Globe,
  Music,
  AlertCircle,
} from "lucide-react";
import { base64ToBlobUrl } from "../utils/audioUtils";

interface VoiceDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSyntheticVoice: (voice: SyntheticVoiceDesign) => void;
  savedSyntheticVoices: SyntheticVoiceDesign[];
  onSaveSyntheticVoice: (voice: SyntheticVoiceDesign) => void;
}

const DESIGN_PRESETS = [
  {
    title: "British Documentary Narrator",
    prompt: "A 52-year-old British nature documentary host with a warm, gravelly baritone, deliberate atmospheric cadence, and subtle dry wit.",
    age: "Mature",
    gender: "Male",
    nationality: "British (RP)",
    tone: "Scholarly & Authoritative",
    texture: "Gravelly & Resonant",
  },
  {
    title: "Tokyo Tech Founder",
    prompt: "A 24-year-old Japanese-American tech founder with crisp, bright vocal timbre, optimistic enthusiasm, and rapid articulate cadence.",
    age: "Young Adult",
    gender: "Female",
    nationality: "American (West Coast)",
    tone: "High Energy & Inspiring",
    texture: "Crisp & Articulate",
  },
  {
    title: "Scottish Folklore Storyteller",
    prompt: "A 68-year-old Scottish highland storyteller with deep raspy warmth, lilting poetic cadence, and weathered grandfatherly resonance.",
    age: "Senior",
    gender: "Male",
    nationality: "Scottish",
    tone: "Storyteller & Emotional",
    texture: "Raspy & Weathered",
  },
  {
    title: "Mindfulness Zen Guide",
    prompt: "A 35-year-old serene mindfulness meditation guide with soft breathy cadence, gentle whispers, and tranquil unhurried pauses.",
    age: "Mature",
    gender: "Neutral",
    nationality: "Neutral Transnational",
    tone: "Calm & Meditative",
    texture: "Breathy & Silky",
  },
];

export const VoiceDesignerModal: React.FC<VoiceDesignerModalProps> = ({
  isOpen,
  onClose,
  onSelectSyntheticVoice,
  savedSyntheticVoices,
  onSaveSyntheticVoice,
}) => {
  const [promptText, setPromptText] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [age, setAge] = useState("Mature");
  const [gender, setGender] = useState("Male");
  const [nationality, setNationality] = useState("British (RP)");
  const [tone, setTone] = useState("Authoritative & Warm");
  const [texture, setTexture] = useState("Gravelly & Resonant");

  const [isGenerating, setIsGenerating] = useState(false);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [currentGeneratedVoice, setCurrentGeneratedVoice] = useState<SyntheticVoiceDesign | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: (typeof DESIGN_PRESETS)[0]) => {
    setErrorMessage(null);
    setPromptText(preset.prompt);
    setVoiceName(preset.title);
    setAge(preset.age);
    setGender(preset.gender);
    setNationality(preset.nationality);
    setTone(preset.tone);
    setTexture(preset.texture);
  };

  const handleGenerateVoice = async () => {
    if (!promptText.trim()) {
      setErrorMessage("Please describe the voice model you wish to synthesize.");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    try {
      const response = await fetch("/api/voice-designer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptDescription: promptText,
          name: voiceName || undefined,
          age,
          gender,
          nationality,
          tone,
          texture,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to design synthetic voice");
      }

      const data = await response.json();
      const syntheticVoice: SyntheticVoiceDesign = data.syntheticVoice;

      if (data.sampleAudioBase64) {
        syntheticVoice.sampleAudioBase64 = data.sampleAudioBase64;
        syntheticVoice.sampleAudioUrl = base64ToBlobUrl(data.sampleAudioBase64, "audio/wav");
      }

      onSaveSyntheticVoice(syntheticVoice);
      setCurrentGeneratedVoice(syntheticVoice);

      // Auto play preview sample
      if (syntheticVoice.sampleAudioUrl) {
        playPreview(syntheticVoice.sampleAudioUrl, syntheticVoice.id);
      }
    } catch (err) {
      console.error("Voice design error:", err);
      const msg = err instanceof Error ? err.message : "Failed to synthesize custom voice. Check your Gemini API connection.";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const playPreview = (url?: string, id?: string) => {
    if (!url) return;
    if (activePreviewId === id && audioPlayerRef.current) {
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
    setActivePreviewId(id || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                <span>Text-Based Custom Voice Design</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                  Generative Synthetics
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Generate entirely synthetic, unique voice models from scratch using descriptive textual prompts.
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
                  <span className="font-semibold block text-rose-200">Voice Designer Notice</span>
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

          {/* Quick Presets Ribbon */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Inspiration Presets (Click to autofill prompt)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DESIGN_PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 text-left rounded-xl bg-stone-950 border border-stone-800 hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-stone-300 group-hover:text-purple-300 block truncate">
                    {p.title}
                  </span>
                  <span className="text-[10px] text-stone-500 block truncate mt-0.5">
                    {p.nationality} · {p.age}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Descriptive Voice Prompt *
            </label>
            <textarea
              rows={3}
              placeholder="Describe the voice in detail (e.g. A 45-year-old Irish scholar with a deep weathered baritone, deliberate pacing, dry sarcastic humor, and subtle melancholic undertones...)"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full p-3 text-sm bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Attribute Customization Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-stone-950/60 border border-stone-800">
            {/* Age */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                <User className="w-3 h-3 text-purple-400" />
                <span>Age Group</span>
              </label>
              <select
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Child">Child (6-12)</option>
                <option value="Young Adult">Young Adult (18-28)</option>
                <option value="Mature">Mature (35-55)</option>
                <option value="Senior">Senior (60+)</option>
              </select>
            </div>

            {/* Gender / Timbre */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                <Music className="w-3 h-3 text-purple-400" />
                <span>Vocal Timbre</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Male">Male Baritone/Bass</option>
                <option value="Female">Female Alto/Soprano</option>
                <option value="Neutral">Neutral / Androgynous</option>
              </select>
            </div>

            {/* Nationality / Accent */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-purple-400" />
                <span>Accent / Region</span>
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="British (RP)">British (RP Oxford)</option>
                <option value="American (General)">American (General/Midwest)</option>
                <option value="Scottish">Scottish Highland</option>
                <option value="Irish">Irish (Dublin/Galway)</option>
                <option value="Indian (English)">Indian English</option>
                <option value="Australian">Australian</option>
                <option value="French-Accented">French-Accented English</option>
                <option value="Hindi Accent">Authentic Hindi Native</option>
              </select>
            </div>

            {/* Tone */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-purple-400" />
                <span>Emotional Tone</span>
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Authoritative & Warm">Authoritative & Warm</option>
                <option value="High Energy & Inspiring">High Energy & Inspiring</option>
                <option value="Calm & Meditative">Calm & Meditative</option>
                <option value="Dramatic & Cinematic">Dramatic & Cinematic</option>
                <option value="Conversational & Casual">Conversational & Casual</option>
                <option value="Dark & Mysterious">Dark & Mysterious</option>
              </select>
            </div>

            {/* Texture */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-purple-400" />
                <span>Vocal Texture</span>
              </label>
              <select
                value={texture}
                onChange={(e) => setTexture(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Gravelly & Resonant">Gravelly & Resonant</option>
                <option value="Smooth & Silky">Smooth & Silky</option>
                <option value="Breathy & Soft">Breathy & Soft</option>
                <option value="Crisp & Articulate">Crisp & Articulate</option>
                <option value="Piercing & Bold">Piercing & Bold</option>
              </select>
            </div>
          </div>

          {/* Generated Result Card */}
          {currentGeneratedVoice && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-purple-200">
                      Synthetic Voice Designed: "{currentGeneratedVoice.name}"
                    </h4>
                    <p className="text-[11px] text-purple-300/80">
                      {currentGeneratedVoice.nationality} · {currentGeneratedVoice.age} · {currentGeneratedVoice.texture}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {currentGeneratedVoice.sampleAudioUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        playPreview(currentGeneratedVoice.sampleAudioUrl, currentGeneratedVoice.id)
                      }
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {activePreviewId === currentGeneratedVoice.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Demo</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Play Audio Sample</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSyntheticVoice(currentGeneratedVoice);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-stone-950 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Select as Active Voice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Previously Designed Synthetic Voices */}
          {savedSyntheticVoices.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Your Custom Designed Voices ({savedSyntheticVoices.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedSyntheticVoices.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-stone-200">{v.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">
                          {v.nationality}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">{v.promptDescription}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-900">
                      {v.sampleAudioUrl ? (
                        <button
                          type="button"
                          onClick={() => playPreview(v.sampleAudioUrl, v.id)}
                          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                        >
                          {activePreviewId === v.id ? (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Preview</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectSyntheticVoice(v);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Use in Studio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/80">
          <div className="text-xs text-stone-400">
            {isGenerating ? (
              <span className="flex items-center gap-2 text-purple-400 animate-pulse">
                <Wand2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing acoustic weights and signature sample...</span>
              </span>
            ) : (
              <span>Crafted from textual descriptive prompts</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateVoice}
              disabled={isGenerating || !promptText.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-950/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? "Designing Voice..." : "Synthesize Custom Voice Model"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
