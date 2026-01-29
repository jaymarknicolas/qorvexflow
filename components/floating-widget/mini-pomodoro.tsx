"use client";

import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { usePomodoro } from "@/lib/hooks";

export default function MiniPomodoro() {
  const {
    isRunning,
    sessions,
    mode,
    progress,
    displayTime,
    start,
    pause,
    reset,
    skip,
  } = usePomodoro();

  const modeLabel =
    mode === "work" ? "Focus" : mode === "short-break" ? "Short Break" : "Long Break";
  const modeColor =
    mode === "work"
      ? "text-cyan-400"
      : mode === "short-break"
        ? "text-emerald-400"
        : "text-violet-400";
  const progressColor =
    mode === "work"
      ? "bg-cyan-400"
      : mode === "short-break"
        ? "bg-emerald-400"
        : "bg-violet-400";

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Mode & Sessions */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${modeColor}`}>{modeLabel}</span>
        <span className="text-white/40">Session {sessions + 1}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} rounded-full transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time */}
      <div className="text-center">
        <div className="text-3xl font-mono font-bold text-white tracking-wider">
          {displayTime}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        {!isRunning ? (
          <button
            onClick={start}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm font-medium"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-medium"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button
          onClick={skip}
          className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
