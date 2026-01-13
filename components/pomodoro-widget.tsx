"use client";

import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { usePomodoro } from "@/lib/hooks";

interface PomodoroWidgetProps {
  onSessionComplete?: () => void;
}

export default function PomodoroWidget({
  onSessionComplete,
}: PomodoroWidgetProps) {
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

  return (
    <div className="relative group h-full">
      <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

      <div className="relative bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full flex flex-col">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === "work" ? "🍅 Focus Time" : "☕ Break Time"}
            </h2>
            <p className="text-xs text-white/60 mt-1">{mode === "work" ? "Stay focused!" : "Relax and recharge"}</p>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="flex items-center justify-center mb-8 relative h-48">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgb(30, 41, 59)"
              strokeWidth="8"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="8"
              strokeDasharray={`${(progress / 100) * 440} 440`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(34, 211, 238)" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute text-center">
            <div className="text-5xl font-bold text-white font-mono">
              {displayTime}
            </div>
            <div className="text-sm text-white/60 mt-2">
              {sessions} sessions
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mt-auto">
          <button
            onClick={isRunning ? pause : start}
            className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start
              </>
            )}
          </button>

          <button
            onClick={reset}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all duration-300 flex items-center gap-2"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={skip}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all duration-300 flex items-center gap-2"
            aria-label="Skip to next phase"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
