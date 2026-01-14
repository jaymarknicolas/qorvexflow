"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/header";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
} from "@dnd-kit/core";
import WorkspaceCanvas from "@/components/workspace-canvas";
import WidgetSidebar from "@/components/widget-sidebar";
import PomodoroWidget from "@/components/pomodoro-widget";
import MusicPlayerSimple from "@/components/music-player-simple";
import TaskList from "@/components/task-list";
import FocusStats from "@/components/focus-stats";
import CalendarWidget from "@/components/calendar-widget";
import { WidgetErrorBoundary } from "@/components/error-boundary";
import WidgetActions from "@/components/widget-actions";
import WidgetMaximizeModal from "@/components/widget-maximize-modal";
import { useWorkspace } from "@/lib/hooks";
import { useLayout } from "@/lib/contexts/layout-context";
import { useWidgetSettings } from "@/lib/contexts/widget-settings-context";
import { useDynamicScale } from "@/lib/hooks/useDynamicScale";
import { widgetClipboard } from "@/lib/services/widget-clipboard";
import type { WidgetType } from "@/types";
import { Timer, ListTodo, Music, BarChart3, Calendar, FileText, Youtube, Quote } from "lucide-react";
import NotesWidgetWYSIWYG from "@/components/notes-widget-wysiwyg";
import YouTubeWidgetInput from "@/components/youtube-widget-input";
import QuotesWidget from "@/components/quotes-widget";
import CanvasVideoBackground from "@/components/canvas-video-background";
import { useTheme } from "@/lib/contexts/theme-context";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { toast } from "sonner";

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
    case "notes":
      return FileText;
    case "youtube":
      return Youtube;
    case "quotes":
      return Quote;
    default:
      return Timer;
  }
};

