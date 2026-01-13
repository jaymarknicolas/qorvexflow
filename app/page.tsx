"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import WorkspaceCanvas from "@/components/workspace-canvas";
import WidgetSidebar from "@/components/widget-sidebar";
import PomodoroWidget from "@/components/pomodoro-widget";
import MusicPlayer from "@/components/music-player";
import TaskList from "@/components/task-list";
import FocusStats from "@/components/focus-stats";
import CalendarWidget from "@/components/calendar-widget";
import { WidgetErrorBoundary } from "@/components/error-boundary";
import WidgetActions from "@/components/widget-actions";
import { useWorkspace, useDynamicScale } from "@/lib/hooks";
import { useLayout } from "@/lib/contexts/layout-context";
import type { WidgetType } from "@/types";
import { Timer, ListTodo, Music, BarChart3, Calendar } from "lucide-react";
import CanvasVideoBackground from "@/components/canvas-video-background";
import { useTheme } from "@/lib/contexts/theme-context";

// Widget icon mapping
const getWidgetIcon = (widgetType: WidgetType | string | null) => {
  switch (widgetType) {
    case "pomodoro":
      return Timer;
    case "tasks":
      return ListTodo;
    case "music":
      return Music;
    case "stats":
      return BarChart3;
    case "calendar":
      return Calendar;
    default:
      return Timer;
  }
};

export default function Home() {
  const { slotWidgets, placeWidget, removeWidget, moveWidget } = useWorkspace();
  const { layout } = useLayout();
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { theme } = useTheme();

  // Calculate dynamic scale based on content height
  // Estimated height: 2 rows (top: 400px each) + 1 row (bottom: 400px each) + gaps
  const estimatedContentHeight = 400 * 2 + 48 * 3; // widgets + gaps
  const { scale, shouldScale } = useDynamicScale(estimatedContentHeight, 0.95);

  // Fix hydration mismatch by only rendering DndContext on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = String(active.id);
    const overSlotId = String(over.id);

    // If dragging from sidebar
    if (active.data?.current?.from === "sidebar") {
      placeWidget(overSlotId, activeId as WidgetType);
    }

    // If dragging from another slot
    if (active.data?.current?.from === "slot") {
      // Find the source slot
      const sourceSlotId = Object.keys(slotWidgets).find(
        (key) => slotWidgets[key] === activeId
      );

      if (sourceSlotId && sourceSlotId !== overSlotId) {
        moveWidget(sourceSlotId, overSlotId);
      }
    }
  };

  // Helper to render a widget slot
  const renderWidgetSlot = (id: string) => (
    <WorkspaceCanvas key={id} id={id} className="min-h-[400px] max-h-[400px]">
      {slotWidgets[id] && (
        <div className="relative group w-full h-full overflow-hidden hover:ring-2 hover:ring-cyan-400/30 rounded-2xl transition-all duration-300">
          <WidgetActions
            showOnCanvasHover={true}
            onRemove={() => removeWidget(id)}
            onDuplicate={() =>
              console.log("Duplicate widget:", slotWidgets[id])
            }
            onSettings={() =>
              console.log("Open settings for:", slotWidgets[id])
            }
            onMaximize={() => {}}
          />
          <WidgetErrorBoundary>
            {renderWidget(slotWidgets[id])}
          </WidgetErrorBoundary>
        </div>
      )}
    </WorkspaceCanvas>
  );

  // Get layout configuration
  const getLayoutConfig = () => {
    switch (layout) {
      case "grid-3x3":
        return {
          slots: [
            "slot-1",
            "slot-2",
            "slot-3",
            "slot-4",
            "slot-5",
            "slot-6",
            "slot-7",
            "slot-8",
            "slot-9",
          ],
          gridClass: "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8",
        };
      case "grid-2x3":
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6"],
          gridClass: "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8",
        };
      case "single-focus":
        return {
          slots: ["slot-1"],
          gridClass: "grid grid-cols-1 gap-6 lg:gap-8",
        };
      case "dual-column":
        return {
          slots: ["slot-1", "slot-2"],
          gridClass: "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8",
        };
      case "triple-row":
        return {
          slots: ["slot-1", "slot-2", "slot-3"],
          gridClass: "grid grid-cols-1 gap-6 lg:gap-8",
        };
      default: // "default"
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5"],
          sections: [
            {
              slots: ["slot-1", "slot-2"],
              gridClass: "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8",
            },
            {
              slots: ["slot-3", "slot-4", "slot-5"],
              gridClass: "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8",
            },
          ],
        };
    }
  };

  // Render workspace content
  const renderWorkspace = () => {
    const config = getLayoutConfig();

    return (
      <main
        className="max-w-7xl w-full transition-transform duration-300 origin-center"
        style={{
          transform: shouldScale ? `scale(${scale})` : "scale(1)",
        }}
      >
        {"sections" in config ? (
          // Default layout with sections
          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            {config.sections?.map((section, idx) => (
              <div key={idx} className={section.gridClass}>
                {section.slots.map((id) => renderWidgetSlot(id))}
              </div>
            ))}
          </div>
        ) : (
          // Other layouts with single grid
          <div className={config.gridClass}>
            {config.slots.map((id) => renderWidgetSlot(id))}
          </div>
        )}
      </main>
    );
  };

  return (
    <div className="h-screen flex flex-col themed-bg relative overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
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

      <div className="relative z-10 flex-shrink-0">
        <Header />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center">
        {/* Only render DndContext on client to avoid hydration mismatch */}
        {isMounted ? (
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <WidgetSidebar />
            {renderWorkspace()}
            <DragOverlay>
              {activeId ? (
                <div className="h-12 w-12 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-80">
                  {(() => {
                    const IconComponent = getWidgetIcon(activeId as WidgetType);
                    return <IconComponent className="h-6 w-6 text-cyan-400" />;
                  })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          // Render placeholder during SSR
          renderWorkspace()
        )}
      </div>

      {theme === "ghibli" && (
        <CanvasVideoBackground videoSrc="/videos/ghibli.mp4" />
      )}
      {theme === "lofi" && (
        <CanvasVideoBackground videoSrc="/videos/lofi.mp4" />
      )}
    </div>
  );
}

function renderWidget(type: WidgetType | null) {
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
