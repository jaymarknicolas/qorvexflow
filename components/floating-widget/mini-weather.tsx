"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  Loader2,
  CloudSun,
} from "lucide-react";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";
import { useAmbient } from "@/lib/contexts/ambient-context";
import { cn } from "@/lib/utils";

interface ForecastDay {
  date: string;
  dayLabel: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
}

interface CurrentConditions {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
}

function mapWMOCode(code: number): {
  label: string;
  icon: "sunny" | "cloudy" | "rain" | "snow";
} {
  if (code === 0) return { label: "Clear", icon: "sunny" };
  if (code <= 2) return { label: "Partly Cloudy", icon: "cloudy" };
  if (code === 3) return { label: "Overcast", icon: "cloudy" };
  if (code === 45 || code === 48) return { label: "Foggy", icon: "cloudy" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain Showers", icon: "rain" };
  if (code === 85 || code === 86) return { label: "Snow Showers", icon: "snow" };
  if (code >= 95) return { label: "Thunderstorm", icon: "rain" };
  return { label: "Cloudy", icon: "cloudy" };
}

function WeatherIcon({
  code,
  className,
}: {
  code: number;
  className?: string;
}) {
  const { icon } = mapWMOCode(code);
  switch (icon) {
    case "sunny":
      return <Sun className={className} />;
    case "rain":
      return <CloudRain className={className} />;
    case "snow":
      return <CloudSnow className={className} />;
    default:
      return <Cloud className={className} />;
  }
}

function getWeatherIconColor(code: number): string {
  const { icon } = mapWMOCode(code);
  switch (icon) {
    case "sunny":
      return "text-amber-400";
    case "rain":
      return "text-sky-400";
    case "snow":
      return "text-blue-300";
    default:
      return "text-slate-400";
  }
}

export default function MiniWeather() {
  const colors = useWidgetTheme();
  const { ambientSettings, updateAmbientSettings } = useAmbient();

  const [current, setCurrent] = useState<CurrentConditions | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const hasLocation =
    !!ambientSettings.weatherCity || ambientSettings.weatherLat !== null;

  const fetchForecast = useCallback(async () => {
    if (!hasLocation) return;

    const lat = ambientSettings.weatherLat;
    const lon = ambientSettings.weatherLon;
    const city = ambientSettings.weatherCity;

    setLoading(true);
    setError(null);

    try {
      let latitude = lat;
      let longitude = lon;

      // Geocode city if no coords
      if (!latitude || !longitude) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();
        const loc = geoData.results?.[0];
        if (!loc) throw new Error("City not found");
        latitude = loc.latitude;
        longitude = loc.longitude;
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch forecast");

      const data = await res.json();

      // Current conditions
      const cur = data.current;
      const { label: desc } = mapWMOCode(cur.weather_code);
      setCurrent({
        temp: Math.round(cur.temperature_2m),
        feelsLike: Math.round(cur.apparent_temperature),
        humidity: Math.round(cur.relative_humidity_2m),
        windSpeed: Math.round(cur.wind_speed_10m),
        weatherCode: cur.weather_code,
        description: desc,
      });

      // 5-day forecast
      const daily = data.daily;
      const days: ForecastDay[] = (daily.time as string[]).map(
        (dateStr: string, i: number) => {
          const date = new Date(dateStr);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diff = Math.round(
            (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          const dayLabel =
            diff === 0
              ? "Today"
              : diff === 1
              ? "Tmrw"
              : date.toLocaleDateString("en-US", { weekday: "short" });

          return {
            date: dateStr,
            dayLabel,
            weatherCode: daily.weather_code[i],
            tempMax: Math.round(daily.temperature_2m_max[i]),
            tempMin: Math.round(daily.temperature_2m_min[i]),
            precipProb: Math.round(daily.precipitation_probability_max[i] ?? 0),
          };
        }
      );
      setForecast(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }, [
    hasLocation,
    ambientSettings.weatherLat,
    ambientSettings.weatherLon,
    ambientSettings.weatherCity,
  ]);

  useEffect(() => {
    if (hasLocation) {
      fetchForecast();
    } else {
      setShowLocationPrompt(true);
    }
  }, [hasLocation, fetchForecast]);

  // Location prompt when no location set
  if (showLocationPrompt && !hasLocation) {
    return (
      <div
        className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border}`}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`p-1 rounded-lg ${colors.accentBg}`}>
            <CloudSun className={`w-3.5 h-3.5 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-sm font-bold ${colors.textPrimary}`}>Weather</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-2">
          <div className={`p-3 rounded-xl ${colors.accentBg}`}>
            <MapPin className={`w-6 h-6 ${colors.iconColor}`} />
          </div>
          <div>
            <p className={`text-xs font-medium ${colors.textPrimary} mb-1`}>
              No location set
            </p>
            <p className={`text-[10px] ${colors.textMuted} leading-relaxed`}>
              Set your location to see live weather forecasts
            </p>
          </div>
          <LocationInlineInput
            colors={colors}
            onSelect={(city, lat, lon) => {
              updateAmbientSettings({
                weatherCity: city,
                weatherLat: lat,
                weatherLon: lon,
              });
              setShowLocationPrompt(false);
            }}
          />
        </div>
      </div>
    );
  }

  if (loading && !current) {
    return (
      <div
        className={`flex flex-col h-full p-3 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} items-center justify-center gap-2`}
      >
        <Loader2 className={`w-5 h-5 ${colors.iconColor} animate-spin`} />
        <p className={`text-xs ${colors.textMuted}`}>Loading weather…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col h-full p-3 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} items-center justify-center gap-2`}
      >
        <p className="text-xs text-red-400">{error}</p>
        <button
          onClick={fetchForecast}
          className={`text-xs ${colors.accent} ${colors.buttonBg} px-3 py-1 rounded-lg transition-colors`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${colors.accentBg}`}>
            <CloudSun className={`w-3.5 h-3.5 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-sm font-bold ${colors.textPrimary}`}>Weather</h2>
        </div>
        <button
          onClick={fetchForecast}
          disabled={loading}
          className={`p-1 rounded-lg ${colors.hoverBg} transition-colors`}
          title="Refresh"
        >
          <RefreshCw
            className={cn(`w-3 h-3 ${colors.textMuted}`, loading && "animate-spin")}
          />
        </button>
      </div>

      {/* Location label */}
      {ambientSettings.weatherCity && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <MapPin className={`w-2.5 h-2.5 ${colors.textMuted}`} />
          <p className={`text-[10px] ${colors.textMuted} truncate`}>
            {ambientSettings.weatherCity}
          </p>
        </div>
      )}

      {/* Current conditions */}
      {current && (
        <div
          className={`flex items-center justify-between p-2 rounded-xl ${colors.accentBg} border ${colors.border} flex-shrink-0`}
        >
          <div className="flex items-center gap-2">
            <WeatherIcon
              code={current.weatherCode}
              className={`w-7 h-7 ${getWeatherIconColor(current.weatherCode)}`}
            />
            <div>
              <p className={`text-xl font-bold ${colors.textPrimary} leading-none`}>
                {current.temp}°
              </p>
              <p className={`text-[10px] ${colors.textMuted} leading-none mt-0.5`}>
                {current.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1">
              <Thermometer className={`w-2.5 h-2.5 ${colors.textMuted}`} />
              <span className={`text-[10px] ${colors.textMuted}`}>
                Feels {current.feelsLike}°
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className={`w-2.5 h-2.5 text-sky-400`} />
              <span className={`text-[10px] ${colors.textMuted}`}>
                {current.humidity}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className={`w-2.5 h-2.5 ${colors.textMuted}`} />
              <span className={`text-[10px] ${colors.textMuted}`}>
                {current.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5-day forecast */}
      {forecast.length > 0 && (
        <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-hidden">
          {forecast.map((day) => (
            <div
              key={day.date}
              className={`flex items-center justify-between px-2 py-1 rounded-lg ${colors.hoverBg} transition-colors flex-shrink-0`}
            >
              <span className={`text-[10px] w-8 ${colors.textMuted}`}>
                {day.dayLabel}
              </span>
              <WeatherIcon
                code={day.weatherCode}
                className={`w-3.5 h-3.5 ${getWeatherIconColor(day.weatherCode)}`}
              />
              {day.precipProb > 0 && (
                <span className="text-[9px] text-sky-400 w-6 text-center">
                  {day.precipProb}%
                </span>
              )}
              {day.precipProb === 0 && (
                <span className="w-6" />
              )}
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-medium ${colors.textPrimary}`}>
                  {day.tempMax}°
                </span>
                <span className={`text-[10px] ${colors.textMuted}`}>
                  {day.tempMin}°
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline mini location search for when no location is set
function LocationInlineInput({
  colors,
  onSelect,
}: {
  colors: ReturnType<typeof useWidgetTheme>;
  onSelect: (city: string, lat: number, lon: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: number; name: string; country: string; admin1?: string; latitude: number; longitude: number }[]
  >([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=4&language=en&format=json`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="w-full relative">
      <div className="relative">
        <MapPin className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${colors.textMuted}`} />
        {searching && (
          <Loader2 className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${colors.textMuted} animate-spin`} />
        )}
        <input
          type="text"
          placeholder="Search city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full pl-6 pr-6 py-1.5 text-xs rounded-lg border ${colors.border} bg-black/20 text-white placeholder-white/30 focus:outline-none focus:border-sky-400/50 transition-colors`}
        />
      </div>
      {results.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border ${colors.border} bg-slate-900/95 backdrop-blur-xl shadow-xl overflow-hidden`}>
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                const name = r.admin1
                  ? `${r.name}, ${r.admin1}, ${r.country}`
                  : `${r.name}, ${r.country}`;
                onSelect(name, r.latitude, r.longitude);
              }}
              className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-left text-xs hover:bg-white/10 transition-colors border-b border-white/5 last:border-0`}
            >
              <MapPin className={`w-2.5 h-2.5 flex-shrink-0 ${colors.iconColor}`} />
              <span className="text-white truncate">{r.name}</span>
              <span className={`${colors.textMuted} truncate`}>
                {r.admin1 ? `${r.admin1}, ` : ""}{r.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
