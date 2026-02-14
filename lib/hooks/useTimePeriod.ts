"use client";

import { useState, useEffect } from "react";

export type TimePeriod = "dawn" | "day" | "dusk" | "night";

function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 6) return "dawn"; // 5am-6am sunrise
  if (hour >= 6 && hour < 17) return "day"; // 6am-5pm daytime
  if (hour >= 17 && hour < 18) return "dusk"; // 5pm-6pm sunset
  return "night"; // 6pm-5am nighttime
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
