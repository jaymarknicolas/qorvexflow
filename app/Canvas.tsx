"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import {
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Settings,
  Layers,
  FileText,
  Palette,
} from "lucide-react";

const CanvasGrid: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wheel zoom handler
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  const zoomBy = (factor: number) => {
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const newScale = oldScale * factor;
    setScale(newScale);

    const center = { x: size.width / 2, y: size.height / 2 };
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative">
      {/* Stage */}
      <Stage
        width={size.width}
        height={size.height}
        ref={stageRef}
        draggable
        onWheel={handleWheel}
        style={{ background: "#f5f5f5" }}
      ></Stage>

      {/* Floating Sidebar */}
      <div className="absolute top-1/2 -translate-y-1/2 left-5 z-20 transition-all duration-300 ease-in-out">
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-black/10 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-[280px]" : "w-12"
          }`}
          style={{ height: "50vh" }}
        >
          {/* Sidebar Header */}
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

          {/* Sidebar Content */}
          <div
            className={`flex-1 flex flex-col overflow-y-auto ${
              isSidebarOpen ? "p-3 gap-2" : "p-2 gap-1"
            }`}
          >
            <SidebarItem
              icon={<Layers size={18} />}
              label="Layers"
              isMinimized={!isSidebarOpen}
            />
            <SidebarItem
              icon={<Palette size={18} />}
              label="Colors"
              isMinimized={!isSidebarOpen}
            />
            <SidebarItem
              icon={<FileText size={18} />}
              label="Documents"
              isMinimized={!isSidebarOpen}
            />
            <SidebarItem
              icon={<Settings size={18} />}
              label="Settings"
              isMinimized={!isSidebarOpen}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
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
    </div>
  );
};

// Sidebar Item Component
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isMinimized?: boolean;
}> = ({ icon, label, isMinimized = false }) => {
  return (
    <button
      className={`w-full bg-transparent border-none rounded-lg cursor-pointer flex items-center gap-3 text-[#1a1a1a] text-sm font-medium transition-colors duration-200 text-left hover:bg-black/5 ${
        isMinimized ? "p-3 justify-center" : "px-4 py-3 justify-start"
      }`}
      title={isMinimized ? label : undefined}
    >
      <span className="text-gray-600 flex items-center">{icon}</span>
      {!isMinimized && <span>{label}</span>}
    </button>
  );
};

export default CanvasGrid;
