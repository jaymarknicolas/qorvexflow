"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { WidgetType } from "@/types";
import type { WidgetSettings } from "@/types/widget-settings";
import { DEFAULT_WIDGET_SETTINGS } from "@/types/widget-settings";

interface WidgetSettingsContextType {
  settings: WidgetSettings;
  getSettings: <T extends WidgetType>(widgetType: T) => WidgetSettings[T];
  updateSettings: <T extends WidgetType>(
    widgetType: T,
    newSettings: Partial<WidgetSettings[T]>
  ) => void;
  resetSettings: <T extends WidgetType>(widgetType: T) => void;
  resetAllSettings: () => void;
}

const WidgetSettingsContext = createContext<WidgetSettingsContextType | undefined>(undefined);

const STORAGE_KEY = "qorvexflow_widget_settings";

export function WidgetSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_WIDGET_SETTINGS);
  const [isMounted, setIsMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Merge with defaults to handle new settings
          setSettings({
            ...DEFAULT_WIDGET_SETTINGS,
            ...parsed,
          });
        }
      } catch (error) {
        console.error("Failed to load widget settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save widget settings:", error);
      }
    }
  }, [settings, isMounted]);

  const getSettings = <T extends WidgetType>(widgetType: T): WidgetSettings[T] => {
    return settings[widgetType];
  };

  const updateSettings = <T extends WidgetType>(
    widgetType: T,
    newSettings: Partial<WidgetSettings[T]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [widgetType]: {
        ...prev[widgetType],
        ...newSettings,
      },
    }));
  };

  const resetSettings = <T extends WidgetType>(widgetType: T) => {
    setSettings((prev) => ({
      ...prev,
      [widgetType]: DEFAULT_WIDGET_SETTINGS[widgetType],
    }));
  };

  const resetAllSettings = () => {
    setSettings(DEFAULT_WIDGET_SETTINGS);
  };

  return (
    <WidgetSettingsContext.Provider
      value={{
        settings,
        getSettings,
        updateSettings,
        resetSettings,
        resetAllSettings,
      }}
    >
      {children}
    </WidgetSettingsContext.Provider>
  );
}

export function useWidgetSettings() {
  const context = useContext(WidgetSettingsContext);
  if (context === undefined) {
    throw new Error("useWidgetSettings must be used within a WidgetSettingsProvider");
  }
  return context;
}
