"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame, Clock } from "lucide-react";
import { useFocusTrackerContext } from "@/lib/contexts/focus-tracker-context";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendar() {
  const focusTracker = useFocusTrackerContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthActivity = useMemo(
    () =>
      focusTracker.getActivityForMonth(
        currentDate.getFullYear(),
        currentDate.getMonth()
      ),
    [currentDate, focusTracker]
  );

  const getDateKey = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return d.toISOString().split("T")[0];
  };

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  return (
    <div className="flex flex-col h-full p-2 gap-1">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <ChevronLeft className="w-3 h-3 text-white/60" />
        </button>
        <span className="text-[10px] font-semibold text-white/80">
          {monthName}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <ChevronRight className="w-3 h-3 text-white/60" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px flex-shrink-0">
        {DAY_LETTERS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[7px] font-semibold text-white/30 py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px flex-1 min-h-0">
        {emptyDays.map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {days.map((day) => {
          const dateKey = getDateKey(day);
          const isToday = dateKey === todayKey;
          const level = focusTracker.getActivityLevel(dateKey);
          const isFuture = new Date(dateKey) > today;

          const bgColor = isFuture
            ? "bg-white/5"
            : isToday
            ? "bg-violet-500/80"
            : level === 0
            ? "bg-white/5"
            : level === 1
            ? "bg-violet-900/60"
            : level === 2
            ? "bg-violet-700/70"
            : level === 3
            ? "bg-violet-500/80"
            : "bg-violet-400";

          return (
            <div
              key={day}
              className={`flex items-center justify-center rounded-sm text-[8px] ${bgColor} ${
                isToday
                  ? "text-white font-bold"
                  : isFuture
                  ? "text-white/20"
                  : "text-white/60"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-around flex-shrink-0 pt-1 border-t border-white/10">
        <div className="flex items-center gap-1">
          <Flame className="w-2.5 h-2.5 text-orange-400" />
          <span className="text-[10px] font-bold text-white">
            {focusTracker.stats.currentStreak}
          </span>
          <span className="text-[8px] text-white/40">streak</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-white/40" />
          <span className="text-[10px] font-bold text-white">
            {Math.round((focusTracker.stats.today.totalMinutes / 60) * 10) / 10}h
          </span>
          <span className="text-[8px] text-white/40">today</span>
        </div>
      </div>
    </div>
  );
}
