"use client";

import { useState, useEffect, useCallback } from "react";

interface ScaleConfig {
  scale: number;
  shouldScale: boolean;
  containerWidth: number;
  containerHeight: number;
}

export function useDynamicScale(
  contentRef: React.RefObject<HTMLElement | null>,
  headerHeight: number = 80
): ScaleConfig {
  const [scaleConfig, setScaleConfig] = useState<ScaleConfig>({
    scale: 1,
    shouldScale: false,
    containerWidth: 0,
    containerHeight: 0,
  });

  const calculateScale = useCallback(() => {
    if (typeof window === "undefined" || !contentRef.current) {
      return {
        scale: 1,
        shouldScale: false,
        containerWidth: 0,
        containerHeight: 0,
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get actual content dimensions
    const contentElement = contentRef.current;
    const contentWidth = contentElement.scrollWidth;
    const contentHeight = contentElement.scrollHeight;

    // Available space (subtract header and padding)
    const availableHeight = viewportHeight - headerHeight - 32; // 32px for vertical padding
    const availableWidth = viewportWidth - 48; // 48px for horizontal padding (24px each side)

    // Calculate scale factors for both dimensions
    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;

    // Use the smaller scale to ensure content fits in both dimensions
    let calculatedScale = Math.min(scaleX, scaleY, 1); // Never scale up, only down

    // Apply minimum scale threshold
    const MIN_SCALE = 0.4; // Don't scale below 40%
    calculatedScale = Math.max(calculatedScale, MIN_SCALE);

    const shouldScale = calculatedScale < 0.98; // Apply scaling if less than 98%

    return {
      scale: calculatedScale,
      shouldScale,
      containerWidth: availableWidth,
      containerHeight: availableHeight,
    };
  }, [contentRef, headerHeight]);

  useEffect(() => {
    // Calculate on mount
    const updateScale = () => {
      const config = calculateScale();
      setScaleConfig(config);
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateScale, 100);

    // Recalculate on window resize
    const handleResize = () => {
      updateScale();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateScale]);

  return scaleConfig;
}
