import React from "react";
import { AudioTake } from "../types";
import { History, Play, Download, Trash2, Clock, Music } from "lucide-react";
import { formatTime } from "../utils/audioUtils";

interface TakesHistoryProps {
  takes: AudioTake[];
  activeTakeId?: string;
  onSelectTake: (take: AudioTake) => void;
  onDeleteTake: (id: string) => void;
  onClearAll: () => void;
}

export const TakesHistory: React.FC<TakesHistoryProps> = ({
  takes,
  activeTakeId,
  onSelectTake,
  onDeleteTake,
  onClearAll,
}) => {
  if (takes.length === 0) {
    return null;
  }

  return (
    <div id="takes-history-section" className="space-y-3">
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Takes & Voiceover Archive ({takes.length})
          </span>
        </div>
        <button
          id="btn-clear-history"
          type="button"
          onClick={onClearAll}
          className="text-[11px] text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
        >
          Clear Archive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {takes.map((take, idx) => {
          const isActive = take.id === activeTakeId;
          const timeStr = new Date(take.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={take.id}
              id={`take-item-${idx}`}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30"
                  : "bg-stone-900/60 border-stone-800/80 hover:border-stone-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-800 text-amber-400">
                    Take #{takes.length - idx}
                  </span>
                  <span className="text-xs font-medium text-stone-300">
                    {take.voice} · {take.emotion}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-stone-500 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{timeStr}</span>
                </div>
              </div>

              <p className="text-xs text-stone-400 line-clamp-2 italic font-serif">
                "{take.text}"
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-xs">
                <span className="font-mono text-[11px] text-stone-400">
                  {formatTime(take.duration)} WAV
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectTake(take)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer text-xs"
                    title="Load & Play in Studio"
                  >
                    <Play className="w-3 h-3 fill-current text-amber-400" />
                    <span>Load</span>
                  </button>

                  <a
                    href={take.audioBlobUrl}
                    download={take.fileName}
                    className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
                    title="Download .WAV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onDeleteTake(take.id)}
                    className="p-1 text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete take"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
