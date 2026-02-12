"use client";

import { useState, useEffect, useCallback } from "react";
import { useDraggable, useDndMonitor } from "@dnd-kit/core";
import {
  Timer,
  ListTodo,
  Music,
  BarChart3,
  Calendar,
  FileText,
  Youtube,
  Quote,
  Coffee,
  Sparkles,
  GripVertical,
  Hourglass,
  Watch,
  X,
  type LucideIcon,
} from "lucide-react";
import type { WidgetDefinition } from "@/types";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { useTheme } from "@/lib/contexts/theme-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mark widgets as new (will show NEW badge)
const newWidgets = new Set(["coffee"]);

// Mark widgets as updated (will show UPDATED badge)
const updatedWidgets = new Set([
  "calendar",
  "stats",
  "quotes",
  "youtube",
  "tasks",
]);

// Storage key for used widgets
const USED_WIDGETS_KEY = "qorvexflow_used_widgets";

// Helper to load used widgets from localStorage
const loadUsedWidgets = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(USED_WIDGETS_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.warn("Failed to load used widgets from localStorage:", e);
  }
  return new Set();
};

// Helper to save used widgets to localStorage
const saveUsedWidgets = (widgets: Set<string>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USED_WIDGETS_KEY, JSON.stringify([...widgets]));
  } catch (e) {
    console.warn("Failed to save used widgets to localStorage:", e);
  }
};

const widgets: WidgetDefinition[] = [
  { id: "pomodoro", icon: Timer, label: "Pomodoro" },
  { id: "stopwatch", icon: Watch, label: "Stopwatch" },
  { id: "countdown", icon: Hourglass, label: "Countdown" },
  { id: "tasks", icon: ListTodo, label: "Tasks" },
  { id: "music", icon: Music, label: "Music" },
  { id: "stats", icon: BarChart3, label: "Stats" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "youtube", icon: Youtube, label: "YouTube" },
  { id: "quotes", icon: Quote, label: "Quotes" },
  { id: "coffee", icon: Coffee, label: "Coffee" },
];

// Widget color scheme
const widgetColors: Record<
  string,
  { gradient: string; glow: string; icon: string }
> = {
  pomodoro: {
    gradient: "from-rose-500 to-orange-500",
    glow: "group-hover:shadow-rose-500/30",
    icon: "text-rose-400",
  },
  tasks: {
    gradient: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/30",
    icon: "text-emerald-400",
  },
  music: {
    gradient: "from-violet-500 to-purple-500",
    glow: "group-hover:shadow-violet-500/30",
    icon: "text-violet-400",
  },
  stats: {
    gradient: "from-blue-500 to-cyan-500",
    glow: "group-hover:shadow-blue-500/30",
    icon: "text-blue-400",
  },
  calendar: {
    gradient: "from-amber-500 to-yellow-500",
    glow: "group-hover:shadow-amber-500/30",
    icon: "text-amber-400",
  },
  notes: {
    gradient: "from-pink-500 to-rose-500",
    glow: "group-hover:shadow-pink-500/30",
    icon: "text-pink-400",
  },
  youtube: {
    gradient: "from-red-500 to-rose-600",
    glow: "group-hover:shadow-red-500/30",
    icon: "text-red-400",
  },
  quotes: {
    gradient: "from-indigo-500 to-blue-500",
    glow: "group-hover:shadow-indigo-500/30",
    icon: "text-indigo-400",
  },
  coffee: {
    gradient: "from-amber-600 to-orange-600",
    glow: "group-hover:shadow-amber-500/30",
    icon: "text-amber-400",
  },
  stopwatch: {
    gradient: "from-cyan-500 to-blue-500",
    glow: "group-hover:shadow-cyan-500/30",
    icon: "text-cyan-400",
  },
  countdown: {
    gradient: "from-fuchsia-500 to-pink-500",
    glow: "group-hover:shadow-fuchsia-500/30",
    icon: "text-fuchsia-400",
  },
};

interface WidgetIconProps {
  id: string;
  icon: LucideIcon;
  label: string;
  isNew?: boolean;
  isUpdated?: boolean;
}

