"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useFocusTracker, UseFocusTrackerReturn } from "@/lib/hooks/useFocusTracker";

const FocusTrackerContext = createContext<UseFocusTrackerReturn | null>(null);

export function FocusTrackerProvider({ children }: { children: ReactNode }) {
  const focusTracker = useFocusTracker();

  return (
    <FocusTrackerContext.Provider value={focusTracker}>
      {children}
    </FocusTrackerContext.Provider>
  );
}

export function useFocusTrackerContext(): UseFocusTrackerReturn {
  const context = useContext(FocusTrackerContext);
  if (!context) {
    throw new Error("useFocusTrackerContext must be used within FocusTrackerProvider");
  }
  return context;
}
