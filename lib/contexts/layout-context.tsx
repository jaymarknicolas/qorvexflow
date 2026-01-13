"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type LayoutType = "default" | "grid-3x3" | "grid-2x3" | "single-focus" | "dual-column" | "triple-row";

interface LayoutContextType {
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<LayoutType>("default");
  const [isMounted, setIsMounted] = useState(false);

  // Load layout from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedLayout = localStorage.getItem("qorvexflow_layout") as LayoutType;
      if (savedLayout && ["default", "grid-3x3", "grid-2x3", "single-focus", "dual-column", "triple-row"].includes(savedLayout)) {
        setLayoutState(savedLayout);
      }
    }
  }, []);

  // Save layout to localStorage
  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout);
    if (typeof window !== "undefined") {
      localStorage.setItem("qorvexflow_layout", newLayout);
    }
  };

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
