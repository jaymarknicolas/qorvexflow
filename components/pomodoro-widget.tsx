"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useFocusTrackerContext } from "@/lib/contexts/focus-tracker-context";
import PomodoroSettingsModal from "./pomodoro-settings-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PomodoroWidgetProps {
  onSessionComplete?: () => void;
}

export default function PomodoroWidget({
  onSessionComplete,
}: PomodoroWidgetProps) {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
  const focusTracker = useFocusTrackerContext();
  const [showSettings, setShowSettings] = useState(false);
  const prevIsRunning = useRef(false);
  const prevMode = useRef<"work" | "short-break" | "long-break">("work");

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

  // Track focus sessions with the focus tracker
  useEffect(() => {
    // Started a work session
    if (isRunning && mode === "work" && !prevIsRunning.current) {
      focusTracker.startSession("work");
    }
    // Started a break session
    else if (isRunning && mode !== "work" && !prevIsRunning.current) {
      focusTracker.startSession("break");
    }
    // Stopped/paused any session
    else if (!isRunning && prevIsRunning.current) {
      focusTracker.endSession();
    }
    // Mode changed while running (session completed)
    else if (isRunning && mode !== prevMode.current) {
      focusTracker.endSession();
      // Start new session for the new mode
      if (mode === "work") {
        focusTracker.startSession("work");
      } else {
        focusTracker.startSession("break");
      }
    }

    prevIsRunning.current = isRunning;
    prevMode.current = mode;
  }, [isRunning, mode, focusTracker]);

  // Theme colors - consistent with other widgets, light mode aware
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-amber-500/20",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
          iconColor: isLightMode ? "text-green-700" : "text-emerald-400",
          buttonBg: isLightMode
            ? "bg-green-200/50 hover:bg-green-300/50"
            : "bg-emerald-500/15 hover:bg-emerald-500/25",
          buttonHoverText: isLightMode ? "hover:text-green-900" : "hover:text-emerald-300",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800" : "text-white/80",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
        };
      case "horizon":
        return {
          gradient: isLightMode
            ? "from-sky-50/95 via-orange-50/90 to-violet-50/95"
            : "from-slate-900/95 via-sky-950/90 to-violet-950/95",
          glowFrom: "from-sky-500/20",
          glowTo: "to-violet-500/20",
          accent: isLightMode ? "text-sky-700" : "text-sky-400",
          accentBg: isLightMode ? "bg-sky-200/50" : "bg-sky-500/20",
          border: isLightMode ? "border-sky-300/50" : "border-sky-500/20",
          iconColor: isLightMode ? "text-sky-700" : "text-sky-400",
          buttonBg: isLightMode
            ? "bg-sky-200/50 hover:bg-sky-300/50"
            : "bg-sky-500/15 hover:bg-sky-500/25",
          buttonHoverText: isLightMode ? "hover:text-sky-900" : "hover:text-sky-300",
          textPrimary: isLightMode ? "text-slate-900" : "text-white",
          textSecondary: isLightMode ? "text-slate-800" : "text-white/80",
          textMuted: isLightMode ? "text-slate-600/70" : "text-white/50",
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          iconColor: isLightMode ? "text-amber-700" : "text-amber-400",
          buttonBg: isLightMode
            ? "bg-amber-200/50 hover:bg-amber-300/50"
            : "bg-amber-500/15 hover:bg-amber-500/25",
          buttonHoverText: isLightMode ? "hover:text-amber-900" : "hover:text-amber-300",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-900" : "text-white/80",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
        };
      default: // lofi
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          iconColor: isLightMode ? "text-violet-700" : "text-violet-400",
          buttonBg: isLightMode
            ? "bg-violet-200/50 hover:bg-violet-300/50"
            : "bg-violet-500/15 hover:bg-violet-500/25",
          buttonHoverText: isLightMode ? "hover:text-violet-900" : "hover:text-violet-300",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-900" : "text-white/80",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
        };
    }
  }, [theme, isLightMode]);

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
      <div className="relative group h-full w-full overflow-hidden">
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${themeColors.glowFrom} ${themeColors.glowTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none`}
        />

        {/* Main container */}
        <div
          className={`relative bg-gradient-to-br ${themeColors.gradient} backdrop-blur-xl border ${themeColors.border} rounded-2xl p-3 sm:p-4 md:p-5 h-full w-full flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <div className={`p-1 sm:p-1.5 rounded-lg ${themeColors.accentBg} shrink-0`}>
                <Timer className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeColors.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className={`text-sm sm:text-base font-bold ${themeColors.textPrimary} truncate`}>
                  {mode === "work"
                    ? "Focus Time"
                    : mode === "long-break"
                    ? "Long Break"
                    : "Short Break"}
                </h2>
                <p className={`text-[10px] sm:text-xs ${themeColors.textMuted} truncate hidden sm:block`}>
                  {mode === "work"
                    ? `${cycleCount}/${settings.longBreakInterval} until long break`
                    : mode === "long-break"
                    ? "Great job! Take a longer rest"
                    : "Relax and recharge"}
                </p>
              </div>
            </div>
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testSound();
                      }}
                      className={`p-1.5 ${themeColors.buttonBg} ${themeColors.textMuted} ${themeColors.buttonHoverText} rounded-lg transition-all duration-200`}
                      aria-label="Test notification sound"
                    >
                      <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Test sound</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(true);
                      }}
                      className={`p-1.5 ${themeColors.buttonBg} ${themeColors.textMuted} ${themeColors.buttonHoverText} rounded-lg transition-all duration-200`}
                      aria-label="Pomodoro settings"
                    >
                      <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Timer Circle - flexible center area */}
          <div className="flex items-center justify-center flex-1 min-h-0 py-1 sm:py-2">
            <div className="relative w-full max-w-[120px] sm:max-w-[140px] md:max-w-[160px] aspect-square">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}
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
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${themeColors.textPrimary} font-mono`}>
                  {displayTime}
                </div>
                <div className={`text-[10px] sm:text-xs ${themeColors.textMuted} mt-0.5`}>
                  {sessions} sessions
                </div>
              </div>
            </div>
          </div>

          {/* Mode Indicators */}
          <div className="flex justify-center gap-1 sm:gap-1.5 mb-2 sm:mb-3 shrink-0">
            <div
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium transition-all border ${
                mode === "work"
                  ? modeColors.badge
                  : `${isLightMode ? 'bg-black/5 text-black/40' : 'bg-white/5 text-white/40'} border-transparent`
              }`}
            >
              Focus
            </div>
            <div
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium transition-all border ${
                mode === "short-break"
                  ? `bg-green-500/20 ${isLightMode ? 'text-green-700' : 'text-green-400'} border-green-500/30`
                  : `${isLightMode ? 'bg-black/5 text-black/40' : 'bg-white/5 text-white/40'} border-transparent`
              }`}
            >
              Short
            </div>
            <div
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium transition-all border ${
                mode === "long-break"
                  ? `bg-purple-500/20 ${isLightMode ? 'text-purple-700' : 'text-purple-400'} border-purple-500/30`
                  : `${isLightMode ? 'bg-black/5 text-black/40' : 'bg-white/5 text-white/40'} border-transparent`
              }`}
            >
              Long
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-1.5 sm:gap-2 justify-center shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                isRunning ? pause() : start();
              }}
              className={`flex-1 max-w-[100px] sm:max-w-[120px] px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${modeColors.ring} text-white rounded-xl font-semibold hover:shadow-lg ${modeColors.shadow} transition-all duration-300 flex items-center justify-center gap-1 text-xs sm:text-sm`}
              aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Start</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 ${themeColors.buttonBg} ${themeColors.textPrimary} rounded-xl font-semibold border ${themeColors.border} transition-all duration-300 flex items-center`}
              aria-label="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                skip();
              }}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 ${themeColors.buttonBg} ${themeColors.textPrimary} rounded-xl font-semibold border ${themeColors.border} transition-all duration-300 flex items-center`}
              aria-label="Skip to next phase"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Settings Info */}
          <div className={`hidden sm:flex justify-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-[9px] sm:text-[10px] ${themeColors.textMuted} shrink-0`}>
            <span>{settings.workDuration}m focus</span>
            <span>·</span>
            <span>{settings.breakDuration}m break</span>
            <span>·</span>
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
