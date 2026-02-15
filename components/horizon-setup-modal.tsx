"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CloudSun, RefreshCw, X, Check } from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAmbient } from "@/lib/contexts/ambient-context";
import LocationPicker from "@/components/location-picker";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "qorvexflow_horizon_setup_dismissed";

export default function HorizonSetupModal() {
  const { theme } = useTheme();
  const {
    ambientSettings,
    updateAmbientSettings,
    currentWeather,
    weatherLoading,
    weatherError,
    refreshWeather,
    currentTimePeriod,
  } = useAmbient();

  const [isVisible, setIsVisible] = useState(false);
  const prevThemeRef = useRef(theme);
  const ambientSettingsRef = useRef(ambientSettings);
  ambientSettingsRef.current = ambientSettings;

  // Only show modal when theme TRANSITIONS to "horizon" with no location set.
  // Does NOT re-trigger when location is cleared/changed in settings.
  useEffect(() => {
    const didJustSwitchToHorizon =
      prevThemeRef.current !== "horizon" && theme === "horizon";
    prevThemeRef.current = theme;

    if (!didJustSwitchToHorizon) return;

    const settings = ambientSettingsRef.current;
    const hasLocation =
      !!settings.weatherCity || settings.weatherLat !== null;
    const wasDismissed =
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISSED_KEY) === "true";

    if (!hasLocation && !wasDismissed) {
      // Small delay so the theme transition plays first
      const t = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [theme]);

  // Auto-close once location is confirmed and weather is loaded
  const hasLocation =
    !!ambientSettings.weatherCity || ambientSettings.weatherLat !== null;

  const handleDone = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISSED_KEY, "true");
    }
    setIsVisible(false);
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISSED_KEY, "true");
    }
    setIsVisible(false);
  };

  // Reset dismissed state when theme changes away and back
  useEffect(() => {
    if (theme !== "horizon" && typeof window !== "undefined") {
      localStorage.removeItem(DISMISSED_KEY);
    }
  }, [theme]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="horizon-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            key="horizon-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md">
              {/* Card */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-sky-500/10">

                {/* Gradient header strip */}
                <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-sky-400 to-violet-500" />

                {/* Close button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 via-sky-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                      <CloudSun className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Set Your Location
                      </h2>
                      <p className="text-sm text-white/50 mt-0.5 leading-relaxed">
                        Horizon adapts to your real weather. Set a location so the theme can read live conditions.
                      </p>
                    </div>
                  </div>

                  {/* Live preview badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 via-sky-500/10 to-violet-500/10 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-xs text-white/50">
                      {currentWeather
                        ? <>Current weather: <span className="text-sky-400 font-medium capitalize">{currentWeather}</span></>
                        : weatherLoading
                        ? "Fetching weather…"
                        : hasLocation
                        ? "Waiting for data…"
                        : "No location set — theme using time-only mode"}
                    </span>
                  </div>

                  {/* Location picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Your City
                    </label>
                    <LocationPicker
                      value={ambientSettings.weatherCity}
                      lat={ambientSettings.weatherLat}
                      lon={ambientSettings.weatherLon}
                      accentText="text-sky-400"
                      onSelect={(city, lat, lon) =>
                        updateAmbientSettings({
                          weatherCity: city,
                          weatherLat: lat,
                          weatherLon: lon,
                        })
                      }
                      onClear={() =>
                        updateAmbientSettings({
                          weatherCity: "",
                          weatherLat: null,
                          weatherLon: null,
                        })
                      }
                    />
                  </div>

                  {/* Weather override */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                      Weather Override
                    </label>
                    <select
                      value={ambientSettings.weatherManualOverride}
                      onChange={(e) =>
                        updateAmbientSettings({
                          weatherManualOverride: e.target.value as
                            | "auto"
                            | "rain"
                            | "sunny"
                            | "cloudy"
                            | "snow",
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/15 rounded-lg text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                      <option value="auto" className="bg-gray-800">Auto (from API)</option>
                      {(currentTimePeriod === "day" || currentTimePeriod === "dawn") && (
                        <option value="sunny" className="bg-gray-800">Sunny</option>
                      )}
                      <option value="cloudy" className="bg-gray-800">Cloudy</option>
                      <option value="rain" className="bg-gray-800">Rain</option>
                      <option value="snow" className="bg-gray-800">Snow</option>
                    </select>
                  </div>

                  {/* Weather status row */}
                  {ambientSettings.weatherManualOverride === "auto" && hasLocation && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-xs text-white/50">
                        {weatherLoading && "Fetching weather…"}
                        {weatherError && (
                          <span className="text-red-400">{weatherError}</span>
                        )}
                        {!weatherLoading && !weatherError && currentWeather && (
                          <>Current: <span className="text-sky-400 font-medium capitalize">{currentWeather}</span></>
                        )}
                        {!weatherLoading && !weatherError && !currentWeather && "Waiting for data…"}
                      </span>
                      <button
                        onClick={refreshWeather}
                        disabled={weatherLoading}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <RefreshCw
                          className={cn(
                            "w-3.5 h-3.5 text-white/40",
                            weatherLoading && "animate-spin"
                          )}
                        />
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10 transition-all"
                    >
                      Skip for now
                    </button>
                    <button
                      onClick={handleDone}
                      disabled={!hasLocation}
                      className={cn(
                        "flex-1 px-4 py-2.5 text-sm rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                        hasLocation
                          ? "bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 text-white shadow-lg shadow-sky-500/20"
                          : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
