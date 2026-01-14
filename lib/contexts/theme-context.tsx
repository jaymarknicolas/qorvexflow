"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type ThemeType = "neon" | "lofi" | "ghibli";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("lofi");
  const [isMounted, setIsMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("qorvexflow_theme") as ThemeType;
      if (savedTheme && ["neon", "lofi", "ghibli"].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  // Save theme to localStorage and apply to document
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("qorvexflow_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  // Apply theme on mount and when it changes
  useEffect(() => {
    if (isMounted && typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, isMounted]);

  // Always provide the context, even before mounting (fixes SSR/hydration error)
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
