"use client";

import { useState, useEffect } from "react";

interface ResponsiveState {
  isSmallMobile: boolean; // < 475px
  isMobile: boolean; // < 640px
  isTablet: boolean; // 640px - 1023px
  isDesktop: boolean; // >= 1024px
  width: number;
  height: number;
}

const SMALL_MOBILE_BREAKPOINT = 475;
const MOBILE_BREAKPOINT = 640; // sm
const TABLET_BREAKPOINT = 1024; // lg

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isSmallMobile: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== "undefined" ? window.innerWidth : 1440,
    height: typeof window !== "undefined" ? window.innerHeight : 900,
  });

  useEffect(() => {
    // Initial check
    const checkResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setState({
        isSmallMobile: width < SMALL_MOBILE_BREAKPOINT,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
        width,
        height,
      });
    };

    // Check on mount
    checkResponsive();

    // Listen for resize events
    const handleResize = () => {
      checkResponsive();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return state;
}
