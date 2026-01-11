"use client";

import { useState } from "react";
import Header from "@/components/header";
import { DndContext, DragEndEvent, useDraggable } from "@dnd-kit/core";
import WorkspaceCanvas from "@/components/workspace-canvas";
import WidgetSidebar from "@/components/widget-sidebar";
import PomodoroWidget from "@/components/pomodoro-widget";
import MusicPlayer from "@/components/music-player";
import TaskList from "@/components/task-list";
import FocusStats from "@/components/focus-stats";
import CalendarWidget from "@/components/calendar-widget";
import DragHandle from "@/components/drag-handle";

export default function Home() {
  const [slotWidgets, setSlotWidgets] = useState<Record<string, string | null>>(
    {
      "slot-1": null,
      "slot-2": null,
      "slot-3": null,
      "slot-4": null,
      "slot-5": null,
    }
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);

    // If dragging from sidebar
    if (active.data?.current?.from === "sidebar") {
      setSlotWidgets((prev) => {
        if (prev[over.id as string]) return prev;
        return {
          ...prev,
          [over.id as string]: activeId,
        };
      });
    }

    // If dragging from another slot
    if (active.data?.current?.from === "slot") {
      setSlotWidgets((prev) => {
        const newState = { ...prev };
        // Find the old slot containing this widget
        const oldSlot = Object.keys(prev).find((key) => prev[key] === activeId);
        if (oldSlot) newState[oldSlot] = null;
        // Place it into new slot
        newState[over.id as string] = activeId;
        return newState;
      });
    }
  };

  const handleRemoveWidget = (slotId: string) => {
    setSlotWidgets((prev) => ({
      ...prev,
      [slotId]: null,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <Header />

        <DndContext onDragEnd={handleDragEnd}>
          <WidgetSidebar />

          <main className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-6 lg:gap-8">
              {/* Top row: 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {["slot-1", "slot-2"].map((id) => (
                  <WorkspaceCanvas
                    key={id}
                    id={id}
                    className="min-h-[400px] max-h-[400px]"
                  >
                    {slotWidgets[id] && (
                      <div className="relative group w-full h-full">
                        {/* Delete button */}
                        <button
                          onClick={() => handleRemoveWidget(id)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition z-10"
                        >
                          ×
                        </button>

                        {/* Drag handle */}
                        <DragHandle id={slotWidgets[id]!} />

                        {/* Widget content */}
                        {renderWidget(slotWidgets[id])}
                      </div>
                    )}
                  </WorkspaceCanvas>
                ))}
              </div>

              {/* Bottom row: 3 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {["slot-3", "slot-4", "slot-5"].map((id) => (
                  <WorkspaceCanvas
                    key={id}
                    id={id}
                    className="min-h-[400px] max-h-[400px]"
                  >
                    {slotWidgets[id] && (
                      <div className="relative group w-full h-full">
                        {/* Delete button */}
                        <button
                          onClick={() => handleRemoveWidget(id)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition z-10"
                        >
                          ×
                        </button>

                        {/* Drag handle */}
                        <DragHandle id={slotWidgets[id]!} />

                        {/* Widget content */}
                        {renderWidget(slotWidgets[id])}
                      </div>
                    )}
                  </WorkspaceCanvas>
                ))}
              </div>
            </div>
          </main>
        </DndContext>
      </div>
    </div>
  );
}

function renderWidget(type: string) {
  switch (type) {
    case "pomodoro":
      return <PomodoroWidget />;
    case "tasks":
      return <TaskList />;
    case "music":
      return <MusicPlayer />;
    case "stats":
      return <FocusStats />;
    case "calendar":
      return <CalendarWidget />;
    default:
      return null;
  }
}

// Hook for drag handle
function getDragHandleProps(slotId: string) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: slotId,
    data: { from: "slot" }, // indicate internal drag
  });
  return { attributes, listeners, ref: setNodeRef };
}
