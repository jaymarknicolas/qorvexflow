"use client";

import { Play, Pause, RotateCcw, Hourglass } from "lucide-react";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

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
  const colors = useWidgetTheme();

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br ${colors.gradient} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1 shrink-0">
        <div className={`p-1 rounded-lg ${colors.accentBg}`}>
          <Hourglass className={`w-3.5 h-3.5 ${colors.iconColor}`} />
        </div>
        <h2 className={`text-xs font-bold ${colors.textPrimary}`}>Countdown Timer</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-3 gap-2 min-h-0">
        {/* Time display */}
        <div className="text-center">
          <div
            className={`text-3xl font-mono font-bold tracking-wider tabular-nums ${
              finished
                ? "text-red-400 animate-pulse"
                : remaining <= 10 && isRunning
                ? "text-amber-400"
                : colors.textPrimary
            }`}
          >
            {formatCountdown(remaining)}
          </div>
          {/* Progress bar */}
          <div className={`mt-2 h-1.5 rounded-full ${colors.isLightMode ? "bg-black/10" : "bg-white/10"} overflow-hidden max-w-[200px] mx-auto`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                finished
                  ? "bg-red-500"
                  : remaining <= 10 && isRunning
                  ? "bg-amber-500"
                  : colors.progressBg
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {finished && (
            <p className="mt-1 text-xs font-semibold text-red-400">
              Time&apos;s up!
            </p>
          )}
          {isRunning && !finished && (
            <p className={`mt-1 text-[10px] ${colors.accent} flex items-center justify-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Counting down
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {!isRunning ? (
            <button
              onClick={start}
              disabled={remaining <= 0 && !finished}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5" />
              {remaining < duration && remaining > 0 ? "Resume" : "Start"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all text-sm"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}

          {(remaining < duration || finished) && !isRunning && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 font-medium text-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Presets */}
      {!isRunning && (
        <div className="shrink-0 px-3 pb-3">
          <p className={`text-[9px] uppercase tracking-wider ${colors.textMuted} mb-1.5 text-center`}>
            Quick presets
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => selectPreset(p.seconds)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  duration === p.seconds && !finished
                    ? `${colors.accentBg} ${colors.accent}`
                    : `${colors.isLightMode ? "bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/60" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"}`
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
