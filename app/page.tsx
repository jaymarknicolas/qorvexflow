"use client";

import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import Header from "@/components/header";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
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
import {
  Timer,
  ListTodo,
  Music,
  BarChart3,
  Calendar,
  FileText,
  Youtube,
  Quote,
} from "lucide-react";
import NotesWidgetWYSIWYG from "@/components/notes-widget-wysiwyg";
import YouTubeWidgetInput from "@/components/youtube-widget-input";
import QuotesWidget from "@/components/quotes-widget";
import CanvasVideoBackground from "@/components/canvas-video-background";
import { useTheme } from "@/lib/contexts/theme-context";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { toast } from "sonner";

// Memoized widget components to prevent re-renders when parent state changes
const MemoizedPomodoroWidget = memo(PomodoroWidget);
const MemoizedMusicPlayerSimple = memo(MusicPlayerSimple);
const MemoizedTaskList = memo(TaskList);
const MemoizedFocusStats = memo(FocusStats);
const MemoizedCalendarWidget = memo(CalendarWidget);
const MemoizedNotesWidgetWYSIWYG = memo(NotesWidgetWYSIWYG);
const MemoizedYouTubeWidgetInput = memo(YouTubeWidgetInput);
const MemoizedQuotesWidget = memo(QuotesWidget);

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

// DraggableWidgetContent component - moved outside Home to prevent recreation
interface DraggableWidgetContentProps {
  id: string;
  widgetType: WidgetType;
  onRemove: () => void;
  onCopy: () => void;
  onMaximize: () => void;
  onResetSettings: () => void;
}

