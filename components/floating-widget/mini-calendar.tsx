"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame, Clock, Calendar } from "lucide-react";
import { useFocusTrackerContext } from "@/lib/contexts/focus-tracker-context";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MiniCalendar() {
  const focusTracker = useFocusTrackerContext();
  const colors = useWidgetTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const todayKey = formatLocalDate(today);

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
    return formatLocalDate(d);
  };

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  // Check if a day is in the future (compare using local dates)
  const isFutureDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date > todayStart;
  };

  // Theme-aware activity level colors
  const getActivityBgColor = (level: number, isToday: boolean, isFuture: boolean) => {
    if (isFuture) return colors.isLightMode ? "bg-black/5" : "bg-white/5";
    if (isToday) return colors.progressBg;
    if (level === 0) return colors.isLightMode ? "bg-black/5" : "bg-white/5";

    // Theme-aware activity levels
    if (colors.isLightMode) {
      switch (level) {
        case 1: return "bg-current opacity-20";
        case 2: return "bg-current opacity-40";
        case 3: return "bg-current opacity-60";
        default: return "bg-current opacity-80";
      }
    } else {
      switch (level) {
        case 1: return `${colors.accentBg} opacity-60`;
        case 2: return `${colors.accentBg} opacity-80`;
        case 3: return colors.accentBg;
        default: return colors.progressBg;
      }
    }
  };

  return (
    <div
      className={`flex flex-col h-full p-2 gap-1 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={`p-0.5 rounded ${colors.accentBg}`}>
            <Calendar className={`w-3 h-3 ${colors.iconColor}`} />
          </div>
          <span className={`text-[10px] font-semibold ${colors.textPrimary}`}>
            {monthName}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={prevMonth}
            className={`p-0.5 rounded ${colors.buttonBg} transition-colors`}
          >
            <ChevronLeft className={`w-3 h-3 ${colors.textMuted}`} />
          </button>
          <button
            onClick={nextMonth}
            className={`p-0.5 rounded ${colors.buttonBg} transition-colors`}
          >
            <ChevronRight className={`w-3 h-3 ${colors.textMuted}`} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px flex-shrink-0">
        {DAY_LETTERS.map((d, i) => (
          <div
            key={i}
            className={`text-center text-[7px] font-semibold ${colors.textMuted} py-0.5`}
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
          const isFuture = isFutureDay(day);

          return (
            <div
              key={day}
              className={`flex items-center justify-center rounded-sm text-[8px] ${getActivityBgColor(level, isToday, isFuture)} ${
                isToday
                  ? "text-white font-bold"
                  : isFuture
                    ? colors.textMuted
                    : colors.textSecondary
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className={`flex items-center justify-around flex-shrink-0 pt-1 border-t ${colors.border}`}
      >
        <div className="flex items-center gap-1">
          <Flame className="w-2.5 h-2.5 text-orange-400" />
          <span className={`text-[10px] font-bold ${colors.textPrimary}`}>
            {focusTracker.stats.currentStreak}
          </span>
          <span className={`text-[8px] ${colors.textMuted}`}>streak</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className={`w-2.5 h-2.5 ${colors.textMuted}`} />
          <span className={`text-[10px] font-bold ${colors.textPrimary}`}>
            {Math.round((focusTracker.stats.today.totalMinutes / 60) * 10) / 10}
            h
          </span>
          <span className={`text-[8px] ${colors.textMuted}`}>today</span>
        </div>
      </div>
    </div>
  );
}
