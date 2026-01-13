/**
 * useResponsiveZoom Hook
 * Handles responsive scaling for zoom levels and dynamic viewport adjustments
 */

import { useState, useEffect, useCallback } from "react";

interface ZoomState {
  scale: number;
  containerWidth: number;
  containerHeight: number;
  shouldScale: boolean;
}

export function useResponsiveZoom() {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    containerWidth: 0,
    containerHeight: 0,
    shouldScale: false,
  });

  const calculateScale = useCallback(() => {
    if (typeof window === "undefined") return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const zoom = window.devicePixelRatio || 1;

    // Base dimensions (at 100% zoom)
    const baseWidth = 1440; // Desktop standard
    const baseHeight = 900;

    // Calculate if we need to scale
    const widthScale = viewportWidth / baseWidth;
    const heightScale = viewportHeight / baseHeight;

    // Use the smaller scale to ensure everything fits
    const scale = Math.min(widthScale, heightScale, 1);

    // Only scale if zoom is affecting layout (< 90% or > 110%)
    const shouldScale = zoom < 0.9 || zoom > 1.1 || scale < 0.95;

    setZoomState({
      scale: shouldScale ? scale : 1,
      containerWidth: viewportWidth,
      containerHeight: viewportHeight,
      shouldScale,
    });
  }, []);

  useEffect(() => {
    // Calculate on mount
    calculateScale();

    // Recalculate on resize and zoom
    const handleResize = () => {
      calculateScale();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Visual Viewport API for better zoom detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, [calculateScale]);

  return {
    scale: zoomState.scale,
    shouldScale: zoomState.shouldScale,
    containerWidth: zoomState.containerWidth,
    containerHeight: zoomState.containerHeight,
    // Helper to apply scale transform
    getScaleStyle: () => ({
      transform: zoomState.shouldScale ? `scale(${zoomState.scale})` : "none",
      transformOrigin: "top center",
      width: zoomState.shouldScale ? `${100 / zoomState.scale}%` : "100%",
    }),
  };
}
