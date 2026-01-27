"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Settings,
  Volume2,
  Timer,
} from "lucide-react";
import { usePomodoro } from "@/lib/hooks";
import { useTheme } from "@/lib/contexts/theme-context";
import PomodoroSettingsModal from "./pomodoro-settings-modal";

interface PomodoroWidgetProps {
  onSessionComplete?: () => void;
}

export default function PomodoroWidget({
  onSessionComplete,
}: PomodoroWidgetProps) {
  const { theme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  const {
    isRunning,
    sessions,
    mode,
    progress,
    displayTime,
    cycleCount,
    settings,
    start,
    pause,
    reset,
    skip,
    updateSettings,
    testSound,
  } = usePomodoro();

  // Theme colors for container
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-amber-500/20",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/25",
          border: "border-emerald-400/30",
          iconColor: "text-emerald-400",
          buttonBg: "bg-emerald-500/15 hover:bg-emerald-500/25",
          buttonHoverText: "hover:text-emerald-400",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/90 to-amber-950/90",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          border: "border-amber-500/20",
          iconColor: "text-amber-400",
          buttonBg: "bg-white/10 hover:bg-amber-500/20",
          buttonHoverText: "hover:text-amber-400",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/90 to-purple-900/90",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          border: "border-violet-500/20",
          iconColor: "text-violet-400",
          buttonBg: "bg-white/10 hover:bg-violet-500/20",
          buttonHoverText: "hover:text-violet-400",
        };
    }
  }, [theme]);

  const themeColors = getThemeColors();

  // Get gradient colors based on mode (kept for timer ring)
  const getModeColors = () => {
    switch (mode) {
      case "work":
        return {
          gradient: "from-cyan-500/20 to-blue-500/20",
          ring: "from-cyan-500 to-blue-500",
          stop1: "rgb(34, 211, 238)",
          stop2: "rgb(59, 130, 246)",
          shadow: "shadow-cyan-500/50",
          badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        };
      case "short-break":
        return {
          gradient: "from-green-500/20 to-emerald-500/20",
          ring: "from-green-500 to-emerald-500",
          stop1: "rgb(34, 197, 94)",
          stop2: "rgb(16, 185, 129)",
          shadow: "shadow-green-500/50",
          badge: "bg-green-500/20 text-green-400 border-green-500/30",
        };
      case "long-break":
        return {
          gradient: "from-purple-500/20 to-pink-500/20",
          ring: "from-purple-500 to-pink-500",
          stop1: "rgb(168, 85, 247)",
          stop2: "rgb(236, 72, 153)",
          shadow: "shadow-purple-500/50",
          badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        };
    }
  };

  const modeColors = getModeColors();

  return (
    <>
      <div className="relative h-full w-full overflow-hidden">
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${themeColors.glowFrom} ${themeColors.glowTo} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
        ></div>

        {/* Main container */}
        <div className={`relative bg-gradient-to-br ${themeColors.gradient} backdrop-blur-xl border ${themeColors.border} rounded-2xl p-4 sm:p-6 lg:p-8 h-full w-full flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6 pt-8 sm:pt-0 flex-shrink-0">
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1.5 rounded-lg ${themeColors.accentBg}`}>
                  <Timer className={`w-4 h-4 ${themeColors.iconColor}`} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  {mode === "work"
                    ? "Focus Time"
                    : mode === "long-break"
                    ? "Long Break"
                    : "Short Break"}
                </h2>
              </div>
              <p className="text-xs text-white/60 mt-1 truncate pl-8">
                {mode === "work"
                  ? `Stay focused! (${cycleCount}/${settings.longBreakInterval} until long break)`
                  : mode === "long-break"
                  ? "Great job! Take a longer rest"
                  : "Relax and recharge"}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  testSound();
                }}
                className={`p-1.5 sm:p-2 ${themeColors.buttonBg} text-white/60 ${themeColors.buttonHoverText} rounded-lg transition-all duration-200`}
                aria-label="Test notification sound"
                title="Test notification sound"
              >
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(true);
                }}
                className={`p-1.5 sm:p-2 ${themeColors.buttonBg} text-white/60 ${themeColors.buttonHoverText} rounded-lg transition-all duration-200`}
                aria-label="Pomodoro settings"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Timer Circle */}
          <div className="flex items-center justify-center flex-1 min-h-0 py-2 mb-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
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
                  stroke={`url(#grad-${mode})`}
                  strokeWidth="8"
                  strokeDasharray={`${(progress / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id={`grad-${mode}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={modeColors.stop1} />
                    <stop offset="100%" stopColor={modeColors.stop2} />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-white font-mono">
                  {displayTime}
                </div>
                <div className="text-xs sm:text-sm text-white/60 mt-1">
                  {sessions} sessions
                </div>
              </div>
            </div>
          </div>

          {/* Mode Indicators */}
          <div className="flex justify-center gap-1 sm:gap-2 mb-4 flex-shrink-0 flex-wrap">
            <div
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all border ${
                mode === "work"
                  ? modeColors.badge
                  : "bg-white/5 text-white/40 border-transparent"
              }`}
            >
              Focus
            </div>
            <div
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all border ${
                mode === "short-break"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-white/5 text-white/40 border-transparent"
              }`}
            >
              Short
            </div>
            <div
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all border ${
                mode === "long-break"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-white/5 text-white/40 border-transparent"
              }`}
            >
              Long
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 sm:gap-3 justify-center flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                isRunning ? pause() : start();
              }}
              className={`flex-1 max-w-[200px] px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${modeColors.ring} text-white rounded-xl font-semibold hover:shadow-lg ${modeColors.shadow} transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base`}
              aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Start</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className={`px-3 sm:px-4 py-2 sm:py-3 ${themeColors.buttonBg} text-white rounded-xl font-semibold border ${themeColors.border} transition-all duration-300 flex items-center`}
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                skip();
              }}
              className={`px-3 sm:px-4 py-2 sm:py-3 ${themeColors.buttonBg} text-white rounded-xl font-semibold border ${themeColors.border} transition-all duration-300 flex items-center`}
              aria-label="Skip to next phase"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Settings Info */}
          <div className="flex justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-[10px] sm:text-xs text-white/40 flex-shrink-0 flex-wrap">
            <span>{settings.workDuration}m focus</span>
            <span className="hidden sm:inline">·</span>
            <span>{settings.breakDuration}m break</span>
            <span className="hidden sm:inline">·</span>
            <span>{settings.longBreakDuration}m long</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {typeof window !== "undefined" &&
        showSettings &&
        createPortal(
          <PomodoroSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            settings={settings}
            onSave={updateSettings}
            onTestSound={testSound}
          />,
          document.body
        )}
    </>
  );
}
