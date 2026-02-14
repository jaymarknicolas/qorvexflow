"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type WeatherMode = "rain" | "sunny" | "cloudy" | "snow";

interface UseWeatherResult {
  weather: WeatherMode | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  refresh: () => void;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

function mapWeatherCode(code: number): WeatherMode {
  if (code >= 200 && code < 400) return "rain"; // Thunderstorm, Drizzle
  if (code >= 500 && code < 600) return "rain"; // Rain
  if (code >= 600 && code < 700) return "snow"; // Snow
  if (code >= 700 && code < 800) return "cloudy"; // Atmosphere (fog, haze)
  if (code === 800) return "sunny"; // Clear
  return "cloudy"; // Clouds (801-804)
}

export function useWeather(
  city: string,
  apiKey: string,
  enabled: boolean,
  manualOverride: WeatherMode | "auto"
): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const cacheRef = useRef<{ weather: WeatherMode; timestamp: number; city: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city.trim() || !apiKey.trim()) {
      setError("City and API key are required");
      setWeather(null);
      return;
    }

    // Check cache
    const cache = cacheRef.current;
    if (
      cache &&
      cache.city === city.trim() &&
      Date.now() - cache.timestamp < CACHE_DURATION
    ) {
      setWeather(cache.weather);
      setLastFetch(cache.timestamp);
      return;
    }

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${apiKey.trim()}&units=metric`;
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      const weatherCode = data.weather?.[0]?.id;

      if (typeof weatherCode !== "number") {
        throw new Error("Invalid weather data received");
      }

      const mapped = mapWeatherCode(weatherCode);
      const now = Date.now();

      cacheRef.current = { weather: mapped, timestamp: now, city: city.trim() };
      setWeather(mapped);
      setLastFetch(now);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }, [city, apiKey]);

  // Handle manual override
  useEffect(() => {
    if (manualOverride !== "auto") {
      setWeather(manualOverride);
      setError(null);
      setLoading(false);
      return;
    }

    if (!enabled) {
      setWeather(null);
      return;
    }

    fetchWeather();

    // Refetch every 15 minutes
    const interval = setInterval(fetchWeather, CACHE_DURATION);
    return () => {
      clearInterval(interval);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [enabled, manualOverride, fetchWeather]);

  return { weather, loading, error, lastFetch, refresh: fetchWeather };
}
