"use client";

import { Play, Pause, RotateCcw } from "lucide-react";
import { useCountdown } from "@/lib/hooks/useCountdown";

const PRESETS = [
  { label: "5m", seconds: 5 * 60 },
  { label: "10m", seconds: 10 * 60 },
  { label: "15m", seconds: 15 * 60 },
  { label: "25m", seconds: 25 * 60 },
  { label: "30m", seconds: 30 * 60 },
  { label: "60m", seconds: 60 * 60 },
];

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function MiniCountdown() {
  const {
    duration,
    remaining,
    isRunning,
    isFinished: finished,
    progress,
    start,
    pause,
    reset,
    selectPreset,
  } = useCountdown();

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Time display */}
      <div className="flex-shrink-0 text-center">
        <div
          className={`text-3xl font-mono font-bold tracking-wider ${
            finished ? "text-red-400 animate-pulse" : "text-white"
          }`}
        >
          {formatCountdown(remaining)}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2">
        {!isRunning ? (
          <button
            onClick={start}
            disabled={remaining <= 0 && !finished}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium disabled:opacity-30"
          >
            <Play className="w-3.5 h-3.5" />
            {remaining < duration && remaining > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-medium"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        )}

        {(remaining < duration || finished) && !isRunning && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Presets */}
      {!isRunning && (
        <div className="flex-shrink-0 flex flex-wrap items-center justify-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              onClick={() => selectPreset(p.seconds)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                duration === p.seconds && !finished
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Finished message */}
      {finished && (
        <div className="text-center text-xs text-red-400 font-medium">
          Time&apos;s up!
        </div>
      )}
    </div>
  );
}
