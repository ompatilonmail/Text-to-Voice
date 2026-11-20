import React, { useState } from "react";
import { VoiceInfo } from "../types";
import { User, Volume2, Sparkles, Check, Globe } from "lucide-react";

interface VoiceSelectorProps {
  voices: VoiceInfo[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  disabled = false,
}) => {
  const [filterLang, setFilterLang] = useState<"all" | "hi" | "en">("all");

  const filteredVoices = voices.filter((v) => {
    if (filterLang === "all") return true;
    if (filterLang === "hi") return v.language === "hi";
    if (filterLang === "en") return v.language === "en" || !v.language;
    return true;
  });

  return (
    <div id="voice-selector-container" className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Neural Voice Models
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            Studio 24kHz
          </span>
        </div>

        {/* Language Filter Tabs */}
        <div className="flex items-center space-x-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            id="tab-voice-all"
            type="button"
            onClick={() => setFilterLang("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterLang === "all"
                ? "bg-amber-500 text-stone-950 shadow-xs font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            All Models ({voices.length})
          </button>
          <button
            id="tab-voice-hi"
            type="button"
            onClick={() => setFilterLang("hi")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              filterLang === "hi"
                ? "bg-rose-500 text-white shadow-xs font-semibold"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <span>हिंदी Models (5)</span>
            <span className="text-[10px] bg-rose-600/30 px-1 rounded">Natural</span>
          </button>
          <button
            id="tab-voice-en"
            type="button"
            onClick={() => setFilterLang("en")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterLang === "en"
                ? "bg-amber-500 text-stone-950 shadow-xs font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            English Models
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {filteredVoices.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          const isHindi = voice.language === "hi";

          return (
            <button
              key={voice.id}
              id={`voice-btn-${voice.id.toLowerCase()}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(voice.id)}
              className={`relative flex flex-col text-left p-3 rounded-xl border transition-all duration-200 outline-none ${
                isSelected
                  ? isHindi
                    ? "bg-rose-500/10 border-rose-500 ring-1 ring-rose-500/50 shadow-sm"
                    : "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 shadow-sm"
                  : "bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-800/40"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? isHindi
                          ? "bg-rose-500 text-white shadow-xs"
                          : "bg-amber-500 text-stone-950 shadow-xs"
                        : isHindi
                        ? "bg-rose-950/60 text-rose-300 border border-rose-800/50"
                        : "bg-stone-800 text-stone-300"
                    }`}
                  >
                    {voice.nativeName ? voice.nativeName[0] : voice.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-1">
                      {voice.name}
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 inline ${isHindi ? "text-rose-400" : "text-amber-500"}`} />
                      )}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {isHindi && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                      हिंदी
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-400 font-medium">
                    {voice.gender.split(" ")[0]}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-400 line-clamp-2 mb-1.5 font-normal leading-relaxed">
                {voice.tone}
              </p>

              {voice.accent && (
                <div className="text-[10px] text-stone-400 mb-1 flex items-center gap-1 font-mono">
                  <Globe className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                  <span className="truncate">{voice.accent}</span>
                </div>
              )}

              <div className="mt-auto pt-1.5 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500">
                <span className="truncate pr-1">{voice.bestFor.split(",")[0]}</span>
                <Volume2 className={`w-3 h-3 shrink-0 ${isSelected ? (isHindi ? "text-rose-400" : "text-amber-400") : "text-stone-600"}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
