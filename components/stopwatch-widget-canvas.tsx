"use client";

import { useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, Flag } from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useFloatingWidget } from "@/components/floating-widget/floating-widget-context";
import { motion } from "framer-motion";

interface LapEntry {
  lapNum: number;
  split: number;
  total: number;
}

export default function StopwatchWidgetCanvas() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
  const {
    stopwatch,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    lapStopwatch,
    formatTime,
  } = useFloatingWidget();

  const laps: LapEntry[] = stopwatch.laps.map((total, i) => ({
    lapNum: i + 1,
    split: i === 0 ? total : total - stopwatch.laps[i - 1],
    total,
  }));

  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-emerald-500/20",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/25",
          border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
          iconColor: isLightMode ? "text-green-700" : "text-emerald-400",
          buttonBg: isLightMode
            ? "bg-green-200/50 hover:bg-green-300/50"
            : "bg-emerald-500/20 hover:bg-emerald-500/30",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800" : "text-white/80",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/60",
          lapBg: isLightMode ? "bg-green-100/60" : "bg-white/5",
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          glowFrom: "from-amber-500/30",
          glowTo: "to-orange-500/20",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/25",
          border: isLightMode ? "border-amber-300/50" : "border-amber-400/30",
          iconColor: isLightMode ? "text-amber-800" : "text-amber-400",
          buttonBg: isLightMode
            ? "bg-amber-200/50 hover:bg-amber-300/50"
            : "bg-amber-500/20 hover:bg-amber-500/30",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-900" : "text-white/80",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/60",
          lapBg: isLightMode ? "bg-amber-100/60" : "bg-white/5",
        };
      default:
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          glowFrom: "from-violet-500/30",
          glowTo: "to-purple-500/20",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/25",
          border: isLightMode ? "border-violet-300/50" : "border-violet-400/30",
          iconColor: isLightMode ? "text-violet-700" : "text-violet-400",
          buttonBg: isLightMode
            ? "bg-violet-200/50 hover:bg-violet-300/50"
            : "bg-violet-500/20 hover:bg-violet-500/30",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-900" : "text-white/80",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/60",
          lapBg: isLightMode ? "bg-violet-100/60" : "bg-white/5",
        };
    }
  }, [theme, isLightMode]);

  const colors = getThemeColors();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
      />

      <div
        className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-5 lg:p-6 h-full w-full flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-shrink-0">
          <div className={`p-1.5 rounded-lg ${colors.accentBg}`}>
            <Timer className={`w-4 h-4 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-base sm:text-lg font-bold ${colors.textPrimary}`}>
            Stopwatch
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Time display */}
          <motion.div
            key="stopwatch-time"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div
              className={`text-4xl sm:text-5xl lg:text-6xl font-mono font-bold ${colors.textPrimary} tracking-wider tabular-nums`}
            >
              {formatTime(stopwatch.elapsed)}
            </div>
            {stopwatch.isRunning && (
              <div className={`mt-1 text-xs ${colors.accent} flex items-center justify-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Running
              </div>
            )}
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-shrink-0">
            {!stopwatch.isRunning ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startStopwatch}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all text-sm"
              >
                <Play className="w-4 h-4" />
                {stopwatch.elapsed > 0 ? "Resume" : "Start"}
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseStopwatch}
                  className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all text-sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={lapStopwatch}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl ${colors.buttonBg} ${colors.textSecondary} font-medium text-sm transition-all`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  Lap
                </motion.button>
              </>
            )}
            {stopwatch.elapsed > 0 && !stopwatch.isRunning && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetStopwatch}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 font-medium text-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </motion.button>
            )}
          </div>

          {/* Laps */}
          {laps.length > 0 && (
            <div className={`w-full flex-1 min-h-0 border-t ${colors.border} pt-3 overflow-hidden flex flex-col`}>
              <div className={`flex items-center justify-between px-2 mb-2 text-[10px] uppercase tracking-wider ${colors.textMuted}`}>
                <span>Lap</span>
                <span>Split</span>
                <span>Total</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
                {[...laps].reverse().map((lap) => {
                  const isBest =
                    laps.length > 1 &&
                    lap.split === Math.min(...laps.map((l) => l.split));
                  const isWorst =
                    laps.length > 1 &&
                    lap.split === Math.max(...laps.map((l) => l.split));
                  return (
                    <div
                      key={lap.lapNum}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${colors.lapBg} ${
                        isBest
                          ? "ring-1 ring-emerald-500/30"
                          : isWorst
                          ? "ring-1 ring-red-500/20"
                          : ""
                      }`}
                    >
                      <span className={`${colors.textMuted} w-12`}>
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
                      <span className={`font-mono tabular-nums ${colors.textSecondary}`}>
                        {formatTime(lap.total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
