"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Hourglass,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Bell,
  BellOff,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COUNTDOWN_PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 5 * 60 },
  { label: "10m", seconds: 10 * 60 },
  { label: "15m", seconds: 15 * 60 },
  { label: "25m", seconds: 25 * 60 },
  { label: "30m", seconds: 30 * 60 },
  { label: "45m", seconds: 45 * 60 },
  { label: "60m", seconds: 60 * 60 },
  { label: "90m", seconds: 90 * 60 },
];

function formatCountdownDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CountdownWidgetCanvas() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";

  const {
    duration: cdDuration,
    remaining: cdRemaining,
    isRunning: cdRunning,
    isFinished: cdFinished,
    progress: cdProgress,
    start: cdStart,
    pause: cdPause,
    reset: cdReset,
    selectPreset: cdSelectPreset,
    adjust: cdAdjust,
  } = useCountdown();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customMinutes, setCustomMinutes] = useState("");

  // Play alarm sound on finish
  useEffect(() => {
    if (cdFinished && soundEnabled) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 880;
          gain2.gain.value = 0.3;
          osc2.start();
          osc2.stop(ctx.currentTime + 0.5);
        }, 600);
      } catch {
        // Audio not available
      }
    }
  }, [cdFinished, soundEnabled]);

  const cdAddCustom = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 999) {
      cdSelectPreset(mins * 60);
      setCustomMinutes("");
    }
  };

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
          surfaceBg: isLightMode ? "bg-green-100/50" : "bg-white/5",
          progressBg: "bg-emerald-500",
          presetActive: isLightMode
            ? "bg-green-200/70 text-green-800"
            : "bg-emerald-500/20 text-emerald-400",
          presetInactive: isLightMode
            ? "bg-green-100/50 text-green-600/60 hover:bg-green-200/50"
            : "bg-white/5 text-white/40 hover:bg-white/10",
        };
      case "horizon":
        return {
          gradient: isLightMode
            ? "from-sky-50/95 via-orange-50/90 to-violet-50/95"
            : "from-slate-900/95 via-sky-950/90 to-violet-950/95",
          glowFrom: "from-sky-500/30",
          glowTo: "to-violet-500/20",
          accent: isLightMode ? "text-sky-700" : "text-sky-400",
          accentBg: isLightMode ? "bg-sky-200/50" : "bg-sky-500/20",
          border: isLightMode ? "border-sky-300/50" : "border-sky-500/20",
          iconColor: isLightMode ? "text-sky-700" : "text-sky-400",
          buttonBg: isLightMode
            ? "bg-sky-200/50 hover:bg-sky-300/50"
            : "bg-sky-500/20 hover:bg-sky-500/30",
          textPrimary: isLightMode ? "text-slate-900" : "text-white",
          textSecondary: isLightMode ? "text-slate-800" : "text-white/80",
          textMuted: isLightMode ? "text-slate-600/70" : "text-white/50",
          surfaceBg: isLightMode ? "bg-sky-100/60" : "bg-white/5",
          progressBg: "bg-sky-500",
          presetActive: isLightMode
            ? "bg-sky-200/70 text-sky-800"
            : "bg-sky-500/20 text-sky-400",
          presetInactive: isLightMode
            ? "bg-sky-100/50 text-sky-600/60 hover:bg-sky-200/50"
            : "bg-white/5 text-white/40 hover:bg-white/10",
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
          surfaceBg: isLightMode ? "bg-amber-100/50" : "bg-white/5",
          progressBg: "bg-amber-500",
          presetActive: isLightMode
            ? "bg-amber-200/70 text-amber-800"
            : "bg-amber-500/20 text-amber-400",
          presetInactive: isLightMode
            ? "bg-amber-100/50 text-amber-600/60 hover:bg-amber-200/50"
            : "bg-white/5 text-white/40 hover:bg-white/10",
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
          surfaceBg: isLightMode ? "bg-violet-100/50" : "bg-white/5",
          progressBg: "bg-violet-500",
          presetActive: isLightMode
            ? "bg-violet-200/70 text-violet-800"
            : "bg-violet-500/20 text-violet-400",
          presetInactive: isLightMode
            ? "bg-violet-100/50 text-violet-600/60 hover:bg-violet-200/50"
            : "bg-white/5 text-white/40 hover:bg-white/10",
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
            <Hourglass className={`w-4 h-4 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-base sm:text-lg font-bold ${colors.textPrimary}`}>
            Countdown Timer
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Time display */}
          <motion.div
            key="countdown-time"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <div
              className={`text-4xl sm:text-5xl lg:text-6xl font-mono font-bold tracking-wider tabular-nums ${
                cdFinished
                  ? "text-red-400 animate-pulse"
                  : cdRemaining <= 10 && cdRunning
                  ? "text-amber-400"
                  : colors.textPrimary
              }`}
            >
              {formatCountdownDisplay(cdRemaining)}
            </div>

            {/* Progress bar */}
            <div className={`mt-3 h-1.5 rounded-full ${isLightMode ? "bg-black/10" : "bg-white/10"} overflow-hidden max-w-[240px] mx-auto`}>
              <motion.div
                className={`h-full rounded-full ${
                  cdFinished
                    ? "bg-red-500"
                    : cdRemaining <= 10 && cdRunning
                    ? "bg-amber-500"
                    : colors.progressBg
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${cdProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {cdFinished && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 text-sm font-semibold text-red-400"
              >
                Time&apos;s up!
              </motion.p>
            )}
            {cdRunning && !cdFinished && (
              <p className={`mt-1 text-xs ${colors.accent} flex items-center justify-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Counting down
              </p>
            )}
          </motion.div>

          {/* Adjust buttons */}
          {!cdRunning && !cdFinished && (
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-4 mb-3 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => cdAdjust(-60)}
                      className={`p-2 rounded-lg ${colors.buttonBg} ${colors.textMuted} transition-colors`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>-1 minute</p>
                  </TooltipContent>
                </Tooltip>
                <span className={`text-sm font-medium ${colors.textSecondary} min-w-[60px] text-center`}>
                  {Math.floor(cdDuration / 60)}m {cdDuration % 60 > 0 ? `${cdDuration % 60}s` : ""}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => cdAdjust(60)}
                      className={`p-2 rounded-lg ${colors.buttonBg} ${colors.textMuted} transition-colors`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>+1 minute</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}

          {/* Controls */}
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-shrink-0">
              {!cdRunning ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cdStart}
                      disabled={cdRemaining <= 0 && !cdFinished}
                      className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      {cdRemaining < cdDuration && cdRemaining > 0 ? "Resume" : "Start"}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{cdRemaining < cdDuration && cdRemaining > 0 ? "Resume timer" : "Start timer"}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cdPause}
                      className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all text-sm"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pause timer</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {(cdRemaining < cdDuration || cdFinished) && !cdRunning && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cdReset}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 font-medium text-sm transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset timer</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2.5 rounded-xl ${colors.buttonBg} ${colors.textMuted} transition-all`}
                  >
                    {soundEnabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{soundEnabled ? "Mute alarm" : "Enable alarm"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Presets */}
          {!cdRunning && (
            <div className="w-full flex-shrink-0">
              <p className={`text-[10px] uppercase tracking-wider ${colors.textMuted} mb-2 text-center`}>
                Quick presets
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {COUNTDOWN_PRESETS.map((p) => (
                  <button
                    key={p.seconds}
                    onClick={() => cdSelectPreset(p.seconds)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      cdDuration === p.seconds && !cdFinished
                        ? colors.presetActive
                        : colors.presetInactive
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Custom input */}
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && cdAddCustom()}
                  placeholder="Custom"
                  min={1}
                  max={999}
                  className={`w-20 px-2.5 py-1.5 rounded-lg text-xs ${colors.surfaceBg} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-current`}
                />
                <span className={`text-xs ${colors.textMuted}`}>min</span>
                <button
                  onClick={cdAddCustom}
                  disabled={!customMinutes || parseInt(customMinutes) <= 0}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${colors.buttonBg} ${colors.accent} disabled:opacity-30 transition-all`}
                >
                  Set
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
