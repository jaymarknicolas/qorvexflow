"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { CALENDAR_DAY_NAMES } from "@/lib/constants";
import { useTheme } from "@/lib/contexts/theme-context";

export default function CalendarWidget() {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-amber-500/20",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/20",
          border: "border-emerald-400/30",
          selectedGradient: "from-green-500 to-emerald-500",
          hoverBg: "hover:bg-emerald-500/20",
          todayRing: "ring-emerald-400/50",
          iconColor: "text-emerald-400",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/90 to-amber-950/90",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          border: "border-amber-500/20",
          selectedGradient: "from-amber-500 to-orange-500",
          hoverBg: "hover:bg-amber-500/10",
          todayRing: "ring-amber-400/50",
          iconColor: "text-amber-400",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/90 to-purple-900/90",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          border: "border-violet-500/20",
          selectedGradient: "from-violet-500 to-pink-500",
          hoverBg: "hover:bg-violet-500/10",
          todayRing: "ring-violet-400/50",
          iconColor: "text-violet-400",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const today = new Date().getDate();
  const isCurrentMonth =
    new Date().getMonth() === currentDate.getMonth() &&
    new Date().getFullYear() === currentDate.getFullYear();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="relative group h-full">
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100`}></div>

      <div className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-6 lg:p-8 h-full flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colors.accentBg}`}>
              <Calendar className={`w-4 h-4 ${colors.iconColor}`} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Calendar</h2>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={prevMonth}
              className={`p-1.5 sm:p-2 ${colors.hoverBg} rounded-lg transition-colors`}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-white/60 hover:text-white" />
            </button>
            <button
              onClick={goToToday}
              className={`px-2 sm:px-3 py-1 text-xs ${colors.hoverBg} rounded-lg transition-colors text-white/60 hover:text-white font-medium`}
              aria-label="Go to today"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className={`p-1.5 sm:p-2 ${colors.hoverBg} rounded-lg transition-colors`}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Month/Year */}
        <div className="text-center mb-3 sm:mb-4">
          <p className={`text-sm font-semibold ${colors.accent}`}>{monthName}</p>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {CALENDAR_DAY_NAMES.map((day) => (
            <div key={day} className="text-center">
              <p className="text-[10px] sm:text-xs font-semibold text-white/50 py-1 sm:py-2">{day}</p>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {days.map((day) => {
            const isSelected = isCurrentMonth && day === today;
            return (
              <button
                key={day}
                className={`aspect-square rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${colors.selectedGradient} text-white shadow-lg`
                    : `text-white/60 ${colors.hoverBg} hover:text-white`
                }`}
                aria-label={`${monthName} ${day}`}
                aria-current={isSelected ? "date" : undefined}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
