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

// Open-Meteo WMO weather codes mapping
function mapWMOCode(code: number): WeatherMode {
  if (code === 0) return "sunny";
  if (code <= 3) return "cloudy";
  if (code === 45 || code === 48) return "cloudy";
  if (code >= 51 && code <= 57) return "rain";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code === 85 || code === 86) return "snow";
  if (code >= 95) return "rain";
  return "cloudy";
}

export function useWeather(
  city: string,
  enabled: boolean,
  manualOverride: WeatherMode | "auto",
  lat?: number | null,
  lon?: number | null
): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const cacheRef = useRef<{
    weather: WeatherMode;
    timestamp: number;
    key: string;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchWeather = useCallback(async () => {
    const hasCoords = lat != null && lon != null;
    const hasCity = city.trim().length > 0;

    if (!hasCoords && !hasCity) {
      setError("Set a location to get weather");
      setWeather(null);
      return;
    }

    // Cache key based on coords or city
    const cacheKey = hasCoords ? `${lat},${lon}` : city.trim();

    // Check cache
    const cache = cacheRef.current;
    if (
      cache &&
      cache.key === cacheKey &&
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
      let latitude = lat;
      let longitude = lon;

      // If no coordinates, geocode the city name
      if (!hasCoords && hasCity) {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl, { signal: controller.signal });

        if (!geoRes.ok) {
          throw new Error("Failed to geocode city");
        }

        const geoData = await geoRes.json();
        const location = geoData.results?.[0];

        if (!location) {
          throw new Error(`City "${city.trim()}" not found`);
        }

        latitude = location.latitude;
        longitude = location.longitude;
      }

      // Fetch current weather from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,temperature_2m`;
      const weatherRes = await fetch(weatherUrl, { signal: controller.signal });

      if (!weatherRes.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const weatherData = await weatherRes.json();
      const weatherCode = weatherData.current?.weather_code;

      if (typeof weatherCode !== "number") {
        throw new Error("Invalid weather data received");
      }

      const mapped = mapWMOCode(weatherCode);
      const now = Date.now();

      cacheRef.current = {
        weather: mapped,
        timestamp: now,
        key: cacheKey,
      };
      setWeather(mapped);
      setLastFetch(now);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }, [city, lat, lon]);

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
