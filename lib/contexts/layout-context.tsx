"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Desktop layouts
// mobile-1: 1 centered square canvas
// mobile-2: 2 stacked square canvases
// mobile-3: 1 top + 2 bottom square canvases
// mobile-4: 2x2 square canvases (tablet only)
export type LayoutType =
  | "grid-5"
  | "grid-4"
  | "grid-6"
  | "asymmetric"
  | "focus"
  | "kanban"
  | "mobile-1"
  | "mobile-2"
  | "mobile-3"
  | "mobile-4";

const ALL_LAYOUTS: LayoutType[] = [
  "grid-5", "grid-4", "grid-6", "asymmetric", "focus", "kanban",
  "mobile-1", "mobile-2", "mobile-3", "mobile-4",
];

interface LayoutContextType {
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<LayoutType>("grid-5");
  const [isMounted, setIsMounted] = useState(false);

  // Load layout from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedLayout = localStorage.getItem("qorvexflow_layout") as LayoutType;
      if (savedLayout && ALL_LAYOUTS.includes(savedLayout)) {
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
