import React, { useState } from "react";
import { Sparkles, Info, HelpCircle } from "lucide-react";

interface SSMLTagToolbarProps {
  onInsertTag: (tag: string) => void;
  onLoadTaggedSample?: () => void;
  disabled?: boolean;
}

interface TagItem {
  tag: string;
  label: string;
  desc: string;
  category: "emotion" | "breath" | "tempo" | "volume";
  color: string;
}

const AUDIO_TAGS: TagItem[] = [
  { tag: "[whisper]", label: "Whisper", desc: "Drops to an intimate, soft, breathy whisper", category: "volume", color: "text-sky-400 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20" },
  { tag: "[sigh]", label: "Sigh", desc: "Audible breathy exhale before speaking", category: "breath", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20" },
  { tag: "[excited]", label: "Excited", desc: "High dynamic energy, elevated pitch and rapid cadence", category: "emotion", color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" },
  { tag: "[gasp]", label: "Gasp", desc: "Sharp, sudden intake of breath for shock/tension", category: "breath", color: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20" },
  { tag: "[laugh]", label: "Laugh", desc: "Chuckle or laugh warmly while vocalizing words", category: "emotion", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
  { tag: "[pause: 1s]", label: "1s Pause", desc: "One-second deliberate dramatic silence", category: "tempo", color: "text-stone-300 bg-stone-800 border-stone-700 hover:bg-stone-700" },
  { tag: "[angry]", label: "Angry", desc: "Tense, sharp, gritty frustration and edge", category: "emotion", color: "text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20" },
  { tag: "[sad]", label: "Sad", desc: "Somber, downcast pathos with trembling inflection", category: "emotion", color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
  { tag: "[fast]", label: "Fast", desc: "Accelerates speech tempo briskly", category: "tempo", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20" },
  { tag: "[slow]", label: "Slow", desc: "Decelerates pacing with weight on every word", category: "tempo", color: "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20" },
  { tag: "[shout]", label: "Shout", desc: "Projects voice with elevated volume and force", category: "volume", color: "text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20" },
  { tag: "[clearthroat]", label: "Clear Throat", desc: "Brief authentic polite throat clear", category: "breath", color: "text-teal-400 bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/20" },
];

export const SSMLTagToolbar: React.FC<SSMLTagToolbarProps> = ({
  onInsertTag,
  onLoadTaggedSample,
  disabled = false,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div id="ssml-tag-toolbar" className="space-y-1.5 py-1">
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center space-x-1.5 text-stone-400">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-amber-500">
            Audio Directorial Tags
          </span>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            Insert inline markdown tags to alter delivery mid-sentence
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onLoadTaggedSample && (
            <button
              type="button"
              onClick={onLoadTaggedSample}
              disabled={disabled}
              className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
              title="Load a script demonstrating mid-paragraph vocal shifts"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Tagged Demo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] px-1.5 py-0.5 rounded text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Show Audio Tags Guide"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Guide</span>
          </button>
        </div>
      </div>

      {/* Tag Buttons Ribbon */}
      <div className="flex flex-wrap items-center gap-1">
        {AUDIO_TAGS.map((t) => (
          <button
            key={t.tag}
            type="button"
            disabled={disabled}
            onClick={() => onInsertTag(` ${t.tag} `)}
            title={t.desc}
            className={`px-2 py-1 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${t.color} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t.tag}
          </button>
        ))}
      </div>

      {/* Inline Guide Collapsible */}
      {showGuide && (
        <div className="p-3 mt-1 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-200">
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span>How Audio Tags Work in Speech Synthesis</span>
          </div>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            Place tags like <code className="text-sky-300 font-mono">[whisper]</code> or <code className="text-amber-300 font-mono">[excited]</code> anywhere inside your sentences. The AI vocal model adjusts inflection, breathiness, and emotional pitch immediately at that cue without speaking the bracketed words.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
              <span className="font-semibold text-stone-300">Example:</span>
              <p className="text-stone-400 italic mt-0.5">
                "Listen closely... <span className="text-sky-300 font-mono">[whisper]</span> nobody can find out we were here. <span className="text-rose-300 font-mono">[gasp]</span> Did you hear that?"
              </p>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
              <span className="font-semibold text-stone-300">Dramatic Pause:</span>
              <p className="text-stone-400 italic mt-0.5">
                "And the winner is... <span className="text-amber-300 font-mono">[pause: 1.5s]</span> <span className="text-emerald-300 font-mono">[excited]</span> Team Pulse!"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
