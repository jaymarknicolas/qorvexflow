"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CALENDAR_DAY_NAMES } from "@/lib/constants";

export default function CalendarWidget() {
  // Fix: Use current date instead of hardcoded date
  const [currentDate, setCurrentDate] = useState(new Date());

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
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

      <div className="relative bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Calendar</h2>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
              aria-label="Go to today"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Month/Year */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-white/60">{monthName}</p>
        </div>

        {/* Day headers - Fix: Correct order starting with Sunday */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {CALENDAR_DAY_NAMES.map((day) => (
            <div key={day} className="text-center">
              <p className="text-xs font-semibold text-white/60 py-2">{day}</p>
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
                className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                  isSelected
                    ? "bg-linear-to-br from-blue-500 to-purple-500 text-white"
                    : "text-white/60 hover:bg-white/10"
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
