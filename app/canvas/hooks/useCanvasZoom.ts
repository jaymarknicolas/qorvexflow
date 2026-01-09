"use client";

import { useEffect, useRef, useState } from "react";
import Konva from "konva";

export default function useCanvasZoom() {
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;
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
    if (!stage) return;
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

  return { stageRef, scale, size, handleWheel, zoomBy } as const;
}
