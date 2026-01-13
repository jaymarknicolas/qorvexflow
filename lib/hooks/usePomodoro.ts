/**
 * usePomodoro Hook
 * Manages Pomodoro timer state and logic
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { DEFAULT_POMODORO_DURATION, DEFAULT_BREAK_DURATION } from "@/lib/constants";
import { pomodoroStorage } from "@/lib/services/storage";

export interface UsePomodoroReturn {
  timeLeft: number;
  isRunning: boolean;
  sessions: number;
  mode: "work" | "break";
  progress: number;
  displayTime: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
}

export function usePomodoro(): UsePomodoroReturn {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_POMODORO_DURATION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [mode, setMode] = useState<"work" | "break">("work");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const workDuration = DEFAULT_POMODORO_DURATION * 60;
  const breakDuration = DEFAULT_BREAK_DURATION * 60;

  // Load saved sessions from localStorage
  useEffect(() => {
    const saved = pomodoroStorage.load();
    if (saved.sessions) {
      setSessions(saved.sessions);
    }
  }, []);

  // Save sessions to localStorage when they change
  useEffect(() => {
    pomodoroStorage.save({ sessions });
  }, [sessions]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return mode === "work" ? workDuration : breakDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    if (mode === "work") {
      setSessions((prev) => prev + 1);
      setMode("break");
      // Show notification (if supported)
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Pomodoro Complete! 🎉", {
            body: "Time for a break!",
            icon: "/favicon.ico",
          });
        }
      }
    } else {
      setMode("work");
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Break Complete! 💪", {
            body: "Ready to focus again?",
            icon: "/favicon.ico",
          });
        }
      }
    }
  }, [mode]);

  const start = useCallback(() => {
    setIsRunning(true);
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? workDuration : breakDuration);
  }, [mode, workDuration, breakDuration]);

  const skip = useCallback(() => {
    setIsRunning(false);
    if (mode === "work") {
      setMode("break");
      setTimeLeft(breakDuration);
    } else {
      setMode("work");
      setTimeLeft(workDuration);
    }
  }, [mode, workDuration, breakDuration]);

  const totalDuration = mode === "work" ? workDuration : breakDuration;
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
    start,
    pause,
    reset,
    skip,
  };
}
