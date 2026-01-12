"use client";

import { useDraggable } from "@dnd-kit/core";
import { Timer, ListTodo, Music, BarChart3, Calendar } from "lucide-react";

const widgets = [
  { id: "pomodoro", icon: Timer, label: "Pomodoro" },
  { id: "tasks", icon: ListTodo, label: "Tasks" },
  { id: "music", icon: Music, label: "Music" },
  { id: "stats", icon: BarChart3, label: "Stats" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
];

function WidgetIcon({
  id,
  icon: Icon,
  label,
}: {
  id: string;
  icon: any;
  label: string;
}) {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id,
    data: { from: "sidebar" },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="group relative flex items-center justify-center h-12 w-12 rounded-xl border border-white/10 bg-white/5 cursor-grab hover:bg-white/10"
    >
      <Icon className="h-5 w-5 text-white/80 group-hover:text-white" />
      <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

export default function WidgetSidebar() {
  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-3 flex flex-col gap-3">
      {widgets.map((w) => (
        <WidgetIcon key={w.id} {...w} />
      ))}
    </aside>
  );
}
