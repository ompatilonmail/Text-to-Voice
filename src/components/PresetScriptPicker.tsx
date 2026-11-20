import React, { useState } from "react";
import { SampleScript } from "../types";
import { Sparkles, FileText, ChevronRight } from "lucide-react";

interface PresetScriptPickerProps {
  samples: SampleScript[];
  onSelectSample: (sample: SampleScript) => void;
  disabled?: boolean;
}

export const PresetScriptPicker: React.FC<PresetScriptPickerProps> = ({
  samples,
  onSelectSample,
  disabled = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<"all" | "hi" | "en">("all");

  const filteredSamples = samples.filter((s) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "hi") return s.language === "hi" || /[\u0900-\u097F]/.test(s.text);
    if (activeCategory === "en") return s.language === "en" || !/[\u0900-\u097F]/.test(s.text);
    return true;
  });

  return (
    <div id="preset-script-picker" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Voiceover Script Presets</span>
          </label>
          <span className="text-[11px] text-stone-500">Auto-fills script, emotion & voice model</span>
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeCategory === "all"
                ? "bg-stone-800 text-amber-300 font-semibold"
                : "text-stone-400 hover:text-stone-300"
            }`}
          >
            All Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("hi")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeCategory === "hi"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            हिंदी Presets (5)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("en")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeCategory === "en"
                ? "bg-stone-800 text-amber-300 font-semibold"
                : "text-stone-400 hover:text-stone-300"
            }`}
          >
            English Presets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {filteredSamples.map((sample, idx) => {
          const isHindi = sample.language === "hi" || /[\u0900-\u097F]/.test(sample.text);
          return (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(sample)}
              className={`flex flex-col text-left p-2.5 rounded-xl bg-stone-900/60 hover:bg-stone-800/80 border transition-all cursor-pointer group ${
                isHindi ? "border-rose-900/30 hover:border-rose-500/50" : "border-stone-800 hover:border-amber-500/50"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isHindi
                      ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                      : "text-amber-500 bg-amber-500/10"
                  }`}
                >
                  {sample.category}
                </span>
                <ChevronRight className="w-3 h-3 text-stone-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <h4 className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 transition-colors truncate">
                {sample.title}
              </h4>
              <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                {sample.voice} · {sample.emotion}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
