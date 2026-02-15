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
import { useTheme } from "@/lib/contexts/theme-context";

export type { TimePeriod } from "@/lib/hooks/useTimePeriod";
export type { WeatherMode } from "@/lib/hooks/useWeather";

export interface AmbientSettings {
  timeAmbientEnabled: boolean;
  weatherAmbientEnabled: boolean;
  weatherCity: string;
  weatherLat: number | null;
  weatherLon: number | null;
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
  isTimeThemeActive: boolean;
  isWeatherThemeActive: boolean;
  isHorizonThemeActive: boolean;
}

const STORAGE_KEY = "qorvexflow_ambient_settings";

const defaultAmbientSettings: AmbientSettings = {
  timeAmbientEnabled: false,
  weatherAmbientEnabled: false,
  weatherCity: "",
  weatherLat: null,
  weatherLon: null,
  weatherManualOverride: "auto",
};

const AmbientContext = createContext<AmbientContextType | undefined>(undefined);

export function AmbientProvider({ children }: { children: ReactNode }) {
  const [ambientSettings, setAmbientSettings] =
    useState<AmbientSettings>(defaultAmbientSettings);
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useAppSettings();
  const { theme } = useTheme();

  const isLightweight = settings.performanceMode === "lightweight";

  // Check if using dedicated time/weather/horizon themes
  const isHorizonThemeActive = theme === "horizon";
  const isTimeThemeActive = theme === "horizon";
  const isWeatherThemeActive = theme === "horizon";

  // Time period detection
  const currentTimePeriod = useTimePeriod();

  // Weather fetching - auto-enable when weather theme is selected
  const weatherEnabled =
    (ambientSettings.weatherAmbientEnabled || isWeatherThemeActive) &&
    !isLightweight;

  const {
    weather: currentWeather,
    loading: weatherLoading,
    error: weatherError,
    lastFetch: lastWeatherFetch,
    refresh: refreshWeather,
  } = useWeather(
    ambientSettings.weatherCity,
    weatherEnabled,
    ambientSettings.weatherManualOverride,
    ambientSettings.weatherLat,
    ambientSettings.weatherLon
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

    // Time period attribute - active when toggle is on OR timebased theme is selected
    const timeActive =
      (ambientSettings.timeAmbientEnabled || isTimeThemeActive) &&
      !isLightweight;

    if (timeActive) {
      document.documentElement.setAttribute(
        "data-time-period",
        currentTimePeriod
      );
    } else {
      document.documentElement.removeAttribute("data-time-period");
    }

    // Weather attribute - active when toggle is on OR weather theme is selected
    const weatherActive =
      (ambientSettings.weatherAmbientEnabled || isWeatherThemeActive) &&
      !isLightweight &&
      currentWeather;

    if (weatherActive) {
      document.documentElement.setAttribute("data-weather", currentWeather!);
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
    isTimeThemeActive,
    isWeatherThemeActive,
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
        isTimeThemeActive,
        isWeatherThemeActive,
        isHorizonThemeActive,
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
