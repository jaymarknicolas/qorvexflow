/**
 * Coffee Counter Hook
 * Manages daily coffee/caffeine intake tracking with persistence
 */

import { useState, useEffect, useCallback, useMemo } from "react";

export interface CoffeeEntry {
  id: string;
  timestamp: number;
  type: "espresso" | "regular" | "large";
  caffeineAmount: number; // mg
}

export interface CoffeeSettings {
  dailyLimit: number; // cups
  caffeineLimit: number; // mg
  resetHour: number; // hour to reset (0-23, default 4am)
}

export interface CoffeeStats {
  todayCount: number;
  todayCaffeine: number;
  weeklyAverage: number;
  currentStreak: number; // days within limit
  lastCoffeeTime: number | null;
}

interface CoffeeState {
  entries: CoffeeEntry[];
  settings: CoffeeSettings;
  history: Record<string, number>; // date -> count
}

const STORAGE_KEY = "qorvexflow_coffee_counter";

const DEFAULT_SETTINGS: CoffeeSettings = {
  dailyLimit: 4,
  caffeineLimit: 400, // FDA recommended max
  resetHour: 4, // 4 AM reset
};

// Caffeine amounts in mg
const CAFFEINE_AMOUNTS: Record<CoffeeEntry["type"], number> = {
  espresso: 63,
  regular: 95,
  large: 150,
};

