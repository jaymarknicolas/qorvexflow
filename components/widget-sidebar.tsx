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
  type LucideIcon,
} from "lucide-react";
import type { WidgetDefinition } from "@/types";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { useTheme } from "@/lib/contexts/theme-context";
import { motion, AnimatePresence } from "framer-motion";

// Mark widgets as new (will show NEW badge)
const newWidgets = new Set(["coffee"]);

// Mark widgets as updated (will show UPDATED badge)
const updatedWidgets = new Set(["calendar", "stats", "quotes", "youtube", "tasks"]);

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
const widgetColors: Record<string, { gradient: string; glow: string; icon: string }> = {
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
};

interface WidgetIconProps {
  id: string;
  icon: LucideIcon;
  label: string;
  isMobile?: boolean;
  showLabel?: boolean;
  isNew?: boolean;
  isUpdated?: boolean;
}

function WidgetIcon({ id, icon: Icon, label, isMobile = false, showLabel = false, isNew = false, isUpdated = false }: WidgetIconProps) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { from: "sidebar" },
  });

  const colors = widgetColors[id] || widgetColors.pomodoro;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative flex ${showLabel ? "flex-col" : ""} items-center justify-center ${
        showLabel ? "h-20 w-20" : "h-12 w-12"
      } rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 ${
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

      {/* Icon container */}
      <div className={`relative z-10 ${showLabel ? "mb-1.5" : ""}`}>
        <Icon
          className={`${showLabel ? "h-6 w-6" : "h-5 w-5"} ${colors.icon} group-hover:text-white transition-colors duration-300`}
        />
      </div>

      {/* Label for mobile expanded view */}
      {showLabel && (
        <span className="relative z-10 text-[10px] font-medium text-white/60 group-hover:text-white transition-colors duration-300">
          {label}
        </span>
      )}

      {/* Tooltip for desktop */}
      {!showLabel && !isMobile && (
        <span className="theme-tooltip pointer-events-none absolute left-full ml-3 rounded-lg backdrop-blur-sm px-3 py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 border shadow-xl">
          <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
            {label}
          </span>
          {isNew && (
            <span className="ml-2 px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full">
              NEW
            </span>
          )}
          {isUpdated && !isNew && (
            <span className="ml-2 px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full">
              UPDATED
            </span>
          )}
        </span>
      )}
    </motion.div>
  );
}

interface WidgetSidebarProps {
  onWidgetPlaced?: () => void;
}

