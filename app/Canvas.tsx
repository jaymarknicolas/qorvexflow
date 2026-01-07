"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { Maximize, Minimize } from "lucide-react";

const CanvasGrid: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
    <div style={{ position: "relative" }}>
      {/* Stage */}
      <Stage
        width={size.width}
        height={size.height}
        ref={stageRef}
        draggable
        onWheel={handleWheel}
        style={{ background: "#f5f5f5" }}
      ></Stage>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,

          color: "#fff",
          fontSize: 14,
        }}
        className="flex gap-3"
      >
        <button
          onClick={toggleFullscreen}
          style={{
            zIndex: 10,
            padding: "8px 12px",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isFullscreen ? (
            <Minimize className="stroke-gray-500" />
          ) : (
            <Maximize className="stroke-gray-500" />
          )}
        </button>
        <div
          style={{
            padding: "0 10px",
            borderRadius: 6,
          }}
          className="flex items-center justify-between gap-2 border-2 border-gray-500"
        >
          <button
            onClick={() => zoomBy(1.1)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ➕
          </button>
          <span className="text-gray-800">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => zoomBy(0.9)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ➖
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasGrid;
