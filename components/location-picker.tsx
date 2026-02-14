"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2, Navigation, X, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value: string;
  lat: number | null;
  lon: number | null;
  onSelect: (city: string, lat: number, lon: number) => void;
  onClear: () => void;
  accentText?: string;
}

export default function LocationPicker({
  value,
  lat,
  lon,
  onSelect,
  onClear,
  accentText = "text-sky-400",
}: LocationPickerProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchLocations = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=5&language=en&format=json`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      const locations: LocationResult[] = (data.results || []).map(
        (r: {
          id: number;
          name: string;
          country: string;
          admin1?: string;
          latitude: number;
          longitude: number;
        }) => ({
          id: r.id,
          name: r.name,
          country: r.country,
          admin1: r.admin1,
          latitude: r.latitude,
          longitude: r.longitude,
        })
      );

      setResults(locations);
      setIsOpen(locations.length > 0);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(val);
    }, 300);
  };

  const handleSelect = (location: LocationResult) => {
    const displayName = location.admin1
      ? `${location.name}, ${location.admin1}, ${location.country}`
      : `${location.name}, ${location.country}`;
    setQuery(displayName);
    setIsOpen(false);
    setResults([]);
    onSelect(displayName, location.latitude, location.longitude);
  };

  // Reverse geocode coordinates to a display name
  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      // Use Open-Meteo geocoding with nearby search
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${latitude.toFixed(1)}&count=1&language=en&format=json`;
      // This won't work well, so use the weather API timezone trick
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`;
      const res = await fetch(weatherUrl);
      const data = await res.json();

      const timezone = data.timezone || "";
      if (timezone.includes("/")) {
        const city = timezone.split("/").pop()?.replace(/_/g, " ") || "";
        if (city) return `${city} (My Location)`;
      }
    } catch {
      // ignore
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  const handleLocateMe = async () => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setLocateError(
        "Geolocation is not supported by your browser"
      );
      return;
    }

    // Check secure context (geolocation requires HTTPS or localhost)
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setLocateError(
        "Location requires HTTPS. Please use a secure connection."
      );
      return;
    }

    setLocating(true);
    setLocateError(null);

    // Check permission state first (if Permissions API available)
    try {
      if (navigator.permissions) {
        const permResult = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permResult.state === "denied") {
          setLocating(false);
          setLocateError(
            "Location access is blocked. Please allow location in your browser settings, then try again."
          );
          return;
        }
      }
    } catch {
      // Permissions API not available, proceed with geolocation directly
    }

    // Request geolocation
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000, // 5 min cache
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const displayName = await reverseGeocode(latitude, longitude);

      setQuery(displayName);
      onSelect(displayName, latitude, longitude);
      setLocating(false);
    } catch (err) {
      setLocating(false);
      const geoErr = err as GeolocationPositionError;

      if (geoErr.code === GeolocationPositionError.PERMISSION_DENIED) {
        setLocateError(
          "Location access denied. Check your browser's site settings and allow location access."
        );
      } else if (
        geoErr.code === GeolocationPositionError.POSITION_UNAVAILABLE
      ) {
        setLocateError("Could not determine your location. Try again later.");
      } else if (geoErr.code === GeolocationPositionError.TIMEOUT) {
        setLocateError("Location request timed out. Try again.");
      } else {
        setLocateError("Failed to get location. Try searching instead.");
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setLocateError(null);
    onClear();
  };

  const hasLocation = lat != null && lon != null && value.length > 0;

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="text-xs text-white/50">Location</label>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search city..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              className="w-full pl-8 pr-8 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 animate-spin" />
            )}
            {!searching && hasLocation && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
              </button>
            )}
          </div>

          {/* Locate Me Button */}
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap",
              locating
                ? "bg-white/5 border-white/10 text-white/40"
                : "bg-white/10 border-white/20 text-white/70 hover:bg-white/15 hover:text-white"
            )}
            title="Use current location"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden">
            {results.map((loc) => (
              <button
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className="flex items-start gap-2 w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
              >
                <MapPin
                  className={cn(
                    "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                    accentText
                  )}
                />
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{loc.name}</div>
                  <div className="text-xs text-white/40 truncate">
                    {loc.admin1 ? `${loc.admin1}, ` : ""}
                    {loc.country}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current location indicator */}
      {hasLocation && !locateError && (
        <p className="text-xs text-white/30">
          <span className={accentText}>{value}</span>
        </p>
      )}

      {/* Locate error */}
      {locateError && (
        <p className="text-xs text-red-400/90">{locateError}</p>
      )}
    </div>
  );
}
