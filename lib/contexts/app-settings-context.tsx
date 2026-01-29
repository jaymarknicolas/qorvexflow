"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type ColorScheme = "light" | "dark" | "system";
export type PerformanceMode = "balanced" | "lightweight";

export interface AppSettings {
  // Appearance
  colorScheme: ColorScheme;

  // Performance
  performanceMode: PerformanceMode;
  videoBackgroundEnabled: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;

  // Picture-in-Picture
  pipEnabled: boolean;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  enableLowSpecMode: () => void;
  disableLowSpecMode: () => void;
  isLowSpecMode: boolean;
  effectiveColorScheme: "light" | "dark";
}

const STORAGE_KEY = "qorvexflow_app_settings";

const defaultSettings: AppSettings = {
  colorScheme: "dark",
  performanceMode: "balanced",
  videoBackgroundEnabled: true,
  reducedMotion: false,
  reducedTransparency: false,
  pipEnabled: true,
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(
  undefined
);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(true);

  // Detect system color scheme preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (e) {
        console.error("Failed to load app settings:", e);
      }
    }
  }, []);

  // Calculate effective color scheme (resolves "system" to actual value)
  const effectiveColorScheme: "light" | "dark" =
    settings.colorScheme === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : settings.colorScheme;

  // Apply settings to document
  useEffect(() => {
    if (!isMounted || typeof document === "undefined") return;

    // Apply color scheme
    document.documentElement.setAttribute(
      "data-color-scheme",
      effectiveColorScheme
    );

    // Apply performance mode class
    if (settings.performanceMode === "lightweight") {
      document.documentElement.classList.add("lightweight-mode");
    } else {
      document.documentElement.classList.remove("lightweight-mode");
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }

    // Apply reduced transparency
    if (settings.reducedTransparency) {
      document.documentElement.classList.add("reduce-transparency");
    } else {
      document.documentElement.classList.remove("reduce-transparency");
    }
  }, [settings, effectiveColorScheme, isMounted]);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (e) {
        console.error("Failed to save app settings:", e);
      }
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettings((prev) => {
        const newSettings = { ...prev, ...updates };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  }, [saveSettings]);

  // Check if low-spec mode is active
  const isLowSpecMode =
    !settings.videoBackgroundEnabled &&
    settings.reducedMotion &&
    settings.reducedTransparency &&
    settings.performanceMode === "lightweight";

  // Enable low-spec mode (turns off all resource-intensive features)
  const enableLowSpecMode = useCallback(() => {
    const lowSpecSettings: AppSettings = {
      ...settings,
      videoBackgroundEnabled: false,
      reducedMotion: true,
      reducedTransparency: true,
      performanceMode: "lightweight",
    };
    setSettings(lowSpecSettings);
    saveSettings(lowSpecSettings);
  }, [settings, saveSettings]);

  // Disable low-spec mode (restore to balanced defaults)
  const disableLowSpecMode = useCallback(() => {
    const balancedSettings: AppSettings = {
      ...settings,
      videoBackgroundEnabled: true,
      reducedMotion: false,
      reducedTransparency: false,
      performanceMode: "balanced",
    };
    setSettings(balancedSettings);
    saveSettings(balancedSettings);
  }, [settings, saveSettings]);

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        enableLowSpecMode,
        disableLowSpecMode,
        isLowSpecMode,
        effectiveColorScheme,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
