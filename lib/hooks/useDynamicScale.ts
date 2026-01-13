import { useState, useEffect } from "react";

interface ScaleConfig {
  scale: number;
  shouldScale: boolean;
}

export function useDynamicScale(contentHeight: number, threshold: number = 0.9): ScaleConfig {
  const [scale, setScale] = useState(1);
  const [shouldScale, setShouldScale] = useState(false);

  useEffect(() => {
    const calculateScale = () => {
      if (typeof window === "undefined") return;

      // Get available height (viewport height minus header and padding)
      const viewportHeight = window.innerHeight;
      const headerHeight = 80; // Approximate header height
      const padding = 48; // Top and bottom padding
      const availableHeight = viewportHeight - headerHeight - padding;

      // Check if content exceeds threshold of available space
      if (contentHeight > availableHeight * threshold) {
        // Calculate scale to fit content
        const calculatedScale = (availableHeight * threshold) / contentHeight;
        setScale(Math.max(0.5, Math.min(calculatedScale, 1))); // Clamp between 0.5 and 1
        setShouldScale(true);
      } else {
        setScale(1);
        setShouldScale(false);
      }
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);

    return () => window.removeEventListener("resize", calculateScale);
  }, [contentHeight, threshold]);

  return { scale, shouldScale };
}
