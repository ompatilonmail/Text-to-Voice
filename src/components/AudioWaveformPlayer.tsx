import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
} from "lucide-react";
import { formatTime, extractWaveformPeaks } from "../utils/audioUtils";

interface AudioWaveformPlayerProps {
  audioBlobUrl: string;
  voiceName: string;
  emotion: string;
  textSnippet: string;
  durationSec?: number;
  fileName?: string;
  autoPlay?: boolean;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  audioBlobUrl,
  voiceName,
  emotion,
  textSnippet,
  durationSec = 0,
  fileName = "voiceover.wav",
  autoPlay = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(durationSec || 0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Extract waveform peaks whenever audio URL changes
  useEffect(() => {
    let mounted = true;
    extractWaveformPeaks(audioBlobUrl, 80).then((peaks) => {
      if (mounted) {
        setWaveformPeaks(peaks);
      }
    });

    return () => {
      mounted = false;
    };
  }, [audioBlobUrl]);

  // Handle audio instance
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay may be blocked by browser policy until interaction
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioBlobUrl, autoPlay]);

  // Update speed & volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackRate, volume, isMuted]);

  // Draw animated waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const peaks = waveformPeaks.length > 0 ? waveformPeaks : Array(60).fill(0.2);
    const barWidth = Math.max(2, (width / peaks.length) - 2);
    const progress = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    peaks.forEach((peak, index) => {
      const x = index * (barWidth + 2);
      const isPast = index / peaks.length <= progress;
      const barHeight = Math.max(4, peak * (height - 8));
      const y = (height - barHeight) / 2;

      // Color scheme: warm amber for played, neutral stone for upcoming
      if (isPast) {
        ctx.fillStyle = "#f59e0b"; // amber-500
      } else {
        ctx.fillStyle = "#334155"; // stone-700
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    });
  }, [waveformPeaks, currentTime, duration]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 0.85];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioBlobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="audio-waveform-player"
      className="p-5 rounded-2xl bg-stone-900 border border-amber-500/20 shadow-xl space-y-4"
    >
      <audio ref={audioRef} src={audioBlobUrl} preload="auto" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Master Voiceover
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs font-medium text-stone-200">
              Voice: {voiceName} ({emotion})
            </span>
          </div>
        </div>

        <button
          id="btn-download-wav"
          onClick={handleDownload}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master .WAV</span>
        </button>
      </div>

      {/* Interactive Waveform Canvas */}
      <div
        id="waveform-interactive-area"
        onClick={handleSeek}
        className="relative h-16 w-full cursor-pointer rounded-xl bg-stone-950/80 p-2 border border-stone-800 flex items-center justify-center overflow-hidden group"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none transition-all duration-75"
          style={{
            left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          }}
        />
        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors pointer-events-none" />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <button
            id="player-play-pause-btn"
            onClick={togglePlayPause}
            className="w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Reset to Beginning */}
          <button
            id="player-reset-btn"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time Display */}
          <div className="font-mono text-xs text-stone-300">
            <span className="text-amber-400 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-stone-500 mx-1">/</span>
            <span className="text-stone-400">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-stone-400">
          {/* Speed Selector */}
          <button
            id="player-speed-btn"
            onClick={cyclePlaybackRate}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer font-mono"
            title="Cycle playback speed"
          >
            <Gauge className="w-3.5 h-3.5 text-stone-400" />
            <span>{playbackRate}x</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              id="player-mute-btn"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              id="player-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                setIsMuted(val === 0);
              }}
              className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>

      {textSnippet && (
        <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 text-xs text-stone-400 line-clamp-2 italic font-serif">
          "{textSnippet}"
        </div>
      )}
    </div>
  );
};
