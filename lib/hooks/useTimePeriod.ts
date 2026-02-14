"use client";

import { useState, useEffect } from "react";

export type TimePeriod = "dawn" | "day" | "dusk" | "night";

function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

export function useTimePeriod(): TimePeriod {
  const [period, setPeriod] = useState<TimePeriod>(() =>
    getTimePeriod(new Date().getHours())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriod(getTimePeriod(new Date().getHours()));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return period;
}
