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
  Coffee,
  Cloud,
  Hourglass,
  Watch,
} from "lucide-react";
import NotesWidgetWYSIWYG from "@/components/notes-widget-wysiwyg";
import YouTubeWidgetInput from "@/components/youtube-widget-input";
import QuotesWidget from "@/components/quotes-widget";
import CoffeeCounterWidget from "@/components/coffee-counter-widget";
import StopwatchWidgetCanvas from "@/components/stopwatch-widget-canvas";
import CountdownWidgetCanvas from "@/components/countdown-widget-canvas";
import WeatherForecastWidget from "@/components/weather-forecast-widget";
import CanvasVideoBackground from "@/components/canvas-video-background";
import WeatherParticles from "@/components/weather-particles";
import AmbientSceneBackground from "@/components/ambient-scene-background";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useResponsive } from "@/lib/hooks/useResponsive";
import ResponsiveCanvasCarousel from "@/components/responsive-canvas-carousel";
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
const MemoizedCoffeeCounterWidget = memo(CoffeeCounterWidget);
const MemoizedStopwatchWidgetCanvas = memo(StopwatchWidgetCanvas);
const MemoizedCountdownWidgetCanvas = memo(CountdownWidgetCanvas);
const MemoizedWeatherForecastWidget = memo(WeatherForecastWidget);

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
    case "coffee":
      return Coffee;
    case "stopwatch":
      return Watch;
    case "countdown":
      return Hourglass;
    case "weather":
      return Cloud;
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `widget-${id}`,
    data: {
      from: "slot",
      slotId: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-onboarding="widget-actions"
      className={`relative group w-full h-full overflow-hidden hover:ring-2 hover:ring-cyan-400/30 rounded-2xl transition-all duration-300 ${
        isDragging ? "opacity-50 ring-2 ring-cyan-400/50" : ""
      }`}
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
      <WidgetErrorBoundary>{renderWidget(widgetType)}</WidgetErrorBoundary>
    </div>
  );
});

