"use client";

import { Timer, Play, Pause, RotateCcw, Flag } from "lucide-react";
import { useFloatingWidget } from "./floating-widget-context";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

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
  const colors = useWidgetTheme();

  // Compute lap entries with split times
  const lapEntries = laps.map((total, i) => ({
    lapNum: i + 1,
    split: i === 0 ? total : total - laps[i - 1],
    total,
  }));

  // Find best/worst splits for highlighting
  const splits = lapEntries.map((l) => l.split);
  const bestSplit = lapEntries.length > 1 ? Math.min(...splits) : null;
  const worstSplit = lapEntries.length > 1 ? Math.max(...splits) : null;

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`p-1 rounded-lg ${colors.accentBg}`}>
          <Timer className={`w-3.5 h-3.5 ${colors.iconColor}`} />
        </div>
        <h2 className={`text-sm font-bold ${colors.textPrimary}`}>Stopwatch</h2>
      </div>

      {/* Time Display */}
      <div className="flex-shrink-0 text-center">
        <div
          className={`text-3xl font-mono font-bold ${colors.textPrimary} tracking-wider tabular-nums`}
        >
          {formatTime(elapsed)}
        </div>
        {isRunning && (
          <div
            className={`mt-1 text-[10px] ${colors.accent} flex items-center justify-center gap-1`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Running
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2">
        {!isRunning ? (
          <button
            onClick={startStopwatch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all text-sm"
          >
            <Play className="w-3.5 h-3.5" />
            {elapsed > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <>
            <button
              onClick={pauseStopwatch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all text-sm"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
            <button
              onClick={lapStopwatch}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl ${colors.buttonBg} ${colors.textSecondary} font-medium text-sm transition-all`}
            >
              <Flag className="w-3 h-3" />
              Lap
            </button>
          </>
        )}

        {elapsed > 0 && !isRunning && (
          <button
            onClick={resetStopwatch}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 font-medium text-sm transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Laps */}
      {lapEntries.length > 0 && (
        <div
          className={`flex-1 min-h-0 border-t ${colors.border} pt-2 overflow-hidden flex flex-col`}
        >
          <div
            className={`flex items-center justify-between px-2 mb-1 text-[8px] uppercase tracking-wider ${colors.textMuted}`}
          >
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
            {[...lapEntries].reverse().map((lap) => {
              const isBest = bestSplit !== null && lap.split === bestSplit;
              const isWorst = worstSplit !== null && lap.split === worstSplit;
              return (
                <div
                  key={lap.lapNum}
                  className={`flex items-center justify-between px-2 py-1 rounded-lg text-[10px] ${
                    colors.isLightMode ? "bg-black/5" : "bg-white/5"
                  } ${
                    isBest
                      ? "ring-1 ring-emerald-500/30"
                      : isWorst
                        ? "ring-1 ring-red-500/20"
                        : ""
                  }`}
                >
                  <span className={`${colors.textMuted} w-10`}>
                    Lap {lap.lapNum}
                  </span>
                  <span
                    className={`font-mono tabular-nums ${
                      isBest
                        ? "text-emerald-400"
                        : isWorst
                          ? "text-red-400"
                          : colors.textMuted
                    }`}
                  >
                    +{formatTime(lap.split)}
                  </span>
                  <span
                    className={`font-mono tabular-nums ${colors.textSecondary}`}
                  >
                    {formatTime(lap.total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
