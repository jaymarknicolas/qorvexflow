"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Module-level persisted state (survives re-mounts, shared across instances) ───
let persistedCountdownState: {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isFinished: boolean;
  endTime: number; // Date.now() when timer ends
  lastUpdateTime: number;
} | null = null;

export function useCountdown() {
  const [duration, setDuration] = useState(() => {
    return persistedCountdownState?.duration ?? 25 * 60;
  });
  const [remaining, setRemaining] = useState(() => {
    if (persistedCountdownState) {
      if (persistedCountdownState.isRunning) {
        // Recalculate based on wall clock
        const left = Math.max(
          0,
          Math.round((persistedCountdownState.endTime - Date.now()) / 1000)
        );
        return left;
      }
      return persistedCountdownState.remaining;
    }
    return 25 * 60;
  });
  const [isRunning, setIsRunning] = useState(
    () => persistedCountdownState?.isRunning ?? false
  );
  const [isFinished, setIsFinished] = useState(
    () => persistedCountdownState?.isFinished ?? false
  );

  const endTimeRef = useRef(persistedCountdownState?.endTime ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist to module-level state on every change
  useEffect(() => {
    persistedCountdownState = {
      duration,
      remaining,
      isRunning,
      isFinished,
      endTime: endTimeRef.current,
      lastUpdateTime: Date.now(),
    };
  }, [duration, remaining, isRunning, isFinished]);

  const tick = useCallback(() => {
    const left = Math.max(
      0,
      Math.round((endTimeRef.current - Date.now()) / 1000)
    );
    setRemaining(left);
    if (left <= 0) {
      setIsRunning(false);
      setIsFinished(true);
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      // Only set endTime if we're freshly starting (not resuming from persisted)
      if (endTimeRef.current <= Date.now()) {
        endTimeRef.current = Date.now() + remaining * 1000;
      }
      intervalRef.current = setInterval(tick, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Visibility handler — correct drift when tab comes back
  useEffect(() => {
    const handle = () => {
      if (document.visibilityState === "visible" && isRunning) tick();
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [isRunning, tick]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    endTimeRef.current = Date.now() + remaining * 1000;
    setIsFinished(false);
    setIsRunning(true);
  }, [remaining]);

  const pause = useCallback(() => {
    // Freeze remaining at current value
    const left = Math.max(
      0,
      Math.round((endTimeRef.current - Date.now()) / 1000)
    );
    setRemaining(left);
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setRemaining(duration);
    endTimeRef.current = 0;
  }, [duration]);

  const selectPreset = useCallback((seconds: number) => {
    setIsRunning(false);
    setIsFinished(false);
    setDuration(seconds);
    setRemaining(seconds);
    endTimeRef.current = 0;
  }, []);

  const adjust = useCallback(
    (delta: number) => {
      if (isRunning) return;
      const next = Math.max(0, Math.min(5999 * 60, duration + delta));
      setDuration(next);
      setRemaining(next);
      setIsFinished(false);
      endTimeRef.current = 0;
    },
    [isRunning, duration]
  );

  const progress =
    duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return {
    duration,
    remaining,
    isRunning,
    isFinished,
    progress,
    start,
    pause,
    reset,
    selectPreset,
    adjust,
  };
}
