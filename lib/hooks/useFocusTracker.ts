/**
 * Focus Activity Tracker Hook
 * Tracks daily focus sessions and provides activity data for calendar and stats widgets
 */

import { useState, useEffect, useCallback, useMemo } from "react";

export interface FocusSession {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // seconds
  type: "work" | "break";
}

export interface DailyFocusData {
  date: string;
  totalMinutes: number;
  sessions: number;
}

export interface FocusStats {
  today: DailyFocusData;
  thisWeek: DailyFocusData[];
  thisMonth: DailyFocusData[];
  allTime: Map<string, DailyFocusData>;
  totalHoursAllTime: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: DailyFocusData | null;
}

interface FocusTrackerState {
  sessions: FocusSession[];
  activeSession: {
    startTime: number;
    type: "work" | "break";
  } | null;
}

const STORAGE_KEY = "qorvexflow_focus_tracker";

function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

function generateId(): string {
  return `focus_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadState(): FocusTrackerState {
  if (typeof window === "undefined") {
    return { sessions: [], activeSession: null };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        sessions: parsed.sessions || [],
        activeSession: parsed.activeSession || null,
      };
    }
  } catch (e) {
    console.error("Failed to load focus tracker state:", e);
  }

  return { sessions: [], activeSession: null };
}

function saveState(state: FocusTrackerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save focus tracker state:", e);
  }
}

export interface UseFocusTrackerReturn {
  // State
  isTracking: boolean;
  activeSessionType: "work" | "break" | null;

  // Actions
  startSession: (type: "work" | "break") => void;
  endSession: () => void;
  addManualSession: (date: string, minutes: number, type?: "work") => void;

  // Data
  stats: FocusStats;
  getActivityForDate: (date: string) => DailyFocusData;
  getActivityLevel: (date: string) => 0 | 1 | 2 | 3 | 4; // GitHub-style levels
  getActivityForMonth: (year: number, month: number) => Map<string, DailyFocusData>;
}

export function useFocusTracker(): UseFocusTrackerReturn {
  const [state, setState] = useState<FocusTrackerState>(loadState);

  // Save state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Check for orphaned active sessions on mount
  useEffect(() => {
    if (state.activeSession) {
      const elapsed = Date.now() - state.activeSession.startTime;
      // If session has been running for more than 4 hours, assume it was abandoned
      if (elapsed > 4 * 60 * 60 * 1000) {
        // End the session with max 4 hours
        const duration = 4 * 60 * 60; // 4 hours in seconds
        const session: FocusSession = {
          id: generateId(),
          date: getDateKey(new Date(state.activeSession.startTime)),
          startTime: state.activeSession.startTime,
          endTime: state.activeSession.startTime + duration * 1000,
          duration,
          type: state.activeSession.type,
        };

        setState(prev => ({
          sessions: [...prev.sessions, session],
          activeSession: null,
        }));
      }
    }
  }, []);

  // Calculate all stats
  const stats = useMemo((): FocusStats => {
    const allTimeMap = new Map<string, DailyFocusData>();

    // Process all sessions
    state.sessions.forEach(session => {
      if (session.type !== "work") return; // Only count work sessions

      const existing = allTimeMap.get(session.date);
      if (existing) {
        existing.totalMinutes += Math.round(session.duration / 60);
        existing.sessions += 1;
      } else {
        allTimeMap.set(session.date, {
          date: session.date,
          totalMinutes: Math.round(session.duration / 60),
          sessions: 1,
        });
      }
    });

    // Today's data
    const todayKey = getDateKey();
    const today = allTimeMap.get(todayKey) || {
      date: todayKey,
      totalMinutes: 0,
      sessions: 0,
    };

    // This week's data (last 7 days)
    const thisWeek: DailyFocusData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = getDateKey(date);
      thisWeek.push(allTimeMap.get(key) || {
        date: key,
        totalMinutes: 0,
        sessions: 0,
      });
    }

    // This month's data
    const thisMonth: DailyFocusData[] = [];
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), i);
      const key = getDateKey(date);
      thisMonth.push(allTimeMap.get(key) || {
        date: key,
        totalMinutes: 0,
        sessions: 0,
      });
    }

    // Calculate total hours all time
    let totalHoursAllTime = 0;
    allTimeMap.forEach(data => {
      totalHoursAllTime += data.totalMinutes / 60;
    });

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort dates and calculate streaks
    const sortedDates = Array.from(allTimeMap.keys()).sort();
    const dateSet = new Set(sortedDates);

    // Check current streak (from today backwards)
    const checkDate = new Date();
    while (true) {
      const key = getDateKey(checkDate);
      if (dateSet.has(key) && (allTimeMap.get(key)?.totalMinutes || 0) > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (key === todayKey) {
        // Today might not have focus yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (currentStreak > 365) break; // Safety limit
    }

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const prev = i > 0 ? new Date(sortedDates[i - 1]) : null;

      if (prev) {
        const diffDays = Math.round((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Find best day
    let bestDay: DailyFocusData | null = null;
    allTimeMap.forEach(data => {
      if (!bestDay || data.totalMinutes > bestDay.totalMinutes) {
        bestDay = data;
      }
    });

    return {
      today,
      thisWeek,
      thisMonth,
      allTime: allTimeMap,
      totalHoursAllTime,
      currentStreak,
      longestStreak,
      bestDay,
    };
  }, [state.sessions]);

  // Start tracking a focus session
  const startSession = useCallback((type: "work" | "break") => {
    setState(prev => ({
      ...prev,
      activeSession: {
        startTime: Date.now(),
        type,
      },
    }));
  }, []);

  // End the current session
  const endSession = useCallback(() => {
    setState(prev => {
      if (!prev.activeSession) return prev;

      const endTime = Date.now();
      const duration = Math.round((endTime - prev.activeSession.startTime) / 1000);

      // Only save sessions longer than 1 minute
      if (duration < 60) {
        return { ...prev, activeSession: null };
      }

      const session: FocusSession = {
        id: generateId(),
        date: getDateKey(new Date(prev.activeSession.startTime)),
        startTime: prev.activeSession.startTime,
        endTime,
        duration,
        type: prev.activeSession.type,
      };

      return {
        sessions: [...prev.sessions, session],
        activeSession: null,
      };
    });
  }, []);

  // Add a manual session (for testing or corrections)
  const addManualSession = useCallback((date: string, minutes: number, type: "work" | "break" = "work") => {
    const session: FocusSession = {
      id: generateId(),
      date,
      startTime: new Date(date).getTime(),
      endTime: new Date(date).getTime() + minutes * 60 * 1000,
      duration: minutes * 60,
      type,
    };

    setState(prev => ({
      ...prev,
      sessions: [...prev.sessions, session],
    }));
  }, []);

  // Get activity data for a specific date
  const getActivityForDate = useCallback((date: string): DailyFocusData => {
    return stats.allTime.get(date) || {
      date,
      totalMinutes: 0,
      sessions: 0,
    };
  }, [stats.allTime]);

  // Get GitHub-style activity level (0-4)
  const getActivityLevel = useCallback((date: string): 0 | 1 | 2 | 3 | 4 => {
    const data = stats.allTime.get(date);
    if (!data || data.totalMinutes === 0) return 0;

    const hours = data.totalMinutes / 60;
    if (hours >= 6) return 4; // 6+ hours - most intense
    if (hours >= 4) return 3; // 4-6 hours
    if (hours >= 2) return 2; // 2-4 hours
    if (hours >= 0.5) return 1; // 30min - 2 hours
    return 0;
  }, [stats.allTime]);

  // Get activity data for a specific month
  const getActivityForMonth = useCallback((year: number, month: number): Map<string, DailyFocusData> => {
    const result = new Map<string, DailyFocusData>();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = getDateKey(date);
      result.set(key, stats.allTime.get(key) || {
        date: key,
        totalMinutes: 0,
        sessions: 0,
      });
    }

    return result;
  }, [stats.allTime]);

  return {
    isTracking: state.activeSession !== null,
    activeSessionType: state.activeSession?.type || null,
    startSession,
    endSession,
    addManualSession,
    stats,
    getActivityForDate,
    getActivityLevel,
    getActivityForMonth,
  };
}