export default function Home() {
  const { slotWidgets, placeWidget, removeWidget, moveWidget } = useWorkspace();
  const { layout } = useLayout();
  const { resetSettings } = useWidgetSettings();
  const { isMobile } = useResponsive();
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [maximizedWidget, setMaximizedWidget] = useState<{
    type: WidgetType | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const { theme } = useTheme();
  
  // Reference to workspace content for dynamic scaling
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { scale, shouldScale } = useDynamicScale(workspaceRef, 80);

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

    // If dragging from another slot (from drag handle)
    if (active.data?.current?.from === "slot") {
      const sourceSlotId = active.data?.current?.slotId;

      if (sourceSlotId && sourceSlotId !== overSlotId) {
        moveWidget(sourceSlotId, overSlotId);
      }
    }
  };

  // Handle widget copy
  const handleCopyWidget = (slotId: string) => {
    const widgetType = slotWidgets[slotId];
    if (widgetType) {
      widgetClipboard.copy(widgetType, {});
      toast.success("Widget copied!", {
        description: "You can now paste it to another slot",
      });
    }
  };

  // Handle widget maximize
  const handleMaximizeWidget = (widgetType: WidgetType) => {
    setMaximizedWidget({ type: widgetType, isOpen: true });
  };

  // Handle reset settings
  const handleResetSettings = (widgetType: WidgetType) => {
    resetSettings(widgetType);
    toast.success("Settings reset to defaults");
  };

  // Get responsive widget height classes
  const getWidgetHeightClass = () => {
    if (isMobile) {
      return "min-h-[280px] max-h-[320px]";
    }
    return "min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] max-h-[320px] sm:max-h-[360px] lg:max-h-[400px]";
  };

  // Helper component for draggable widget
  const DraggableWidgetContent = ({ id }: { id: string }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: `widget-${id}`,
      data: {
        from: "slot",
        slotId: id,
      },
    });

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group w-full h-full overflow-hidden hover:ring-2 hover:ring-cyan-400/30 rounded-2xl transition-all duration-300"
      >
        <WidgetActions
          widgetType={slotWidgets[id]!}
          slotId={id}
          showOnCanvasHover={true}
          onRemove={() => removeWidget(id)}
          onCopy={() => handleCopyWidget(id)}
          onMaximize={() => handleMaximizeWidget(slotWidgets[id]!)}
          onResetSettings={() => handleResetSettings(slotWidgets[id]!)}
          dragHandleProps={{ ...listeners, ...attributes }}
        />
        <WidgetErrorBoundary>{renderWidget(slotWidgets[id])}</WidgetErrorBoundary>
      </div>
    );
  };

  // Helper to render a widget slot
  const renderWidgetSlot = (id: string) => (
    <WorkspaceCanvas key={id} id={id} className={getWidgetHeightClass()}>
      {slotWidgets[id] ? <DraggableWidgetContent id={id} /> : null}
    </WorkspaceCanvas>
  );

  // Get layout configuration with new layout types
  const getLayoutConfig = () => {
    switch (layout) {
      case "grid-5":
        // Classic Grid: 2x2 top, 3 bottom
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5"],
          sections: [
            {
              slots: ["slot-1", "slot-2"],
              gridClass: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
            },
            {
              slots: ["slot-3", "slot-4", "slot-5"],
              gridClass: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
            },
          ],
        };
      case "grid-4":
        // Quad Grid: Perfect 2x2
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4"],
          gridClass: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
        };
      case "grid-6":
        // Hexagon: 3x2
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6"],
          gridClass: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
        };
      case "asymmetric":
        // Asymmetric: 1 large + 4 small
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5"],
          sections: [
            {
              slots: ["slot-1"],
              gridClass: "grid grid-cols-1 gap-4 md:gap-6 lg:gap-8",
            },
            {
              slots: ["slot-2", "slot-3", "slot-4", "slot-5"],
              gridClass: "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8",
            },
          ],
        };
      case "focus":
        // Focus Mode: 1 main + 2 side
        return {
          slots: ["slot-1", "slot-2", "slot-3"],
          sections: [
            {
              slots: ["slot-1"],
              gridClass: "grid grid-cols-1 gap-4 md:gap-6 lg:gap-8",
            },
            {
              slots: ["slot-2", "slot-3"],
              gridClass: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
            },
          ],
        };
      case "kanban":
        // Kanban: 3 vertical columns
        return {
          slots: ["slot-1", "slot-2", "slot-3"],
          gridClass: "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
        };
      default:
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5"],
          sections: [
            {
              slots: ["slot-1", "slot-2"],
              gridClass: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
            },
            {
              slots: ["slot-3", "slot-4", "slot-5"],
              gridClass: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
            },
          ],
        };
    }
  };

  // Render workspace content
  const renderWorkspace = () => {
    const config = getLayoutConfig();

    return (
      <div
        ref={workspaceRef}
        className="max-w-7xl w-full px-4 md:px-6 lg:px-8"
        style={{
          transform: shouldScale ? `scale(${scale})` : "scale(1)",
          transformOrigin: "center center",
          transition: "transform 0.3s ease-out",
        }}
      >
        {"sections" in config ? (
          // Layouts with sections
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8">
            {config.sections?.map((section, idx) => (
              <div key={idx} className={section.gridClass}>
                {section.slots.map((id) => renderWidgetSlot(id))}
              </div>
            ))}
          </div>
        ) : (
          // Single grid layouts
          <div className={config.gridClass}>
            {config.slots.map((id) => renderWidgetSlot(id))}
          </div>
        )}
      </div>
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

      <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
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

      {/* Widget Maximize Modal */}
      <WidgetMaximizeModal
        isOpen={maximizedWidget.isOpen}
        onClose={() => setMaximizedWidget({ type: null, isOpen: false })}
        widgetType={maximizedWidget.type}
      />

      {/* Theme Video Backgrounds */}
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
      return <MusicPlayerSimple />;
    case "stats":
      return <FocusStats />;
    case "calendar":
      return <CalendarWidget />;
    case "notes":
      return <NotesWidgetWYSIWYG />;
    case "youtube":
      return <YouTubeWidgetInput />;
    case "quotes":
      return <QuotesWidget />;
    default:
      return null;
  }
}
