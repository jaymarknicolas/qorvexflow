"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Timer,
  ListTodo,
  FileText,
  Clock,
  X,
  Music,
  BarChart3,
  Calendar,
  Youtube,
  Quote,
  Coffee,
  Pin,
  Hourglass,
  Watch,
  PictureInPicture2,
} from "lucide-react";
import {
  useFloatingWidget,
  FloatingWidgetTab,
} from "./floating-widget-context";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import type { WidgetType } from "@/types";
import StopwatchWidget from "./stopwatch-widget";
import MiniPomodoro from "./mini-pomodoro";
import MiniTasks from "./mini-tasks";
import MiniNotes from "./mini-notes";
import MiniCountdown from "./mini-countdown";
import MiniMusic from "./mini-music";
import MiniStats from "./mini-stats";
import MiniCalendar from "./mini-calendar";
import MiniYouTube from "./mini-youtube";
import MiniQuotes from "./mini-quotes";
import MiniCoffee from "./mini-coffee";

// ─── Icon map for all widget types ─────────────────────────
const WIDGET_ICON: Record<string, typeof Timer> = {
  stopwatch: Watch,
  countdown: Hourglass,
  pomodoro: Clock,
  tasks: ListTodo,
  notes: FileText,
  music: Music,
  stats: BarChart3,
  calendar: Calendar,
  youtube: Youtube,
  quotes: Quote,
  coffee: Coffee,
};

const WIDGET_LABEL: Record<string, string> = {
  stopwatch: "Stopwatch",
  countdown: "Countdown",
  pomodoro: "Pomodoro",
  tasks: "Tasks",
  notes: "Notes",
  music: "Music",
  stats: "Focus Stats",
  calendar: "Calendar",
  youtube: "YouTube",
  quotes: "Quotes",
  coffee: "Coffee",
};

// Memoized mini widgets
const MemoizedStopwatch = memo(StopwatchWidget);
const MemoizedMiniPomodoro = memo(MiniPomodoro);
const MemoizedMiniTasks = memo(MiniTasks);
const MemoizedMiniNotes = memo(MiniNotes);
const MemoizedMiniCountdown = memo(MiniCountdown);
const MemoizedMiniMusic = memo(MiniMusic);
const MemoizedMiniStats = memo(MiniStats);
const MemoizedMiniCalendar = memo(MiniCalendar);
const MemoizedMiniYouTube = memo(MiniYouTube);
const MemoizedMiniQuotes = memo(MiniQuotes);
const MemoizedMiniCoffee = memo(MiniCoffee);

