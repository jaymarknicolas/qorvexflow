"use client";

import { Play, Pause, SkipForward, RotateCcw, Timer } from "lucide-react";
import { usePomodoro } from "@/lib/hooks";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

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

  const colors = useWidgetTheme();

  const modeLabel =
    mode === "work" ? "Focus" : mode === "short-break" ? "Short Break" : "Long Break";

  // Mode-specific colors for badges
  const modeBadgeStyle =
    mode === "work"
      ? "bg-cyan-500/20 text-cyan-400"
      : mode === "short-break"
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-violet-500/20 text-violet-400";

  const progressColor =
    mode === "work"
      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
      : mode === "short-break"
        ? "bg-gradient-to-r from-emerald-500 to-green-500"
        : "bg-gradient-to-r from-violet-500 to-purple-500";

  return (
    <div
      className={`flex flex-col h-full p-3 gap-3 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${colors.accentBg}`}>
            <Timer className={`w-3.5 h-3.5 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-sm font-bold ${colors.textPrimary}`}>Pomodoro</h2>
        </div>
        <span className={`text-[10px] ${colors.textMuted}`}>
          Session {sessions + 1}
        </span>
      </div>

      {/* Mode Badge */}
      <div className="flex justify-center flex-shrink-0">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${modeBadgeStyle}`}
        >
          {modeLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className={`w-full h-1.5 ${colors.isLightMode ? "bg-black/10" : "bg-white/10"} rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${progressColor} rounded-full transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time */}
      <div className="text-center">
        <div
          className={`text-3xl font-mono font-bold ${colors.textPrimary} tracking-wider tabular-nums`}
        >
          {displayTime}
        </div>
        {isRunning && (
          <div
            className={`mt-1 text-[10px] ${colors.accent} flex items-center justify-center gap-1`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {mode === "work" ? "Focusing" : "On break"}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 flex-shrink-0">
        <button
          onClick={reset}
          className={`p-2 rounded-xl ${colors.buttonBg} ${colors.textMuted} transition-colors`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        {!isRunning ? (
          <button
            onClick={start}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all text-sm"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all text-sm"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button
          onClick={skip}
          className={`p-2 rounded-xl ${colors.buttonBg} ${colors.textMuted} transition-colors`}
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