export default function Home() {
  const { slotWidgets, placeWidget, removeWidget, moveWidget } = useWorkspace();
  const { layout, setLayout } = useLayout();
  const { resetSettings } = useWidgetSettings();
  const { isMobile, isTablet, isSmallMobile, isDesktop } = useResponsive();
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [maximizedWidget, setMaximizedWidget] = useState<{
    type: WidgetType | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const { theme } = useTheme();
  const { settings, effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";

  // Use carousel mode on mobile and tablet (no scroll, paginated)
  const useCarouselMode = isMobile || isTablet;

  // Auto-switch to mobile layout when entering mobile/tablet if on a desktop layout
  useEffect(() => {
    if (!useCarouselMode) return;
    const isMobileLayout = layout.startsWith("mobile-");
    if (!isMobileLayout) {
      // Switch to a sensible default mobile layout
      if (isSmallMobile) {
        setLayout("mobile-3"); // 1+2 for small phones
      } else {
        setLayout("mobile-4"); // 2x2 for tablets / larger phones
      }
    }
  }, [useCarouselMode, isSmallMobile]);

  // Auto-switch back to desktop layout when entering desktop if on a mobile layout
  useEffect(() => {
    if (!isDesktop) return;
    const isMobileLayout = layout.startsWith("mobile-");
    if (isMobileLayout) {
      setLayout("grid-5"); // default desktop layout
    }
  }, [isDesktop]);

  // Compute which slots have widgets (for carousel pagination dots)
  const filledSlots = useMemo(() => {
    const filled = new Set<string>();
    Object.entries(slotWidgets).forEach(([key, value]) => {
      if (value) filled.add(key);
    });
    return filled;
  }, [slotWidgets]);

  // Reference to workspace content for dynamic scaling
  const workspaceRef = useRef<HTMLDivElement>(null);
  // Reference to scrollable container for auto-scroll on mobile
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scale, shouldScale } = useDynamicScale(workspaceRef, 80);

  // Sidebar open trigger for empty slot taps in carousel mode
  const sidebarTriggerRef = useRef<HTMLButtonElement | null>(null);
  const handleEmptySlotTap = useCallback(() => {
    // Find and click the widget sidebar FAB button to open it
    const fabButton = document.querySelector('[data-widget-sidebar-fab]') as HTMLButtonElement;
    if (fabButton) fabButton.click();
  }, []);

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
    [isMobile],
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
    [placeWidget, moveWidget],
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
    [slotWidgets],
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
    [resetSettings],
  );

  // Get responsive widget height classes
  const getWidgetHeightClass = useCallback(() => {
    if (useCarouselMode) {
      // In carousel mode, widgets fill the carousel slide height
      return "h-full";
    }
    return "min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] max-h-[320px] sm:max-h-[360px] lg:max-h-[400px]";
  }, [useCarouselMode]);

  // Memoized callbacks for widget actions to prevent unnecessary re-renders
  const createWidgetHandlers = useCallback(
    (id: string, widgetType: WidgetType) => ({
      onRemove: () => removeWidget(id),
      onCopy: () => handleCopyWidget(id),
      onMaximize: () => handleMaximizeWidget(widgetType),
      onResetSettings: () => handleResetSettings(widgetType),
    }),
    [removeWidget, handleCopyWidget, handleMaximizeWidget, handleResetSettings],
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
    [slotWidgets, getWidgetHeightClass, createWidgetHandlers],
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
      // Mobile/Tablet layouts
      case "mobile-1":
        return {
          slots: ["slot-1"],
          gridClass: "grid grid-cols-1 gap-4",
        };
      case "mobile-2":
        return {
          slots: ["slot-1", "slot-2"],
          gridClass: "grid grid-cols-1 gap-4",
        };
      case "mobile-3":
        return {
          slots: ["slot-1", "slot-2", "slot-3"],
          gridClass: "grid grid-cols-1 gap-4",
        };
      case "mobile-4":
        return {
          slots: ["slot-1", "slot-2", "slot-3", "slot-4"],
          gridClass: "grid grid-cols-2 gap-4",
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

  // Get flat list of all slots from layout config
  const getAllSlots = useCallback(() => {
    const config = getLayoutConfig();
    return config.slots;
  }, [layout]);

  // Render workspace content
  const renderWorkspace = () => {
    const config = getLayoutConfig();

    // Mobile & Tablet: Use paginated carousel instead of grid
    if (useCarouselMode) {
      return (
        <div
          ref={workspaceRef}
          className="w-full h-full px-2 sm:px-3 flex flex-col"
        >
          <ResponsiveCanvasCarousel
            slots={getAllSlots()}
            layout={layout}
            renderSlot={renderWidgetSlot}
            filledSlots={filledSlots}
            onEmptySlotTap={handleEmptySlotTap}
          />
        </div>
      );
    }

    // Desktop: Original grid layout
    return (
      <div
        ref={workspaceRef}
        className="max-w-7xl w-full px-3 sm:px-4 md:px-6 lg:px-8"
        style={{
          transform: shouldScale ? `scale(${scale})` : "scale(1)",
          transformOrigin: "center center",
          transition: "transform 0.3s ease-out",
        }}
      >
        {"sections" in config ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8">
            {config.sections?.map((section, idx) => (
              <div key={idx} className={section.gridClass}>
                {section.slots.map((id) => renderWidgetSlot(id))}
              </div>
            ))}
          </div>
        ) : (
          <div className={config.gridClass}>
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
      {/* Ambient nature scene background (for time-based & weather themes) */}
      <AmbientSceneBackground />

      {/* Animated background glow blobs — theme-aware, hidden in lightweight mode */}
      {settings.performanceMode !== "lightweight" && (() => {
        // Pick blob colors per theme
        const blobs =
          theme === "ghibli"
            ? ["bg-green-500", "bg-amber-500", "bg-emerald-400"]
            : theme === "coffeeshop"
            ? ["bg-amber-500", "bg-orange-500", "bg-yellow-400"]
            : theme === "horizon"
            ? ["bg-sky-400", "bg-violet-500", "bg-orange-400"]
            : ["bg-cyan-500", "bg-purple-500", "bg-pink-400"]; // lofi
        const blendMode = isLightMode ? "mix-blend-multiply" : "mix-blend-screen";
        const opacity = isLightMode ? "opacity-15" : "opacity-25";
        return (
          <div className={`fixed inset-0 ${opacity} pointer-events-none z-1`}>
            <div className={`absolute top-0 left-1/4 w-96 h-96 ${blobs[0]} rounded-full ${blendMode} filter blur-3xl animate-pulse`} />
            <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${blobs[1]} rounded-full ${blendMode} filter blur-3xl animate-pulse`} style={{ animationDelay: "2s" }} />
            <div className={`absolute top-1/2 right-0 w-96 h-96 ${blobs[2]} rounded-full ${blendMode} filter blur-3xl animate-pulse`} style={{ animationDelay: "1s" }} />
          </div>
        );
      })()}

      {/* Weather particle overlay */}
      <WeatherParticles />

      <div className="relative z-[100] shrink-0">
        <Header />
      </div>

      <div
        ref={scrollContainerRef}
        data-onboarding="workspace"
        className={`relative z-[10] flex-1 flex justify-center ${
          useCarouselMode
            ? "items-stretch overflow-hidden"
            : "items-center overflow-hidden"
        } py-2 md:py-0`}
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
            <DragOverlay
              dropAnimation={null}
              style={{ zIndex: 9999 }}
            >
              {activeId
                ? (() => {
                    // When dragging from a slot (widget actions), show a preview card
                    const isDraggingFromSlot = activeId.startsWith("widget-");

                    if (isDraggingFromSlot) {
                      // Extract slot id from widget-slot-X format
                      const slotId = activeId.replace("widget-", "");
                      const widgetType = slotWidgets[slotId];
                      if (!widgetType) return null;

                      const IconComponent = getWidgetIcon(widgetType);
                      return (
                        <div className="w-48 h-32 rounded-2xl border-2 border-cyan-400/50 bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center gap-2 shadow-2xl shadow-cyan-500/20">
                          <IconComponent className="h-8 w-8 text-cyan-400" />
                          <span className="text-white/80 text-sm font-medium capitalize">
                            {widgetType}
                          </span>
                        </div>
                      );
                    }

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

      {/* Theme Video Backgrounds - Only render when enabled */}
      {settings.videoBackgroundEnabled &&
      theme !== "horizon" ? (
        <>
          {theme === "ghibli" && (
            <CanvasVideoBackground videoSrc="/videos/ghibli.mp4" />
          )}
          {theme === "lofi" && (
            <CanvasVideoBackground videoSrc="/videos/lofi.mp4" />
          )}
          {theme === "coffeeshop" && (
            <CanvasVideoBackground videoSrc="/videos/coffeeshop.mp4" />
          )}
        </>
      ) : (
        /* Static gradient background when video is disabled or dynamic theme */
        <div className={`absolute inset-0 z-0 static-bg-${theme}`} />
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
    case "coffee":
      return <MemoizedCoffeeCounterWidget />;
    case "stopwatch":
      return <MemoizedStopwatchWidgetCanvas />;
    case "countdown":
      return <MemoizedCountdownWidgetCanvas />;
    case "weather":
      return <MemoizedWeatherForecastWidget />;
    default:
      return null;
  }
}
