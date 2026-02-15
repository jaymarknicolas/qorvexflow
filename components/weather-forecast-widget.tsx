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
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useAmbient } from "@/lib/contexts/ambient-context";
import { cn } from "@/lib/utils";
import LocationPicker from "@/components/location-picker";

interface ForecastDay {
  date: string;
  dayLabel: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  windMax: number;
}

interface HourlyForecast {
  time: string;
  temp: number;
  weatherCode: number;
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
  if (code === 0) return { label: "Clear Sky", icon: "sunny" };
  if (code <= 2) return { label: "Partly Cloudy", icon: "cloudy" };
  if (code === 3) return { label: "Overcast", icon: "cloudy" };
  if (code === 45 || code === 48) return { label: "Foggy", icon: "cloudy" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain Showers", icon: "rain" };
  if (code === 85 || code === 86)
    return { label: "Snow Showers", icon: "snow" };
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

export default function WeatherForecastWidget() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
  const { ambientSettings, updateAmbientSettings } = useAmbient();

  const [current, setCurrent] = useState<CurrentConditions | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLocation =
    !!ambientSettings.weatherCity || ambientSettings.weatherLat !== null;

  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
          iconColor: isLightMode ? "text-green-700" : "text-emerald-400",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800" : "text-white/80",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-green-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-green-100/60" : "bg-white/5",
          cardBg: isLightMode ? "bg-green-100/80" : "bg-emerald-900/40",
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          iconColor: isLightMode ? "text-amber-700" : "text-amber-400",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-900" : "text-white/80",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-amber-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-amber-100/60" : "bg-white/5",
          cardBg: isLightMode ? "bg-amber-100/80" : "bg-amber-900/30",
        };
      case "horizon":
        return {
          gradient: isLightMode
            ? "from-sky-50/95 via-orange-50/90 to-violet-50/95"
            : "from-slate-900/95 via-sky-950/90 to-violet-950/95",
          accent: isLightMode ? "text-sky-700" : "text-sky-400",
          accentBg: isLightMode ? "bg-sky-200/50" : "bg-sky-500/20",
          border: isLightMode ? "border-sky-300/50" : "border-sky-500/20",
          iconColor: isLightMode ? "text-sky-700" : "text-sky-400",
          textPrimary: isLightMode ? "text-slate-900" : "text-white",
          textSecondary: isLightMode ? "text-slate-800" : "text-white/80",
          textMuted: isLightMode ? "text-slate-600/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-sky-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-sky-100/60" : "bg-white/5",
          cardBg: isLightMode ? "bg-sky-100/80" : "bg-sky-900/30",
        };
      default: // lofi
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          iconColor: isLightMode ? "text-violet-700" : "text-violet-400",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-900" : "text-white/80",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-violet-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-violet-100/60" : "bg-white/5",
          cardBg: isLightMode ? "bg-violet-100/80" : "bg-violet-900/30",
        };
    }
  }, [theme, isLightMode]);

  const colors = getThemeColors();

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

      if (!latitude || !longitude) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`,
        );
        const geoData = await geoRes.json();
        const loc = geoData.results?.[0];
        if (!loc) throw new Error("City not found");
        latitude = loc.latitude;
        longitude = loc.longitude;
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7&forecast_hours=24`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch forecast");

      const data = await res.json();

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

      // Next 8 hours
      const now = new Date();
      const nowHour = now.getHours();
      const hourlyData: HourlyForecast[] = [];
      for (let i = 0; i < 8; i++) {
        const idx = nowHour + i;
        if (idx < (data.hourly.time as string[]).length) {
          const timeStr = data.hourly.time[idx] as string;
          const hour = new Date(timeStr).getHours();
          hourlyData.push({
            time:
              hour === 0
                ? "12am"
                : hour < 12
                  ? `${hour}am`
                  : hour === 12
                    ? "12pm"
                    : `${hour - 12}pm`,
            temp: Math.round(data.hourly.temperature_2m[idx]),
            weatherCode: data.hourly.weather_code[idx],
          });
        }
      }
      setHourly(hourlyData);

      const daily = data.daily;
      const days: ForecastDay[] = (daily.time as string[]).map(
        (dateStr: string, i: number) => {
          const date = new Date(dateStr);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diff = Math.round(
            (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          const dayLabel =
            diff === 0
              ? "Today"
              : diff === 1
                ? "Tomorrow"
                : date.toLocaleDateString("en-US", { weekday: "long" });

          return {
            date: dateStr,
            dayLabel,
            weatherCode: daily.weather_code[i],
            tempMax: Math.round(daily.temperature_2m_max[i]),
            tempMin: Math.round(daily.temperature_2m_min[i]),
            precipProb: Math.round(daily.precipitation_probability_max[i] ?? 0),
            windMax: Math.round(daily.wind_speed_10m_max[i] ?? 0),
          };
        },
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
    }
  }, [hasLocation, fetchForecast]);

  // No location set — show setup prompt
  if (!hasLocation) {
    return (
      <div
        className={`flex flex-col h-full p-5 gap-4 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${colors.accentBg}`}>
            <CloudSun className={`w-5 h-5 ${colors.iconColor}`} />
          </div>
          <div>
            <h2 className={`text-base font-bold ${colors.textPrimary}`}>
              Weather Forecast
            </h2>
            <p className={`text-xs ${colors.textMuted}`}>
              Live weather conditions
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className={`p-4 rounded-2xl ${colors.accentBg}`}>
            <MapPin className={`w-8 h-8 ${colors.iconColor}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${colors.textPrimary} mb-1`}>
              Set your location
            </p>
            <p
              className={`text-xs ${colors.textMuted} max-w-xs leading-relaxed`}
            >
              Search for your city to get live weather forecasts and conditions
            </p>
          </div>
          <div className="w-full max-w-sm">
            <LocationPicker
              value={ambientSettings.weatherCity}
              lat={ambientSettings.weatherLat}
              lon={ambientSettings.weatherLon}
              accentText={colors.iconColor}
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
        </div>
      </div>
    );
  }

  if (loading && !current) {
    return (
      <div
        className={`flex flex-col h-full items-center justify-center gap-3 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl`}
      >
        <Loader2 className={`w-8 h-8 ${colors.iconColor} animate-spin`} />
        <p className={`text-sm ${colors.textMuted}`}>Loading weather…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col h-full items-center justify-center gap-3 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-5`}
      >
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={fetchForecast}
          className={`text-sm ${colors.accent} ${colors.accentBg} px-4 py-2 rounded-xl transition-colors`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full p-4 gap-3 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl ${colors.accentBg}`}>
            <CloudSun className={`w-4 h-4 ${colors.iconColor}`} />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${colors.textPrimary}`}>
              Weather Forecast
            </h2>
            {ambientSettings.weatherCity && (
              <div className="flex items-center gap-1">
                <MapPin className={`w-2.5 h-2.5 ${colors.textMuted}`} />
                <p
                  className={`text-[10px] ${colors.textMuted} truncate max-w-[160px]`}
                >
                  {ambientSettings.weatherCity}
                </p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={fetchForecast}
          disabled={loading}
          className={`p-1.5 rounded-lg ${colors.hoverBg} transition-colors`}
          title="Refresh"
        >
          <RefreshCw
            className={cn(
              `w-3.5 h-3.5 ${colors.textMuted}`,
              loading && "animate-spin",
            )}
          />
        </button>
      </div>

      {/* Current conditions */}
      {current && (
        <div
          className={`flex items-center justify-between p-3 rounded-2xl ${colors.cardBg} border ${colors.border} flex-shrink-0`}
        >
          <div className="flex items-center gap-3">
            <WeatherIcon
              code={current.weatherCode}
              className={`w-10 h-10 ${getWeatherIconColor(current.weatherCode)}`}
            />
            <div>
              <p
                className={`text-3xl font-bold ${colors.textPrimary} leading-none`}
              >
                {current.temp}°C
              </p>
              <p className={`text-xs ${colors.textMuted} mt-0.5`}>
                {current.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Thermometer className={`w-3 h-3 ${colors.textMuted}`} />
              <span className={`text-xs ${colors.textSecondary}`}>
                Feels like {current.feelsLike}°
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3 h-3 text-sky-400" />
              <span className={`text-xs ${colors.textSecondary}`}>
                {current.humidity}% humidity
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className={`w-3 h-3 ${colors.textMuted}`} />
              <span className={`text-xs ${colors.textSecondary}`}>
                {current.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hourly forecast */}
      {hourly.length > 0 && (
        <div className="flex-shrink-0">
          <p
            className={`text-[10px] font-medium uppercase tracking-wider ${colors.textMuted} mb-1.5`}
          >
            Next 8 Hours
          </p>
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {hourly.map((h, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-1 flex-shrink-0 px-2 py-1.5 rounded-xl ${colors.surfaceBg} min-w-[44px]`}
              >
                <span className={`text-[9px] ${colors.textMuted}`}>
                  {h.time}
                </span>
                <WeatherIcon
                  code={h.weatherCode}
                  className={`w-3.5 h-3.5 ${getWeatherIconColor(h.weatherCode)}`}
                />
                <span className={`text-xs font-medium ${colors.textPrimary}`}>
                  {h.temp}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-day forecast */}
      {forecast.length > 0 && (
        <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-hidden">
          <p
            className={`text-[10px] font-medium uppercase tracking-wider ${colors.textMuted} flex-shrink-0`}
          >
            7-Day Forecast
          </p>
          <div className="flex flex-col gap-1 overflow-x-hidden overflow-y-auto">
            {forecast.map((day) => (
              <div
                key={day.date}
                className={`flex items-center gap-3 justify-between px-3 py-1.5 rounded-xl ${colors.hoverBg} transition-colors flex-shrink-0`}
              >
                <span className={`text-xs w-20 ${colors.textMuted} truncate`}>
                  {day.dayLabel}
                </span>
                <div className="flex items-center gap-1.5">
                  <WeatherIcon
                    code={day.weatherCode}
                    className={`w-4 h-4 ${getWeatherIconColor(day.weatherCode)}`}
                  />
                  <span className={`text-[10px] ${colors.textMuted} `}>
                    {mapWMOCode(day.weatherCode).label.split(" ")[0]}
                  </span>
                </div>
                {day.precipProb > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Droplets className="w-2.5 h-2.5 text-sky-400" />
                    <span className="text-[10px] text-sky-400">
                      {day.precipProb}%
                    </span>
                  </div>
                )}
                {day.precipProb === 0 && <div className="w-12" />}
                <div className="flex items-center gap-1 ml-auto">
                  <span
                    className={`text-xs font-semibold ${colors.textPrimary}`}
                  >
                    {day.tempMax}°
                  </span>
                  <span className={`text-xs ${colors.textMuted}`}>
                    {day.tempMin}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