// ─── Theme color map ───────────────────────────────────────
function getThemeColors(theme: string, colorScheme: "light" | "dark" = "dark") {
  const isLight = colorScheme === "light";

  switch (theme) {
    case "ghibli":
      return isLight
        ? {
            bg: "bg-green-50",
            surface: "bg-green-100/60",
            border: "border-green-200",
            accent: "text-green-600",
            accentBg: "bg-green-500/10",
            tabActive: "bg-green-500/15 text-green-700",
            tabInactive:
              "text-green-500/50 hover:text-green-600 hover:bg-green-100",
            scrollThumb: "#16a34a",
            scrollTrack: "#f0fdf4",
            bodyBg: "#f0fdf4",
            textPrimary: "text-green-900",
            textSecondary: "text-green-600/60",
            closeHover: "hover:bg-red-100 hover:text-red-500",
            emptyText: "text-green-400/50",
            pinAccent: "text-green-600",
          }
        : {
            bg: "bg-green-950",
            surface: "bg-green-900/40",
            border: "border-green-800/50",
            accent: "text-green-400",
            accentBg: "bg-green-500/15",
            tabActive: "bg-green-500/20 text-green-300",
            tabInactive:
              "text-green-200/40 hover:text-green-200/60 hover:bg-green-500/10",
            scrollThumb: "#16a34a",
            scrollTrack: "#052e16",
            bodyBg: "#052e16",
            textPrimary: "text-green-50",
            textSecondary: "text-green-200/50",
            closeHover: "hover:bg-red-500/20 hover:text-red-400",
            emptyText: "text-green-300/30",
            pinAccent: "text-green-400",
          };
    case "coffeeshop":
      return isLight
        ? {
            bg: "bg-amber-50",
            surface: "bg-amber-100/60",
            border: "border-amber-200",
            accent: "text-amber-600",
            accentBg: "bg-amber-500/10",
            tabActive: "bg-amber-500/15 text-amber-700",
            tabInactive:
              "text-amber-500/50 hover:text-amber-600 hover:bg-amber-100",
            scrollThumb: "#d97706",
            scrollTrack: "#fffbeb",
            bodyBg: "#fffbeb",
            textPrimary: "text-amber-900",
            textSecondary: "text-amber-600/60",
            closeHover: "hover:bg-red-100 hover:text-red-500",
            emptyText: "text-amber-400/50",
            pinAccent: "text-amber-600",
          }
        : {
            bg: "bg-stone-950",
            surface: "bg-stone-900/40",
            border: "border-amber-900/50",
            accent: "text-amber-400",
            accentBg: "bg-amber-500/15",
            tabActive: "bg-amber-500/20 text-amber-300",
            tabInactive:
              "text-amber-200/40 hover:text-amber-200/60 hover:bg-amber-500/10",
            scrollThumb: "#d97706",
            scrollTrack: "#1c1917",
            bodyBg: "#1c1917",
            textPrimary: "text-amber-50",
            textSecondary: "text-amber-200/50",
            closeHover: "hover:bg-red-500/20 hover:text-red-400",
            emptyText: "text-amber-300/30",
            pinAccent: "text-amber-400",
          };
    default:
      return isLight
        ? {
            bg: "bg-slate-50",
            surface: "bg-slate-100/60",
            border: "border-slate-200",
            accent: "text-violet-600",
            accentBg: "bg-violet-500/10",
            tabActive: "bg-violet-500/15 text-violet-700",
            tabInactive:
              "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            scrollThumb: "#7c3aed",
            scrollTrack: "#f8fafc",
            bodyBg: "#f8fafc",
            textPrimary: "text-slate-900",
            textSecondary: "text-slate-500",
            closeHover: "hover:bg-red-100 hover:text-red-500",
            emptyText: "text-slate-300",
            pinAccent: "text-violet-600",
          }
        : {
            bg: "bg-slate-950",
            surface: "bg-indigo-900/30",
            border: "border-violet-800/40",
            accent: "text-violet-400",
            accentBg: "bg-violet-500/15",
            tabActive: "bg-violet-500/20 text-violet-300",
            tabInactive:
              "text-violet-200/40 hover:text-violet-200/60 hover:bg-violet-500/10",
            scrollThumb: "#7c3aed",
            scrollTrack: "#0f172a",
            bodyBg: "#0f172a",
            textPrimary: "text-white",
            textSecondary: "text-white/50",
            closeHover: "hover:bg-red-500/20 hover:text-red-400",
            emptyText: "text-white/20",
            pinAccent: "text-violet-400",
          };
  }
}

function getScrollbarCSS(colors: ReturnType<typeof getThemeColors>) {
  return `
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: ${colors.scrollTrack}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb { background: ${colors.scrollThumb}40; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${colors.scrollThumb}80; }
    html, body { background: ${colors.bodyBg}; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
  `;
}

// ─── Render mini-widget by type ────────────────────────────
function MiniWidget({ type }: { type: string }) {
  switch (type) {
    case "stopwatch":
      return <MemoizedStopwatch />;
    case "pomodoro":
      return <MemoizedMiniPomodoro />;
    case "tasks":
      return <MemoizedMiniTasks />;
    case "notes":
      return <MemoizedMiniNotes />;
    case "countdown":
      return <MemoizedMiniCountdown />;
    case "music":
      return <MemoizedMiniMusic />;
    case "stats":
      return <MemoizedMiniStats />;
    case "calendar":
      return <MemoizedMiniCalendar />;
    case "youtube":
      return <MemoizedMiniYouTube />;
    case "quotes":
      return <MemoizedMiniQuotes />;
    case "coffee":
      return <MemoizedMiniCoffee />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-white/30 text-xs">
          {WIDGET_LABEL[type] || type}
        </div>
      );
  }
}

