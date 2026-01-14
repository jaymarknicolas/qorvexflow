"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Timer, ListTodo, Music, BarChart3, Calendar, FileText, Youtube, Quote, Menu, X, type LucideIcon } from "lucide-react";
import type { WidgetDefinition } from "@/types";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { motion, AnimatePresence } from "framer-motion";

const widgets: WidgetDefinition[] = [
  { id: "pomodoro", icon: Timer, label: "Pomodoro" },
  { id: "tasks", icon: ListTodo, label: "Tasks" },
  { id: "music", icon: Music, label: "Music" },
  { id: "stats", icon: BarChart3, label: "Stats" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "youtube", icon: Youtube, label: "YouTube" },
  { id: "quotes", icon: Quote, label: "Quotes" },
];

interface WidgetIconProps {
  id: string;
  icon: LucideIcon;
  label: string;
}

function WidgetIcon({ id, icon: Icon, label }: WidgetIconProps) {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id,
    data: { from: "sidebar" },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="group relative flex items-center justify-center h-12 w-12 rounded-xl border border-white/10 bg-white/5 cursor-grab hover:bg-white/10 active:cursor-grabbing"
    >
      <Icon className="h-5 w-5 text-white/80 group-hover:text-white" />
      <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
        {label}
      </span>
    </div>
  );
}

export default function WidgetSidebar() {
  const { isMobile, isTablet } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);

  // Mobile: Floating button with drawer
  if (isMobile) {
    return (
      <>
        {/* Floating Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed left-4 bottom-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          aria-label="Toggle widget menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Drawer */}
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-20 z-50 bg-black/90 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col gap-4 overflow-y-auto"
                aria-label="Widget sidebar"
              >
                <div className="text-white/60 text-xs font-semibold mb-2 text-center">
                  Widgets
                </div>
                {widgets.map((w) => (
                  <WidgetIcon key={w.id} id={w.id} icon={w.icon} label={w.label} />
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Tablet: Bottom dock
  if (isTablet) {
    return (
      <aside
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl px-4 py-3 flex flex-row gap-3"
        aria-label="Widget sidebar"
      >
        {widgets.map((w) => (
          <WidgetIcon key={w.id} id={w.id} icon={w.icon} label={w.label} />
        ))}
      </aside>
    );
  }

  // Desktop: Left sidebar (original)
  return (
    <aside
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-3 flex flex-col gap-3"
      aria-label="Widget sidebar"
    >
      {widgets.map((w) => (
        <WidgetIcon key={w.id} id={w.id} icon={w.icon} label={w.label} />
      ))}
    </aside>
  );
}
