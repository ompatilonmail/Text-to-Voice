import React from "react";
import { VoiceCalibrationSettings } from "../types";
import { Sliders, RotateCcw, Activity, ShieldCheck, Flame } from "lucide-react";

interface VoiceCalibrationPanelProps {
  settings: VoiceCalibrationSettings;
  onChange: (settings: VoiceCalibrationSettings) => void;
  disabled?: boolean;
}

export const VoiceCalibrationPanel: React.FC<VoiceCalibrationPanelProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const handleReset = () => {
    onChange({
      styleExaggeration: 100,
      stability: 75,
      similarityClarity: 80,
    });
  };

  const getExaggerationBadge = (val: number) => {
    if (val <= 60) return { label: "Understated & Subdued", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    if (val >= 140) return { label: "High Theatricality & Drama", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    return { label: "Natural & Balanced", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  };

  const getStabilityBadge = (val: number) => {
    if (val <= 45) return { label: "Volatile & Highly Expressive", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    if (val >= 85) return { label: "Disciplined & Rock-Solid", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    return { label: "Organic Human Flow", color: "text-stone-300 bg-stone-800 border-stone-700" };
  };

  const exagBadge = getExaggerationBadge(settings.styleExaggeration);
  const stabBadge = getStabilityBadge(settings.stability);

  return (
    <div
      id="voice-calibration-panel"
      className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Acoustic Calibration & Continuity
          </h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="text-[11px] text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          title="Reset sliders to studio defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dynamic Style Exaggeration */}
        <div className="space-y-2 p-3 rounded-xl bg-stone-950/50 border border-stone-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Style Exaggeration</span>
            </label>
            <span className="text-xs font-mono font-semibold text-amber-400">
              {settings.styleExaggeration}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={settings.styleExaggeration}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...settings,
                styleExaggeration: Number(e.target.value),
              })
            }
            className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <span>Subdued (0%)</span>
            <span>Natural (100%)</span>
            <span>Theatrical (200%)</span>
          </div>

          <div className="pt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium inline-block ${exagBadge.color}`}>
              {exagBadge.label}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-normal">
            Amplify or mute the personality, theatricality, and dramatic flair of the voice.
          </p>
        </div>

        {/* Speech Continuity & Stability */}
        <div className="space-y-2 p-3 rounded-xl bg-stone-950/50 border border-stone-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Continuity & Stability</span>
            </label>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {settings.stability}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={settings.stability}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...settings,
                stability: Number(e.target.value),
              })
            }
            className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <span>Erratic (10%)</span>
            <span>Balanced (75%)</span>
            <span>Uniform (100%)</span>
          </div>

          <div className="pt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium inline-block ${stabBadge.color}`}>
              {stabBadge.label}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-normal">
            Balance how erratic/expressive the cadence behaves vs how stable and consistent it stays.
          </p>
        </div>

        {/* Similarity & Clarity Boost */}
        <div className="space-y-2 p-3 rounded-xl bg-stone-950/50 border border-stone-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>Clarity & Fidelity</span>
            </label>
            <span className="text-xs font-mono font-semibold text-sky-400">
              {settings.similarityClarity}%
            </span>
          </div>

          <input
            type="range"
            min="30"
            max="100"
            step="5"
            value={settings.similarityClarity}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...settings,
                similarityClarity: Number(e.target.value),
              })
            }
            className="w-full accent-sky-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <span>Soft (30%)</span>
            <span>Balanced (80%)</span>
            <span>Razor Crisp (100%)</span>
          </div>

          <div className="pt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium text-sky-300 bg-sky-500/10 border-sky-500/20 inline-block">
              {settings.similarityClarity >= 85 ? "Studio High Fidelity" : "Natural Acoustics"}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-normal">
            Sharpen consonant transients and isolate speech presence from acoustic blur.
          </p>
        </div>
      </div>
    </div>
  );
};
