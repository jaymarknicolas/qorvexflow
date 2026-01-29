"use client";

import { Play, Pause, RotateCcw, Flag } from "lucide-react";
import { useFloatingWidget } from "./floating-widget-context";

export default function StopwatchWidget() {
  const {
    stopwatch,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    lapStopwatch,
    formatTime,
  } = useFloatingWidget();

  const { elapsed, isRunning, laps } = stopwatch;

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Time Display */}
      <div className="flex-shrink-0 text-center">
        <div className="text-3xl font-mono font-bold text-white tracking-wider">
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2">
        {!isRunning ? (
          <button
            onClick={startStopwatch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
          >
            <Play className="w-3.5 h-3.5" />
            {elapsed > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <button
            onClick={pauseStopwatch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-medium"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        )}

        {isRunning && (
          <button
            onClick={lapStopwatch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 transition-colors text-sm"
          >
            <Flag className="w-3.5 h-3.5" />
            Lap
          </button>
        )}

        {elapsed > 0 && !isRunning && (
          <button
            onClick={resetStopwatch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1 border-t border-white/10 pt-2">
          {[...laps].reverse().map((lap, i) => {
            const lapNum = laps.length - i;
            const prevLap = lapNum > 1 ? laps[lapNum - 2] : 0;
            const diff = lap - prevLap;
            return (
              <div
                key={i}
                className="flex items-center justify-between text-xs px-2 py-1 rounded bg-white/5"
              >
                <span className="text-white/50">Lap {lapNum}</span>
                <span className="text-white/40 font-mono">
                  +{formatTime(diff)}
                </span>
                <span className="text-white/70 font-mono">
                  {formatTime(lap)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
