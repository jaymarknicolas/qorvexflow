"use client";

import React, { useState } from "react";
import { Stage } from "react-konva";
import {
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
  Palette,
  Zap,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import WidgetList from "./WidgetList";
import NotesApp from "./widgets/NotesApp";
import useCanvasZoom from "./hooks/useCanvasZoom";

type SidebarSection = "main" | "widgets" | "colors" | "documents" | "settings";

interface DraggedWidget {
  id: string;
  type: string;
  x: number;
  y: number;
  posX?: number;
  posY?: number;
}

const CanvasGrid: React.FC = () => {
  const { stageRef, scale, size, handleWheel, zoomBy } = useCanvasZoom();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SidebarSection>("main");
  const [draggedWidgetType, setDraggedWidgetType] = useState<string | null>(
    null
  );
  const [droppedWidgets, setDroppedWidgets] = useState<DraggedWidget[]>([]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleWidgetDragStart = (widgetId: string) => {
    setDraggedWidgetType(widgetId);
  };

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    if (draggedWidgetType) {
      const newWidget: DraggedWidget = {
        id: `${draggedWidgetType}-${Date.now()}`,
        type: draggedWidgetType,
        x,
        y,
      };
      setDroppedWidgets([...droppedWidgets, newWidget]);
      setDraggedWidgetType(null);
    }
  };

  const removeWidget = (id: string) => {
    setDroppedWidgets(droppedWidgets.filter((w) => w.id !== id));
  };

  const updateWidgetPosition = (id: string, x: number, y: number) => {
    setDroppedWidgets(
      droppedWidgets.map((w) => (w.id === id ? { ...w, posX: x, posY: y } : w))
    );
  };

  const handleWidgetClick = () => {
    if (scale !== 1) zoomBy(1 / scale); // Reset zoom to 1
  };

  return (
    <div
      className="relative"
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      <Stage
        width={size.width}
        height={size.height}
        ref={stageRef}
        draggable
        onWheel={handleWheel}
        style={{ background: "#f5f5f5" }}
      />

      <div className="absolute top-1/2 -translate-y-1/2 left-5 z-20 transition-all duration-300 ease-in-out">
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-black/10 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-[280px]" : "w-12"
          }`}
          style={{ height: "50vh" }}
        >
          <div
            className={`flex items-center min-h-14 ${
              isSidebarOpen
                ? "p-4 border-b border-black/10 justify-between"
                : "p-3 justify-center"
            }`}
          >
            {isSidebarOpen && (
              <h2 className="text-lg font-semibold text-[#1a1a1a] m-0">
                Tools
              </h2>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-transparent border-none cursor-pointer p-2 rounded-md flex items-center justify-center text-gray-600 transition-colors duration-200 hover:bg-black/5"
            >
              {isSidebarOpen ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>

          <div
            className={`flex-1 flex flex-col overflow-y-auto ${
              isSidebarOpen ? "p-3 gap-2" : "p-2 gap-1"
            }`}
          >
            {activeSection === "main" ? (
              <>
                <SidebarItem
                  icon={<Zap size={18} />}
                  label="Widgets"
                  isMinimized={!isSidebarOpen}
                  onClick={() => setActiveSection("widgets")}
                  isActive={activeSection === "widgets"}
                />
                <SidebarItem
                  icon={<Palette size={18} />}
                  label="Colors"
                  isMinimized={!isSidebarOpen}
                  onClick={() => setActiveSection("colors")}
                  isActive={activeSection === "colors"}
                />
                <SidebarItem
                  icon={<FileText size={18} />}
                  label="Documents"
                  isMinimized={!isSidebarOpen}
                  onClick={() => setActiveSection("documents")}
                  isActive={activeSection === "documents"}
                />
                <SidebarItem
                  icon={<Settings size={18} />}
                  label="Settings"
                  isMinimized={!isSidebarOpen}
                  onClick={() => setActiveSection("settings")}
                  isActive={activeSection === "settings"}
                />
              </>
            ) : activeSection === "widgets" ? (
              <>
                <button
                  onClick={() => setActiveSection("main")}
                  className="w-full bg-transparent border-none rounded-lg cursor-pointer flex items-center gap-2 text-[#1a1a1a] text-sm font-medium transition-colors duration-200 text-left hover:bg-black/5 mb-2 px-2 py-2"
                >
                  <span>←</span>
                  <span>Back</span>
                </button>
                <WidgetList
                  isMinimized={!isSidebarOpen}
                  onWidgetDragStart={handleWidgetDragStart}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute bottom-[10px] right-[10px] z-10 flex items-center gap-3 text-white text-sm">
        <button
          onClick={toggleFullscreen}
          className="z-10 px-3 py-2 text-white border-none rounded cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize className="stroke-gray-500" />
          ) : (
            <Maximize className="stroke-gray-500" />
          )}
        </button>
        <div className="px-[10px] rounded-md flex items-center justify-between gap-2 border-2 border-gray-500">
          <button
            onClick={() => zoomBy(1.1)}
            className="bg-transparent border-none text-white cursor-pointer text-base"
          >
            ➕
          </button>
          <span className="text-gray-800">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => zoomBy(0.9)}
            className="bg-transparent border-none text-white cursor-pointer text-base"
          >
            ➖
          </button>
        </div>
      </div>

      {/* Render dropped widgets */}
      {droppedWidgets.map((widget) => {
        if (widget.type === "notes") {
          return (
            <NotesApp
              key={widget.id}
              id={widget.id}
              position={{
                x: widget.posX ?? widget.x,
                y: widget.posY ?? widget.y,
              }}
              scale={scale}
              onClose={() => removeWidget(widget.id)}
              onPositionChange={(x, y) => updateWidgetPosition(widget.id, x, y)}
              onClickWidget={handleWidgetClick}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default CanvasGrid;
