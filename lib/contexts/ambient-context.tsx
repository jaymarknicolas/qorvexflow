"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useTimePeriod, type TimePeriod } from "@/lib/hooks/useTimePeriod";
import { useWeather, type WeatherMode } from "@/lib/hooks/useWeather";
import { useAppSettings } from "@/lib/contexts/app-settings-context";

export type { TimePeriod } from "@/lib/hooks/useTimePeriod";
export type { WeatherMode } from "@/lib/hooks/useWeather";

export interface AmbientSettings {
  timeAmbientEnabled: boolean;
  weatherAmbientEnabled: boolean;
  weatherCity: string;
  weatherApiKey: string;
  weatherManualOverride: WeatherMode | "auto";
}

export interface AmbientContextType {
  currentTimePeriod: TimePeriod;
  currentWeather: WeatherMode | null;
  weatherLoading: boolean;
  weatherError: string | null;
  lastWeatherFetch: number | null;
  ambientSettings: AmbientSettings;
  updateAmbientSettings: (updates: Partial<AmbientSettings>) => void;
  refreshWeather: () => void;
}

const STORAGE_KEY = "qorvexflow_ambient_settings";

const defaultAmbientSettings: AmbientSettings = {
  timeAmbientEnabled: false,
  weatherAmbientEnabled: false,
  weatherCity: "",
  weatherApiKey: "",
  weatherManualOverride: "auto",
};

const AmbientContext = createContext<AmbientContextType | undefined>(undefined);

export function AmbientProvider({ children }: { children: ReactNode }) {
  const [ambientSettings, setAmbientSettings] =
    useState<AmbientSettings>(defaultAmbientSettings);
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useAppSettings();

  const isLightweight = settings.performanceMode === "lightweight";

  // Time period detection
  const currentTimePeriod = useTimePeriod();

  // Weather fetching
  const {
    weather: currentWeather,
    loading: weatherLoading,
    error: weatherError,
    lastFetch: lastWeatherFetch,
    refresh: refreshWeather,
  } = useWeather(
    ambientSettings.weatherCity,
    ambientSettings.weatherApiKey,
    ambientSettings.weatherAmbientEnabled && !isLightweight,
    ambientSettings.weatherManualOverride
  );

  // Load settings from localStorage
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAmbientSettings({ ...defaultAmbientSettings, ...parsed });
        }
      } catch (e) {
        console.error("Failed to load ambient settings:", e);
      }
    }
  }, []);

  // Apply data attributes to document
  useEffect(() => {
    if (!isMounted || typeof document === "undefined") return;

    // Time period attribute
    if (ambientSettings.timeAmbientEnabled && !isLightweight) {
      document.documentElement.setAttribute(
        "data-time-period",
        currentTimePeriod
      );
    } else {
      document.documentElement.removeAttribute("data-time-period");
    }

    // Weather attribute
    if (
      ambientSettings.weatherAmbientEnabled &&
      !isLightweight &&
      currentWeather
    ) {
      document.documentElement.setAttribute("data-weather", currentWeather);
    } else {
      document.documentElement.removeAttribute("data-weather");
    }
  }, [
    isMounted,
    ambientSettings.timeAmbientEnabled,
    ambientSettings.weatherAmbientEnabled,
    currentTimePeriod,
    currentWeather,
    isLightweight,
  ]);

  // Save settings
  const saveSettings = useCallback((newSettings: AmbientSettings) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (e) {
        console.error("Failed to save ambient settings:", e);
      }
    }
  }, []);

  const updateAmbientSettings = useCallback(
    (updates: Partial<AmbientSettings>) => {
      setAmbientSettings((prev) => {
        const newSettings = { ...prev, ...updates };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  return (
    <AmbientContext.Provider
      value={{
        currentTimePeriod,
        currentWeather,
        weatherLoading,
        weatherError,
        lastWeatherFetch,
        ambientSettings,
        updateAmbientSettings,
        refreshWeather,
      }}
    >
      {children}
    </AmbientContext.Provider>
  );
}

export function useAmbient() {
  const context = useContext(AmbientContext);
  if (context === undefined) {
    throw new Error("useAmbient must be used within an AmbientProvider");
  }
  return context;
}