function WidgetIcon({
  id,
  icon: Icon,
  label,
  isNew = false,
  isUpdated = false,
}: WidgetIconProps) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { from: "sidebar" },
  });

  const colors = widgetColors[id] || widgetColors.pomodoro;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`group relative flex flex-col items-center justify-center h-[72px] w-full rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 ${
            isDragging ? "opacity-50 scale-95" : ""
          }`}
        >
          {/* NEW Badge */}
          {isNew && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 z-20"
            >
              <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg shadow-pink-500/30 animate-pulse">
                NEW
              </span>
            </motion.div>
          )}

          {/* UPDATED Badge */}
          {isUpdated && !isNew && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 z-20"
            >
              <span className="px-1 py-0.5 text-[7px] font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-lg shadow-cyan-500/30">
                UPD
              </span>
            </motion.div>
          )}

          {/* Background gradient on hover */}
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
          />

          {/* Glass morphism background */}
          <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all duration-300" />

          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-xl shadow-lg shadow-transparent ${colors.glow} transition-shadow duration-300`}
          />

          {/* Icon */}
          <div className="relative z-10 mb-1">
            <Icon
              className={`h-5 w-5 ${colors.icon} group-hover:text-white transition-colors duration-300`}
            />
          </div>

          {/* Label */}
          <span className="relative z-10 text-[10px] font-medium text-white/60 group-hover:text-white transition-colors duration-300 truncate max-w-full px-1">
            {label}
          </span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="flex items-center gap-2">
        <span>{label}</span>
        {isNew && (
          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full">
            NEW
          </span>
        )}
        {isUpdated && !isNew && (
          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full">
            UPDATED
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

interface WidgetSidebarProps {
  onWidgetPlaced?: () => void;
}

export default function WidgetSidebar({
  onWidgetPlaced,
}: WidgetSidebarProps = {}) {
  const { isMobile } = useResponsive();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [usedWidgets, setUsedWidgets] = useState<Set<string>>(new Set());

  // Load used widgets from localStorage on mount
  useEffect(() => {
    setUsedWidgets(loadUsedWidgets());
  }, []);

  // Mark a widget as used
  const markWidgetAsUsed = useCallback((widgetId: string) => {
    setUsedWidgets((prev) => {
      if (prev.has(widgetId)) return prev;
      const newSet = new Set(prev);
      newSet.add(widgetId);
      saveUsedWidgets(newSet);
      return newSet;
    });
  }, []);

  // Check if widget should show NEW badge
  const shouldShowNew = useCallback(
    (widgetId: string) =>
      newWidgets.has(widgetId) && !usedWidgets.has(widgetId),
    [usedWidgets],
  );

  // Check if widget should show UPDATED badge
  const shouldShowUpdated = useCallback(
    (widgetId: string) =>
      updatedWidgets.has(widgetId) && !usedWidgets.has(widgetId),
    [usedWidgets],
  );

  // Get theme-based colors
  const getThemeAccent = () => {
    if (theme === "ghibli") {
      return {
        primary: "from-green-500 to-emerald-500",
        secondary: "from-amber-500 to-yellow-500",
        glow: "shadow-green-500/40",
        border: "border-green-500/30",
        bg: "bg-green-950/90",
        text: "text-green-400",
      };
    }
    if (theme === "coffeeshop") {
      return {
        primary: "from-amber-500 to-orange-500",
        secondary: "from-yellow-500 to-amber-500",
        glow: "shadow-amber-500/40",
        border: "border-amber-500/30",
        bg: "bg-stone-950/90",
        text: "text-amber-400",
      };
    }
    return {
      primary: "from-violet-500 to-purple-500",
      secondary: "from-cyan-500 to-blue-500",
      glow: "shadow-violet-500/40",
      border: "border-violet-500/30",
      bg: "bg-slate-950/90",
      text: "text-violet-400",
    };
  };

  const themeAccent = getThemeAccent();

  // Track if we're currently dragging from sidebar
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = useState(false);

  // Monitor drag events to hide panel when dragging starts
  // and mark widgets as used when dropped
  useDndMonitor({
    onDragStart(event) {
      if (event.active.data?.current?.from === "sidebar") {
        setIsDraggingFromSidebar(true);
      }
    },
    onDragEnd(event) {
      // Mark widget as used when successfully dropped on canvas
      if (event.active.data?.current?.from === "sidebar" && event.over) {
        const widgetId = event.active.id as string;
        markWidgetAsUsed(widgetId);
      }

      // Drag ended - close panel and reset state
      setIsDraggingFromSidebar(false);
      setIsOpen(false);
    },
    onDragCancel() {
      // Drag cancelled - reset state but keep panel open
      setIsDraggingFromSidebar(false);
    },
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <TooltipProvider delayDuration={300}>
      {/* FAB Button - consistent position across all breakpoints */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`fixed left-4 bottom-4 z-[60] h-14 w-14 rounded-2xl bg-gradient-to-br ${themeAccent.primary} text-white shadow-lg ${themeAccent.glow} hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden`}
            aria-label="Toggle widget menu"
          >
            {/* Animated icon */}
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulse ring when closed */}
            {!isOpen && (
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${themeAccent.primary}`}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Show Widgets</p>
        </TooltipContent>
      </Tooltip>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - only on mobile for bottom sheet feel, transparent on desktop */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isDraggingFromSidebar ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
                onClick={() => !isDraggingFromSidebar && setIsOpen(false)}
                style={{
                  pointerEvents: isDraggingFromSidebar ? "none" : "auto",
                }}
              />
            )}

            {/* Click-away layer for desktop/tablet (invisible) */}
            {!isMobile && (
              <div
                className="fixed inset-0 z-[55]"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Mobile: Bottom Sheet */}
            {isMobile ? (
              <motion.aside
                initial={{ y: "100%", opacity: 0 }}
                animate={{
                  y: isDraggingFromSidebar ? "100%" : 0,
                  opacity: isDraggingFromSidebar ? 0 : 1,
                }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  duration: isDraggingFromSidebar ? 0.4 : undefined,
                }}
                className={`fixed left-0 right-0 bottom-0 z-[56] ${themeAccent.bg} backdrop-blur-xl rounded-t-3xl border-t ${themeAccent.border} p-4 pb-8 max-h-[70vh] overflow-y-auto`}
                aria-label="Widget panel"
                style={{
                  pointerEvents: isDraggingFromSidebar ? "none" : "auto",
                }}
              >
                {/* Handle bar */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-5 w-5 ${themeAccent.text}`} />
                    <h3 className="text-lg font-semibold text-white">
                      Add Widgets
                    </h3>
                  </div>
                  <span className="text-xs text-white/40">Drag to canvas</span>
                </div>

                {/* Widget Grid - 4 columns on mobile */}
                <div className="grid grid-cols-4 gap-3">
                  {widgets.map((w, index) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <WidgetIcon
                        id={w.id}
                        icon={w.icon}
                        label={w.label}
                        isNew={shouldShowNew(w.id)}
                        isUpdated={shouldShowUpdated(w.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.aside>
            ) : (
              /* Desktop/Tablet: Floating panel above the FAB */
              <motion.aside
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: isDraggingFromSidebar ? 0 : 1,
                  y: isDraggingFromSidebar ? 20 : 0,
                  scale: isDraggingFromSidebar ? 0.95 : 1,
                }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className={`fixed left-4 bottom-22 z-[56] w-[280px] ${themeAccent.bg} backdrop-blur-xl rounded-2xl border ${themeAccent.border} shadow-2xl overflow-hidden`}
                aria-label="Widget panel"
                style={{
                  pointerEvents: isDraggingFromSidebar ? "none" : "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative glow */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${themeAccent.primary} opacity-10 blur-xl pointer-events-none`}
                />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 ${themeAccent.text}`} />
                    <h3 className="text-sm font-semibold text-white">
                      Widgets
                    </h3>
                  </div>
                  <span className="text-[10px] text-white/40 font-medium">
                    Drag to canvas
                  </span>
                </div>

                {/* Divider */}
                <div className="mx-4 mb-2">
                  <div
                    className={`h-px bg-gradient-to-r ${themeAccent.primary} opacity-30`}
                  />
                </div>

                {/* Widget Grid - 3 columns for desktop/tablet floating panel */}
                <div className="relative z-10 px-3 pb-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {widgets.map((w, index) => (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <WidgetIcon
                          id={w.id}
                          icon={w.icon}
                          label={w.label}
                          isNew={shouldShowNew(w.id)}
                          isUpdated={shouldShowUpdated(w.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="px-4 pb-3">
                  <div
                    className={`h-0.5 w-full rounded-full bg-gradient-to-r ${themeAccent.secondary} opacity-30`}
                  />
                </div>
              </motion.aside>
            )}
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