// ─── PiP inner UI ──────────────────────────────────────────
function PipUI({ onClose }: { onClose: () => void }) {
  const { activeTab, setActiveTab, pinnedWidgets } = useFloatingWidget();
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const colors = getThemeColors(theme, effectiveColorScheme);

  // Build tabs: only pinned widgets
  const tabs: { id: string; label: string; icon: typeof Timer }[] =
    pinnedWidgets.map((w) => ({
      id: w,
      label: WIDGET_LABEL[w] || w,
      icon: WIDGET_ICON[w] || Timer,
    }));

  // If active tab is not in tabs list, default to first pinned
  const currentTab = tabs.find((t) => t.id === activeTab)
    ? activeTab
    : (tabs[0]?.id ?? "");

  return (
    <div
      className={`flex flex-col h-full w-full ${colors.bg} ${colors.textPrimary} overflow-hidden`}
    >
      {/* Tab bar */}
      {tabs.length > 1 && (
        <div
          className={`flex items-center gap-0.5 px-2 py-1.5 border-b ${colors.border} shrink-0 overflow-x-auto`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FloatingWidgetTab)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive ? colors.tabActive : colors.tabInactive
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {pinnedWidgets.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-full gap-2 ${colors.emptyText}`}
          >
            <Pin className="w-6 h-6" />
            <p className="text-xs">
              Pin widgets from the dashboard to show them here
            </p>
          </div>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={`h-full ${currentTab === tab.id ? "block" : "hidden"}`}
            >
              <MiniWidget type={tab.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── PiP prompt toast (Google Meet style) ───────────────────
function PipPromptToast() {
  const { showPipPrompt, hidePipPrompt, openPip, pinnedWidgets } =
    useFloatingWidget();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (showPipPrompt) {
      // Slight delay for entrance animation
      const t = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [showPipPrompt]);

  // No auto-hide — prompt stays until user explicitly closes or opens PiP

  const handleOpen = useCallback(() => {
    openPip().catch(() => {});
  }, [openPip]);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      hidePipPrompt();
    }, 300);
  }, [hidePipPrompt]);

  if (!showPipPrompt) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300 ${
        visible && !exiting
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-black/40 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 flex-shrink-0">
            <PictureInPicture2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-0.5">
              Keep your widgets visible?
            </p>
            <p className="text-xs text-white/50 mb-3">
              Open Picture-in-Picture to see your {pinnedWidgets.length} pinned
              widget{pinnedWidgets.length !== 1 ? "s" : ""} while using other
              tabs.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpen}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold transition-colors shadow-lg shadow-cyan-500/25"
              >
                <PictureInPicture2 className="w-3.5 h-3.5" />
                Open PiP
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 text-xs font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────
export default function FloatingWidgetWindow() {
  const { isPipOpen, closePip, pipContainer } = useFloatingWidget();
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inject scrollbar / theme CSS into PiP window whenever theme or color scheme changes
  useEffect(() => {
    if (!isPipOpen || !pipContainer) return;
    const pipDoc = pipContainer.ownerDocument;
    if (!pipDoc) return;

    const colors = getThemeColors(theme, effectiveColorScheme);

    // Remove old pip-theme style
    const existing = pipDoc.getElementById("pip-theme-style");
    if (existing) existing.remove();

    const style = pipDoc.createElement("style");
    style.id = "pip-theme-style";
    style.textContent = getScrollbarCSS(colors);
    pipDoc.head.appendChild(style);

    // Sync data-theme and data-color-scheme from main document
    const root = document.documentElement;
    pipDoc.documentElement.setAttribute(
      "data-theme",
      root.getAttribute("data-theme") || "lofi",
    );
    pipDoc.documentElement.setAttribute(
      "data-color-scheme",
      effectiveColorScheme,
    );
    pipDoc.documentElement.className = root.className;
    pipDoc.body.style.backgroundColor = colors.bodyBg;
  }, [isPipOpen, pipContainer, theme, effectiveColorScheme]);

  // Also sync when color scheme changes
  useEffect(() => {
    if (!isPipOpen || !pipContainer) return;
    const pipDoc = pipContainer.ownerDocument;
    if (!pipDoc) return;

    const root = document.documentElement;
    pipDoc.documentElement.setAttribute(
      "data-color-scheme",
      root.getAttribute("data-color-scheme") || "dark",
    );
    pipDoc.documentElement.className = root.className;
  }, [isPipOpen, pipContainer, theme]);

  if (!mounted) return null;

  return (
    <>
      <PipPromptToast />
      {/* PiP portal content */}
      {isPipOpen &&
        pipContainer &&
        createPortal(<PipUI onClose={closePip} />, pipContainer)}
    </>
  );
}
