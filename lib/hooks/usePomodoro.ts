/**
 * usePomodoro Hook
 * Manages Pomodoro timer state and logic with focus/short break/long break cycle
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { DEFAULT_POMODORO_DURATION, DEFAULT_BREAK_DURATION } from "@/lib/constants";
import { pomodoroStorage } from "@/lib/services/storage";

const LONG_BREAK_DURATION = 15; // 15 minutes
const CYCLES_BEFORE_LONG_BREAK = 4; // After 4 focus sessions, take a long break

export interface UsePomodoroReturn {
  timeLeft: number;
  isRunning: boolean;
  sessions: number;
  mode: "work" | "short-break" | "long-break";
  progress: number;
  displayTime: string;
  cycleCount: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
}

export function usePomodoro(): UsePomodoroReturn {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_POMODORO_DURATION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [mode, setMode] = useState<"work" | "short-break" | "long-break">("work");
  const [cycleCount, setCycleCount] = useState(0); // Track focus cycles for long break

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const workDuration = DEFAULT_POMODORO_DURATION * 60;
  const shortBreakDuration = DEFAULT_BREAK_DURATION * 60;
  const longBreakDuration = LONG_BREAK_DURATION * 60;

  // Initialize audio notification on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create audio element for notification sound
      audioRef.current = new Audio();
      // Using a simple sine wave beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    }
  }, []);

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

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        // Ignore audio errors
      }
    }
  }, []);

  // Show browser notification
  const showNotification = useCallback((title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      }
    }
  }, []);

  const getDurationForMode = (currentMode: "work" | "short-break" | "long-break") => {
    switch (currentMode) {
      case "work":
        return workDuration;
      case "short-break":
        return shortBreakDuration;
      case "long-break":
        return longBreakDuration;
    }
  };

  const handleTimerComplete = useCallback(() => {
    // Play notification sound
    playNotificationSound();

    if (mode === "work") {
      // Focus session completed
      const newSessions = sessions + 1;
      const newCycleCount = cycleCount + 1;

      setSessions(newSessions);
      setCycleCount(newCycleCount);

      // Determine if it's time for a long break
      if (newCycleCount >= CYCLES_BEFORE_LONG_BREAK) {
        setMode("long-break");
        setTimeLeft(longBreakDuration);
        showNotification("🎉 Time for a Long Break!", `You've completed ${CYCLES_BEFORE_LONG_BREAK} focus sessions! Take a 15-minute break.`);
        setCycleCount(0); // Reset cycle count
      } else {
        setMode("short-break");
        setTimeLeft(shortBreakDuration);
        showNotification("✨ Focus Complete!", `Great work! Take a ${DEFAULT_BREAK_DURATION}-minute break.`);
      }

      // Auto-start break
      setTimeout(() => {
        setIsRunning(true);
      }, 1000);
    } else {
      // Break completed, start work
      setMode("work");
      setTimeLeft(workDuration);

      if (mode === "long-break") {
        showNotification("💪 Long Break Complete!", "Ready to start a new focus cycle?");
      } else {
        showNotification("💪 Break Complete!", "Time to focus again!");
      }

      // Auto-start focus session
      setTimeout(() => {
        setIsRunning(true);
      }, 1000);
    }
  }, [mode, sessions, cycleCount, playNotificationSound, showNotification, workDuration, shortBreakDuration, longBreakDuration]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return getDurationForMode(mode);
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
  }, [isRunning, timeLeft, mode, handleTimerComplete]);

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
    setTimeLeft(getDurationForMode(mode));
  }, [mode]);

  const skip = useCallback(() => {
    setIsRunning(false);

    if (mode === "work") {
      // Skip to short break (don't count as completed session)
      setMode("short-break");
      setTimeLeft(shortBreakDuration);
    } else if (mode === "short-break") {
      // Skip to work
      setMode("work");
      setTimeLeft(workDuration);
    } else {
      // Skip long break to work
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
    start,
    pause,
    reset,
    skip,
  };
}

