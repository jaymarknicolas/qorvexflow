/**
 * usePomodoro Hook
 * Manages Pomodoro timer state and logic with focus/short break/long break cycle
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { pomodoroStorage } from "@/lib/services/storage";
import type { PomodoroWidgetSettings } from "@/types/widget-settings";
import { DEFAULT_WIDGET_SETTINGS } from "@/types/widget-settings";

export interface UsePomodoroReturn {
  timeLeft: number;
  isRunning: boolean;
  sessions: number;
  mode: "work" | "short-break" | "long-break";
  progress: number;
  displayTime: string;
  cycleCount: number;
  settings: PomodoroWidgetSettings;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateSettings: (newSettings: Partial<PomodoroWidgetSettings>) => void;
  testSound: () => void;
}

// Persist timer state in memory across re-renders (but not page refreshes)
// This helps maintain state when components re-mount due to parent re-renders
let persistedTimerState: {
  timeLeft: number;
  isRunning: boolean;
  mode: "work" | "short-break" | "long-break";
  lastUpdateTime: number;
} | null = null;

// ─── Cross-instance sync via EventTarget ───────────────────
const pomodoroSyncBus = typeof window !== "undefined"
  ? new EventTarget()
  : (null as unknown as EventTarget);

function emitPomodoroSync() {
  pomodoroSyncBus?.dispatchEvent(new Event("sync"));
}

export function usePomodoro(): UsePomodoroReturn {
  // Load settings from localStorage
  const [settings, setSettings] = useState<PomodoroWidgetSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("qorvexflow_pomodoro_settings");
        if (saved) {
          return { ...DEFAULT_WIDGET_SETTINGS.pomodoro, ...JSON.parse(saved) };
        }
      } catch (e) {
        // Ignore
      }
    }
    return DEFAULT_WIDGET_SETTINGS.pomodoro;
  });

  // Initialize state from persisted memory state or defaults
  const [timeLeft, setTimeLeft] = useState(() => {
    if (persistedTimerState) {
      // Calculate elapsed time since last update
      const elapsed = Math.floor((Date.now() - persistedTimerState.lastUpdateTime) / 1000);
      if (persistedTimerState.isRunning) {
        return Math.max(0, persistedTimerState.timeLeft - elapsed);
      }
      return persistedTimerState.timeLeft;
    }
    return settings.workDuration * 60;
  });

  const [isRunning, setIsRunning] = useState(() => {
    return persistedTimerState?.isRunning ?? false;
  });

  const [mode, setMode] = useState<"work" | "short-break" | "long-break">(() => {
    return persistedTimerState?.mode ?? "work";
  });

  const [sessions, setSessions] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Persist timer state to memory on every change
  const skipNextSyncRef = useRef(false);
  useEffect(() => {
    persistedTimerState = {
      timeLeft,
      isRunning,
      mode,
      lastUpdateTime: Date.now(),
    };
    // Notify other instances
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
    } else {
      emitPomodoroSync();
    }
  }, [timeLeft, isRunning, mode]);

  // Listen for sync events from other instances
  useEffect(() => {
    if (!pomodoroSyncBus) return;
    const handler = () => {
      if (!persistedTimerState) return;
      const p = persistedTimerState;
      // Only update if values actually differ to avoid loops
      skipNextSyncRef.current = true;
      setTimeLeft((prev) => {
        if (p.isRunning) {
          const elapsed = Math.floor((Date.now() - p.lastUpdateTime) / 1000);
          const corrected = Math.max(0, p.timeLeft - elapsed);
          return Math.abs(prev - corrected) > 1 ? corrected : prev;
        }
        return prev !== p.timeLeft ? p.timeLeft : prev;
      });
      setIsRunning((prev) => (prev !== p.isRunning ? p.isRunning : prev));
      setMode((prev) => (prev !== p.mode ? p.mode : prev));
    };
    pomodoroSyncBus.addEventListener("sync", handler);
    return () => pomodoroSyncBus.removeEventListener("sync", handler);
  }, []);

  // Calculate durations based on settings
  const workDuration = settings.workDuration * 60;
  const shortBreakDuration = settings.breakDuration * 60;
  const longBreakDuration = settings.longBreakDuration * 60;

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qorvexflow_pomodoro_settings", JSON.stringify(settings));
    }
  }, [settings]);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = pomodoroStorage.load();
    if (saved.sessions) {
      setSessions(saved.sessions);
    }
    const savedCycleCount = localStorage.getItem("qorvexflow_pomodoro_cycle");
    if (savedCycleCount) {
      setCycleCount(parseInt(savedCycleCount, 10));
    }
  }, []);

  // Save sessions and cycle count to localStorage when they change
  useEffect(() => {
    pomodoroStorage.save({ sessions });
    localStorage.setItem("qorvexflow_pomodoro_cycle", cycleCount.toString());
  }, [sessions, cycleCount]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<PomodoroWidgetSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  }, []);

  // Play notification sound - improved version with multiple beeps
  const playNotificationSound = useCallback(() => {
    if (!settings.enableNotifications) return;

    if (typeof window !== "undefined") {
      try {
        // Create or resume audio context
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const audioContext = audioContextRef.current;

        // Resume if suspended (needed for some browsers)
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }

        // Play a pleasant chime sequence
        const playTone = (frequency: number, startTime: number, duration: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = frequency;
          oscillator.type = "sine";

          // Smooth envelope
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;

        // Play a pleasant 3-note chime
        playTone(523.25, now, 0.3);        // C5
        playTone(659.25, now + 0.15, 0.3); // E5
        playTone(783.99, now + 0.3, 0.4);  // G5

      } catch (e) {
        console.log("Audio notification failed:", e);
      }
    }
  }, [settings.enableNotifications]);

  // Test sound function
  const testSound = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        const playTone = (frequency: number, startTime: number, duration: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = frequency;
          oscillator.type = "sine";

          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        playTone(523.25, now, 0.3);
        playTone(659.25, now + 0.15, 0.3);
        playTone(783.99, now + 0.3, 0.4);
      } catch (e) {
        console.log("Test sound failed:", e);
      }
    }
  }, []);

  // Show browser notification
  const showNotification = useCallback((title: string, body: string) => {
    if (!settings.enableNotifications) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      }
    }
  }, [settings.enableNotifications]);

  const getDurationForMode = useCallback((currentMode: "work" | "short-break" | "long-break") => {
    switch (currentMode) {
      case "work":
        return workDuration;
      case "short-break":
        return shortBreakDuration;
      case "long-break":
        return longBreakDuration;
    }
  }, [workDuration, shortBreakDuration, longBreakDuration]);

  const handleTimerComplete = useCallback(() => {
    // Play notification sound
    playNotificationSound();

    // Always stop the timer first
    setIsRunning(false);

    if (mode === "work") {
      // Focus session completed
      const newSessions = sessions + 1;
      const newCycleCount = cycleCount + 1;

      setSessions(newSessions);
      setCycleCount(newCycleCount);

      // Determine if it's time for a long break
      if (newCycleCount >= settings.longBreakInterval) {
        setMode("long-break");
        setTimeLeft(longBreakDuration);
        showNotification("🎉 Time for a Long Break!", `You've completed ${settings.longBreakInterval} focus sessions! Take a ${settings.longBreakDuration}-minute break.`);
        setCycleCount(0);
      } else {
        setMode("short-break");
        setTimeLeft(shortBreakDuration);
        showNotification("✨ Focus Complete!", `Great work! Take a ${settings.breakDuration}-minute break.`);
      }

      // Auto-start break if enabled (after a brief pause)
      if (settings.autoStartBreaks) {
        setTimeout(() => {
          setIsRunning(true);
        }, 1000);
      }
    } else {
      // Break completed, start work
      const wasLongBreak = mode === "long-break";
      setMode("work");
      setTimeLeft(workDuration);

      if (wasLongBreak) {
        showNotification("💪 Long Break Complete!", "Ready to start a new focus cycle?");
      } else {
        showNotification("💪 Break Complete!", "Time to focus again!");
      }

      // Auto-start focus session if enabled (after a brief pause)
      if (settings.autoStartPomodoros) {
        setTimeout(() => {
          setIsRunning(true);
        }, 1000);
      }
    }
  }, [mode, sessions, cycleCount, playNotificationSound, showNotification, settings, workDuration, shortBreakDuration, longBreakDuration]);

  // Stable timer effect - only depends on isRunning to avoid recreating interval every second
  // This prevents timing drift caused by clearing/creating intervals on every tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Handle timer completion separately - fires when timeLeft reaches 0
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning, handleTimerComplete]);

  // Update timeLeft when settings change and timer is not running
  // Use a ref to track previous settings to avoid resetting on pause
  const prevSettingsRef = useRef({
    workDuration: settings.workDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
  });

  useEffect(() => {
    const prev = prevSettingsRef.current;
    const settingsChanged =
      prev.workDuration !== settings.workDuration ||
      prev.breakDuration !== settings.breakDuration ||
      prev.longBreakDuration !== settings.longBreakDuration;

    // Only reset time if settings actually changed, not just when pausing
    if (settingsChanged && !isRunning) {
      setTimeLeft(getDurationForMode(mode));
    }

    // Update the ref with current settings
    prevSettingsRef.current = {
      workDuration: settings.workDuration,
      breakDuration: settings.breakDuration,
      longBreakDuration: settings.longBreakDuration,
    };
  }, [settings.workDuration, settings.breakDuration, settings.longBreakDuration, isRunning, mode, getDurationForMode]);

  const start = useCallback(() => {
    setIsRunning(true);
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
    // Resume audio context on user interaction
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  }, [mode, getDurationForMode]);

  const skip = useCallback(() => {
    setIsRunning(false);

    if (mode === "work") {
      setMode("short-break");
      setTimeLeft(shortBreakDuration);
    } else if (mode === "short-break") {
      setMode("work");
      setTimeLeft(workDuration);
    } else {
      setMode("work");
      setTimeLeft(workDuration);
    }
  }, [mode, workDuration, shortBreakDuration]);

  const totalDuration = getDurationForMode(mode);
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return {
    timeLeft,
    isRunning,
    sessions,
    mode,
    progress,
    displayTime,
    cycleCount,
    settings,
    start,
    pause,
    reset,
    skip,
    updateSettings,
    testSound,
  };
}