const DraggableWidgetContent = memo(function DraggableWidgetContent({
  id,
  widgetType,
  onRemove,
  onCopy,
  onMaximize,
  onResetSettings,
}: DraggableWidgetContentProps) {
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
        widgetType={widgetType}
        slotId={id}
        showOnCanvasHover={true}
        onRemove={onRemove}
        onCopy={onCopy}
        onMaximize={onMaximize}
        onResetSettings={onResetSettings}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
      <WidgetErrorBoundary>
        {renderWidget(widgetType)}
      </WidgetErrorBoundary>
    </div>
  );
});

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
  // Reference to scrollable container for auto-scroll on mobile
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scale, shouldScale } = useDynamicScale(workspaceRef, 80);

  // Auto-scroll configuration for mobile drag
  const autoScrollThreshold = 100; // pixels from edge to trigger scroll
  const autoScrollSpeed = 15; // pixels per frame

  // Fix hydration mismatch by only rendering DndContext on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize all drag handlers to prevent useLayoutEffect array size changes
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  // Handle drag move for auto-scrolling on mobile
  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (!isMobile || !scrollContainerRef.current) return;

      const { activatorEvent } = event;
      if (!activatorEvent) return;

      // Get the current touch/pointer position
      let clientY: number;
      if ("touches" in activatorEvent) {
        clientY = (activatorEvent as TouchEvent).touches[0]?.clientY ?? 0;
      } else if ("clientY" in activatorEvent) {
        clientY = (activatorEvent as MouseEvent).clientY;
      } else {
        return;
      }

      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;

      // Check if near top edge - scroll up
      if (clientY < containerTop + autoScrollThreshold) {
        const distance = containerTop + autoScrollThreshold - clientY;
        const speed = Math.min(autoScrollSpeed, distance / 2);
        container.scrollTop -= speed;
      }
      // Check if near bottom edge - scroll down
      else if (clientY > containerBottom - autoScrollThreshold) {
        const distance = clientY - (containerBottom - autoScrollThreshold);
        const speed = Math.min(autoScrollSpeed, distance / 2);
        container.scrollTop += speed;
      }
    },
    [isMobile]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
    },
    [placeWidget, moveWidget]
  );

  // Handle widget copy
  const handleCopyWidget = useCallback(
    (slotId: string) => {
      const widgetType = slotWidgets[slotId];
      if (widgetType) {
        widgetClipboard.copy(widgetType, {});
        toast.success("Widget copied!", {
          description: "You can now paste it to another slot",
        });
      }
    },
    [slotWidgets]
  );

  // Handle widget maximize
  const handleMaximizeWidget = useCallback((widgetType: WidgetType) => {
    setMaximizedWidget({ type: widgetType, isOpen: true });
  }, []);

  // Handle reset settings
  const handleResetSettings = useCallback(
    (widgetType: WidgetType) => {
      resetSettings(widgetType);
      toast.success("Settings reset to defaults");
    },
    [resetSettings]
  );

  // Get responsive widget height classes
  const getWidgetHeightClass = useCallback(() => {
    if (isMobile) {
      // On mobile, widgets should occupy full width and have consistent height
      // Use fixed height for scrollable experience
      return "min-h-[400px] h-[400px]";
    }
    return "min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] max-h-[320px] sm:max-h-[360px] lg:max-h-[400px]";
  }, [isMobile]);

  // Memoized callbacks for widget actions to prevent unnecessary re-renders
  const createWidgetHandlers = useCallback(
    (id: string, widgetType: WidgetType) => ({
      onRemove: () => removeWidget(id),
      onCopy: () => handleCopyWidget(id),
      onMaximize: () => handleMaximizeWidget(widgetType),
      onResetSettings: () => handleResetSettings(widgetType),
    }),
    [removeWidget, handleCopyWidget, handleMaximizeWidget, handleResetSettings]
  );

  // Helper to render a widget slot
  const renderWidgetSlot = useCallback(
    (id: string) => {
      const widgetType = slotWidgets[id];
      return (
        <WorkspaceCanvas key={id} id={id} className={getWidgetHeightClass()}>
          {widgetType ? (
            <DraggableWidgetContent
              id={id}
              widgetType={widgetType}
              {...createWidgetHandlers(id, widgetType)}
            />
          ) : null}
        </WorkspaceCanvas>
      );
    },
    [slotWidgets, getWidgetHeightClass, createWidgetHandlers]
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
              gridClass:
                "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
            },
            {
              slots: ["slot-3", "slot-4", "slot-5"],
              gridClass:
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
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
          gridClass:
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
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
              gridClass:
                "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8",
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
              gridClass:
                "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
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
              gridClass:
                "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
            },
            {
              slots: ["slot-3", "slot-4", "slot-5"],
              gridClass:
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
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
        className={`max-w-7xl w-full px-3 sm:px-4 md:px-6 lg:px-8 ${
          isMobile ? "py-4 pb-24" : ""
        }`}
        style={{
          // Don't scale on mobile - let users scroll instead
          transform: shouldScale && !isMobile ? `scale(${scale})` : "scale(1)",
          transformOrigin: "center center",
          transition: "transform 0.3s ease-out",
        }}
      >
        {"sections" in config ? (
          // Layouts with sections
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8">
            {config.sections?.map((section, idx) => (
              <div
                key={idx}
                className={
                  isMobile ? "grid grid-cols-1 gap-4" : section.gridClass
                }
              >
                {section.slots.map((id) => renderWidgetSlot(id))}
              </div>
            ))}
          </div>
        ) : (
          // Single grid layouts
          <div
            className={isMobile ? "grid grid-cols-1 gap-4" : config.gridClass}
          >
            {config.slots.map((id) => renderWidgetSlot(id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen h-screen flex flex-col themed-bg relative overflow-hidden`}
    >
      {/* Animated background effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-[1]">
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

      <div className="relative z-[100] shrink-0">
        <Header />
      </div>

      <div
        ref={scrollContainerRef}
        className={`relative z-[10] flex-1 flex justify-center ${
          isMobile
            ? "items-start overflow-y-auto overflow-x-hidden"
            : "items-center overflow-hidden"
        } py-4 md:py-0`}
      >
        {/* Only render DndContext on client to avoid hydration mismatch */}
        {isMounted ? (
          <DndContext
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <WidgetSidebar />
            {renderWorkspace()}
            <DragOverlay>
              {activeId
                ? (() => {
                    // When dragging from a slot (widget actions), don't show icon
                    // Only show icon when dragging from sidebar
                    const isDraggingFromSlot = activeId.startsWith("widget-");

                    if (isDraggingFromSlot) return;

                    // Dragging from sidebar - show the widget icon
                    const IconComponent = getWidgetIcon(activeId as WidgetType);
                    return (
                      <div className="h-12 w-12 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-80">
                        <IconComponent className="h-6 w-6 text-cyan-400" />
                      </div>
                    );
                  })()
                : null}
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

// Render widget using memoized components
function renderWidget(type: WidgetType | null) {
  switch (type) {
    case "pomodoro":
      return <MemoizedPomodoroWidget />;
    case "tasks":
      return <MemoizedTaskList />;
    case "music":
      return <MemoizedMusicPlayerSimple />;
    case "stats":
      return <MemoizedFocusStats />;
    case "calendar":
      return <MemoizedCalendarWidget />;
    case "notes":
      return <MemoizedNotesWidgetWYSIWYG />;
    case "youtube":
      return <MemoizedYouTubeWidgetInput />;
    case "quotes":
      return <MemoizedQuotesWidget />;
    default:
      return null;
  }
}