function generateId(): string {
  return `coffee_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getTodayKey(resetHour: number): string {
  const now = new Date();
  // If before reset hour, use yesterday's date
  if (now.getHours() < resetHour) {
    now.setDate(now.getDate() - 1);
  }
  return now.toISOString().split("T")[0];
}

function isToday(timestamp: number, resetHour: number): boolean {
  const todayKey = getTodayKey(resetHour);
  const entryDate = new Date(timestamp);
  if (entryDate.getHours() < resetHour) {
    entryDate.setDate(entryDate.getDate() - 1);
  }
  return entryDate.toISOString().split("T")[0] === todayKey;
}

function loadState(): CoffeeState {
  if (typeof window === "undefined") {
    return {
      entries: [],
      settings: DEFAULT_SETTINGS,
      history: {},
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        entries: parsed.entries || [],
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        history: parsed.history || {},
      };
    }
  } catch (e) {
    console.error("Failed to load coffee state:", e);
  }

  return {
    entries: [],
    settings: DEFAULT_SETTINGS,
    history: {},
  };
}

function saveState(state: CoffeeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save coffee state:", e);
  }
}

export interface UseCoffeeCounterReturn {
  // State
  todayEntries: CoffeeEntry[];
  settings: CoffeeSettings;
  stats: CoffeeStats;

  // Actions
  addCoffee: (type?: CoffeeEntry["type"]) => void;
  removeCoffee: (id: string) => void;
  undoLast: () => CoffeeEntry | null;
  updateSettings: (settings: Partial<CoffeeSettings>) => void;
  resetToday: () => void;

  // Computed
  isOverLimit: boolean;
  isNearLimit: boolean;
  progressPercent: number;
  caffeinePercent: number;
  timeUntilReset: string;
}

export function useCoffeeCounter(): UseCoffeeCounterReturn {
  const [state, setState] = useState<CoffeeState>(loadState);
  const [, forceUpdate] = useState(0);

  // Force re-render every minute to update time-based calculations
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Save state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Filter today's entries
  const todayEntries = useMemo(() => {
    return state.entries.filter((entry) =>
      isToday(entry.timestamp, state.settings.resetHour)
    );
  }, [state.entries, state.settings.resetHour]);

  // Calculate stats
  const stats = useMemo((): CoffeeStats => {
    const todayCount = todayEntries.length;
    const todayCaffeine = todayEntries.reduce(
      (sum, entry) => sum + entry.caffeineAmount,
      0
    );

    // Calculate weekly average from history
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let weekTotal = 0;
    let daysWithData = 0;

    for (let d = new Date(weekAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      if (state.history[key] !== undefined) {
        weekTotal += state.history[key];
        daysWithData++;
      }
    }

    const weeklyAverage = daysWithData > 0 ? weekTotal / daysWithData : 0;

    // Calculate streak (consecutive days within limit)
    let streak = 0;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

    while (true) {
      const key = checkDate.toISOString().split("T")[0];
      const count = state.history[key];

      if (count === undefined) break;
      if (count > state.settings.dailyLimit) break;

      streak++;
      checkDate.setDate(checkDate.getDate() - 1);

      // Safety limit
      if (streak > 365) break;
    }

    // Add today if within limit
    if (todayCount <= state.settings.dailyLimit && todayCount > 0) {
      streak++;
    }

    // Last coffee time
    const lastCoffeeTime =
      todayEntries.length > 0
        ? Math.max(...todayEntries.map((e) => e.timestamp))
        : null;

    return {
      todayCount,
      todayCaffeine,
      weeklyAverage,
      currentStreak: streak,
      lastCoffeeTime,
    };
  }, [todayEntries, state.history, state.settings.dailyLimit]);

  // Computed values
  const isOverLimit = stats.todayCount >= state.settings.dailyLimit;
  const isNearLimit =
    stats.todayCount >= state.settings.dailyLimit - 1 && !isOverLimit;
  const progressPercent = Math.min(
    (stats.todayCount / state.settings.dailyLimit) * 100,
    100
  );
  const caffeinePercent = Math.min(
    (stats.todayCaffeine / state.settings.caffeineLimit) * 100,
    100
  );

  // Calculate time until reset
  const timeUntilReset = useMemo(() => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(state.settings.resetHour, 0, 0, 0);

    if (now >= resetTime) {
      resetTime.setDate(resetTime.getDate() + 1);
    }

    const diff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [state.settings.resetHour]);

  // Actions
  const addCoffee = useCallback(
    (type: CoffeeEntry["type"] = "regular") => {
      const entry: CoffeeEntry = {
        id: generateId(),
        timestamp: Date.now(),
        type,
        caffeineAmount: CAFFEINE_AMOUNTS[type],
      };

      setState((prev) => {
        const todayKey = getTodayKey(prev.settings.resetHour);
        const newHistory = { ...prev.history };
        newHistory[todayKey] = (newHistory[todayKey] || 0) + 1;

        return {
          ...prev,
          entries: [...prev.entries, entry],
          history: newHistory,
        };
      });
    },
    []
  );

  const removeCoffee = useCallback((id: string) => {
    setState((prev) => {
      const entry = prev.entries.find((e) => e.id === id);
      if (!entry) return prev;

      const entryDate = new Date(entry.timestamp);
      if (entryDate.getHours() < prev.settings.resetHour) {
        entryDate.setDate(entryDate.getDate() - 1);
      }
      const dateKey = entryDate.toISOString().split("T")[0];

      const newHistory = { ...prev.history };
      if (newHistory[dateKey]) {
        newHistory[dateKey] = Math.max(0, newHistory[dateKey] - 1);
      }

      return {
        ...prev,
        entries: prev.entries.filter((e) => e.id !== id),
        history: newHistory,
      };
    });
  }, []);

  const undoLast = useCallback((): CoffeeEntry | null => {
    let removedEntry: CoffeeEntry | null = null;

    setState((prev) => {
      if (todayEntries.length === 0) return prev;

      // Find the most recent entry
      const lastEntry = todayEntries.reduce((latest, entry) =>
        entry.timestamp > latest.timestamp ? entry : latest
      );

      removedEntry = lastEntry;

      const entryDate = new Date(lastEntry.timestamp);
      if (entryDate.getHours() < prev.settings.resetHour) {
        entryDate.setDate(entryDate.getDate() - 1);
      }
      const dateKey = entryDate.toISOString().split("T")[0];

      const newHistory = { ...prev.history };
      if (newHistory[dateKey]) {
        newHistory[dateKey] = Math.max(0, newHistory[dateKey] - 1);
      }

      return {
        ...prev,
        entries: prev.entries.filter((e) => e.id !== lastEntry.id),
        history: newHistory,
      };
    });

    return removedEntry;
  }, [todayEntries]);

  const updateSettings = useCallback(
    (newSettings: Partial<CoffeeSettings>) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings },
      }));
    },
    []
  );

  const resetToday = useCallback(() => {
    setState((prev) => {
      const todayKey = getTodayKey(prev.settings.resetHour);
      const newHistory = { ...prev.history };
      newHistory[todayKey] = 0;

      return {
        ...prev,
        entries: prev.entries.filter(
          (e) => !isToday(e.timestamp, prev.settings.resetHour)
        ),
        history: newHistory,
      };
    });
  }, []);

  return {
    todayEntries,
    settings: state.settings,
    stats,
    addCoffee,
    removeCoffee,
    undoLast,
    updateSettings,
    resetToday,
    isOverLimit,
    isNearLimit,
    progressPercent,
    caffeinePercent,
    timeUntilReset,
  };
}