export default function WidgetSidebar({ onWidgetPlaced }: WidgetSidebarProps = {}) {
  const { isMobile, isTablet } = useResponsive();
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
    (widgetId: string) => newWidgets.has(widgetId) && !usedWidgets.has(widgetId),
    [usedWidgets]
  );

  // Check if widget should show UPDATED badge
  const shouldShowUpdated = useCallback(
    (widgetId: string) => updatedWidgets.has(widgetId) && !usedWidgets.has(widgetId),
    [usedWidgets]
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
      };
    }
    return {
      primary: "from-violet-500 to-purple-500",
      secondary: "from-cyan-500 to-blue-500",
      glow: "shadow-violet-500/40",
      border: "border-violet-500/30",
      bg: "bg-slate-950/90",
    };
  };

  const themeAccent = getThemeAccent();

  // Track if we're currently dragging from sidebar
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = useState(false);

  // Monitor drag events to hide sidebar when dragging starts (mobile)
  // and mark widgets as used when dropped
  useDndMonitor({
    onDragStart(event) {
      if (isMobile && event.active.data?.current?.from === "sidebar") {
        // Dragging started from sidebar - slowly hide the drawer
        setIsDraggingFromSidebar(true);
      }
    },
    onDragEnd(event) {
      // Mark widget as used when successfully dropped on canvas
      if (event.active.data?.current?.from === "sidebar" && event.over) {
        const widgetId = event.active.id as string;
        markWidgetAsUsed(widgetId);
      }

      if (isMobile) {
        // Drag ended - close sidebar and reset state
        setIsDraggingFromSidebar(false);
        setIsOpen(false);
      }
    },
    onDragCancel() {
      if (isMobile) {
        // Drag cancelled - reset state but keep sidebar open
        setIsDraggingFromSidebar(false);
      }
    },
  });

  // Mobile: Floating button with modern drawer
  if (isMobile) {
    return (
      <>
        {/* Floating Menu Button */}
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
                <GripVertical className="h-6 w-6 rotate-90" />
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

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop - fade out when dragging */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isDraggingFromSidebar ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
                onClick={() => !isDraggingFromSidebar && setIsOpen(false)}
                style={{ pointerEvents: isDraggingFromSidebar ? "none" : "auto" }}
              />

              {/* Bottom Sheet Drawer - slide down when dragging */}
              <motion.aside
                initial={{ y: "100%", opacity: 0 }}
                animate={{
                  y: isDraggingFromSidebar ? "100%" : 0,
                  opacity: isDraggingFromSidebar ? 0 : 1
                }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  duration: isDraggingFromSidebar ? 0.4 : undefined
                }}
                className={`fixed left-0 right-0 bottom-0 z-[56] ${themeAccent.bg} backdrop-blur-xl rounded-t-3xl border-t ${themeAccent.border} p-4 pb-8 max-h-[70vh] overflow-y-auto`}
                aria-label="Widget sidebar"
                style={{ pointerEvents: isDraggingFromSidebar ? "none" : "auto" }}
              >
                {/* Handle bar */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-5 w-5 ${theme === "ghibli" ? "text-green-400" : "text-violet-400"}`} />
                    <h3 className="text-lg font-semibold text-white">Add Widgets</h3>
                  </div>
                  <span className="text-xs text-white/40">Drag to canvas</span>
                </div>

                {/* Widget Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {widgets.map((w, index) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <WidgetIcon
                        id={w.id}
                        icon={w.icon}
                        label={w.label}
                        isMobile={true}
                        showLabel={true}
                        isNew={shouldShowNew(w.id)}
                        isUpdated={shouldShowUpdated(w.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Tablet: Bottom dock with modern design
  if (isTablet) {
    return (
      <motion.aside
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl ${themeAccent.bg} backdrop-blur-xl border ${themeAccent.border} px-4 py-3 flex flex-row gap-2 shadow-2xl`}
        aria-label="Widget sidebar"
      >
        {/* Decorative glow */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${themeAccent.primary} opacity-10 blur-xl`}
        />

        {widgets.map((w, index) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <WidgetIcon id={w.id} icon={w.icon} label={w.label} isNew={shouldShowNew(w.id)} isUpdated={shouldShowUpdated(w.id)} />
          </motion.div>
        ))}
      </motion.aside>
    );
  }

  // Desktop: Left sidebar with modern glass design
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed left-6 top-1/2 -translate-y-1/2 z-50 rounded-2xl ${themeAccent.bg} backdrop-blur-xl border ${themeAccent.border} p-3 flex flex-col gap-2 shadow-2xl`}
      aria-label="Widget sidebar"
    >
      {/* Header accent */}
      <div className="flex items-center justify-center mb-1">
        <div className={`h-0.5 w-8 rounded-full bg-gradient-to-r ${themeAccent.primary}`} />
      </div>

      {/* Decorative glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${themeAccent.primary} opacity-10 blur-xl pointer-events-none`}
      />

      {widgets.map((w, index) => (
        <motion.div
          key={w.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <WidgetIcon id={w.id} icon={w.icon} label={w.label} isNew={shouldShowNew(w.id)} isUpdated={shouldShowUpdated(w.id)} />
        </motion.div>
      ))}

      {/* Footer accent */}
      <div className="flex items-center justify-center mt-1">
        <div className={`h-0.5 w-8 rounded-full bg-gradient-to-r ${themeAccent.secondary}`} />
      </div>
    </motion.aside>
  );
}
