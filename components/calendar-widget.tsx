"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Clock,
} from "lucide-react";
import { CALENDAR_DAY_NAMES } from "@/lib/constants";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useFocusTrackerContext } from "@/lib/contexts/focus-tracker-context";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarWidget() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
  const focusTracker = useFocusTrackerContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  // Detect compact mode based on container height
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        setIsCompact(height < 320);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Theme colors with activity level colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-amber-500/20",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
          selectedGradient: "from-green-500 to-emerald-500",
          hoverBg: isLightMode
            ? "hover:bg-green-200/40"
            : "hover:bg-emerald-500/20",
          iconColor: isLightMode ? "text-green-600" : "text-emerald-400",
          selectedBg: "bg-emerald-500",
          todayBg: isLightMode ? "bg-emerald-400/80" : "bg-emerald-600/70",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800/80" : "text-white/60",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/40",
          activity: isLightMode
            ? {
                0: "bg-green-100/50",
                1: "bg-green-200/60",
                2: "bg-green-300/70",
                3: "bg-green-400/80",
                4: "bg-green-500",
              }
            : {
                0: "bg-white/5",
                1: "bg-emerald-900/60",
                2: "bg-emerald-700/70",
                3: "bg-emerald-500/80",
                4: "bg-emerald-400",
              },
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          selectedGradient: "from-amber-500 to-orange-500",
          hoverBg: isLightMode
            ? "hover:bg-amber-200/40"
            : "hover:bg-amber-500/10",
          iconColor: isLightMode ? "text-amber-700" : "text-amber-400",
          selectedBg: "bg-amber-500",
          todayBg: isLightMode ? "bg-amber-400/80" : "bg-amber-600/70",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-800/80" : "text-white/60",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/40",
          activity: isLightMode
            ? {
                0: "bg-amber-100/50",
                1: "bg-amber-200/60",
                2: "bg-amber-300/70",
                3: "bg-amber-400/80",
                4: "bg-amber-500",
              }
            : {
                0: "bg-white/5",
                1: "bg-amber-900/60",
                2: "bg-amber-700/70",
                3: "bg-amber-500/80",
                4: "bg-amber-400",
              },
        };
      default: // lofi
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          selectedGradient: "from-violet-500 to-pink-500",
          hoverBg: isLightMode
            ? "hover:bg-violet-200/40"
            : "hover:bg-violet-500/10",
          iconColor: isLightMode ? "text-violet-600" : "text-violet-400",
          selectedBg: "bg-violet-500",
          todayBg: isLightMode ? "bg-violet-400/80" : "bg-violet-600/70",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-800/80" : "text-white/60",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/40",
          activity: isLightMode
            ? {
                0: "bg-violet-100/50",
                1: "bg-violet-200/60",
                2: "bg-violet-300/70",
                3: "bg-violet-400/80",
                4: "bg-violet-500",
              }
            : {
                0: "bg-white/5",
                1: "bg-violet-900/60",
                2: "bg-violet-700/70",
                3: "bg-violet-500/80",
                4: "bg-violet-400",
              },
        };
    }
  }, [theme, isLightMode]);

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

  const today = new Date();
  const todayKey = formatLocalDate(today);

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const shortMonthName = currentDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Get activity data for current month
  const monthActivity = useMemo(() => {
    return focusTracker.getActivityForMonth(
      currentDate.getFullYear(),
      currentDate.getMonth(),
    );
  }, [currentDate, focusTracker]);

  // Get date key for a specific day (using local timezone)
  const getDateKey = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return formatLocalDate(date);
  };

  // Calculate month stats
  const monthStats = useMemo(() => {
    let totalMinutes = 0;
    let activeDays = 0;
    monthActivity.forEach((data) => {
      if (data.totalMinutes > 0) {
        totalMinutes += data.totalMinutes;
        activeDays++;
      }
    });
    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      activeDays,
      avgPerDay:
        activeDays > 0 ? (totalMinutes / 60 / activeDays).toFixed(1) : "0",
    };
  }, [monthActivity]);

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get selected date info
  const selectedDateInfo = useMemo(() => {
    if (!selectedDate) return null;
    return focusTracker.getActivityForDate(selectedDate);
  }, [selectedDate, focusTracker]);

  // Calculate total rows needed for the calendar
  const totalCells = emptyDays.length + days.length;
  const totalRows = Math.ceil(totalCells / 7);

  return (
    <div className="relative group h-full" ref={containerRef}>
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100`}
      />

      <div
        className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-3 sm:p-4 h-full flex flex-col overflow-hidden`}
      >
        {/* Header - always visible */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`p-1 sm:p-1.5 rounded-lg ${colors.accentBg} flex-shrink-0`}
            >
              <Calendar
                className={`w-3 h-3 sm:w-4 sm:h-4 ${colors.iconColor}`}
              />
            </div>
            <h2
              className={`text-sm sm:text-base font-bold ${colors.textPrimary} truncate`}
            >
              {isCompact ? "Activity" : "Activity"}
            </h2>
          </div>
          <TooltipProvider delayDuration={300}>
            <div className="flex gap-0.5 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={prevMonth}
                    className={`p-1 sm:p-1.5 ${colors.hoverBg} rounded-lg transition-colors`}
                    aria-label="Previous month"
                  >
                    <ChevronLeft
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${colors.textSecondary} hover:${colors.textPrimary}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous month</p>
                </TooltipContent>
              </Tooltip>
              {!isCompact && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={goToToday}
                      className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] ${colors.hoverBg} rounded-lg transition-colors ${colors.textSecondary} hover:${colors.textPrimary} font-medium`}
                      aria-label="Go to today"
                    >
                      Today
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go to today</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={nextMonth}
                    className={`p-1 sm:p-1.5 ${colors.hoverBg} rounded-lg transition-colors`}
                    aria-label="Next month"
                  >
                    <ChevronRight
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${colors.textSecondary} hover:${colors.textPrimary}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next month</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Month/Year */}
        <div className="text-center mb-1.5 flex-shrink-0">
          <p
            className={`text-[10px] sm:text-xs font-semibold ${colors.accent}`}
          >
            {isCompact ? shortMonthName : monthName}
          </p>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5 flex-shrink-0">
          {CALENDAR_DAY_NAMES.map((day) => (
            <div key={day} className="text-center">
              <p
                className={`text-[8px] sm:text-[9px] font-semibold ${colors.textMuted} py-0.5`}
              >
                {day.charAt(0)}
              </p>
            </div>
          ))}
        </div>

        {/* Calendar grid with activity heatmap - scrollable if needed */}
        <div
          className="flex-1 min-h-0 overflow-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
            gap: "2px",
          }}
        >
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateKey = getDateKey(day);
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate;
            const activityLevel = focusTracker.getActivityLevel(dateKey);
            const activityData = monthActivity.get(dateKey);
            const isFutureDate = new Date(dateKey) > today;

            // Determine background color based on state
            const getBgColor = () => {
              if (isFutureDate)
                return isLightMode ? "bg-black/5" : "bg-white/5";
              if (isSelected) return colors.selectedBg;
              if (isToday) return colors.todayBg;
              return colors.activity[
                activityLevel as keyof typeof colors.activity
              ];
            };

            // Determine text color
            const getTextColor = () => {
              if (isFutureDate)
                return isLightMode ? `${colors.textMuted}` : "text-white/20";
              if (isSelected || isToday) return "text-white font-semibold";
              if (activityLevel > 0)
                return isLightMode ? colors.textPrimary : "text-white";
              return isLightMode ? colors.textSecondary : "text-white/50";
            };

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateKey)}
                className={`flex items-center justify-center rounded-sm font-medium text-[9px] sm:text-[10px] transition-colors duration-150 relative min-h-[20px] ${getBgColor()} ${getTextColor()} ${
                  !isFutureDate ? "hover:brightness-125" : "cursor-default"
                }`}
                aria-label={`${monthName} ${day}${
                  activityData?.totalMinutes
                    ? ` - ${Math.round((activityData.totalMinutes / 60) * 10) / 10}h focused`
                    : ""
                }`}
                aria-current={isToday ? "date" : undefined}
                disabled={isFutureDate}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Stats section - compact version */}
        <div className={`mt-2 pt-2 border-t ${colors.border} flex-shrink-0`}>
          {selectedDateInfo ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p
                  className={`text-[9px] sm:text-[10px] ${colors.textSecondary} truncate`}
                >
                  {new Date(selectedDate!).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p
                  className={`text-xs sm:text-sm font-bold ${colors.textPrimary}`}
                >
                  {selectedDateInfo.totalMinutes > 0
                    ? `${(selectedDateInfo.totalMinutes / 60).toFixed(1)}h`
                    : "No activity"}
                </p>
              </div>
              {selectedDateInfo.sessions > 0 && (
                <div className="text-center flex-shrink-0">
                  <p
                    className={`text-xs sm:text-sm font-bold ${colors.textPrimary}`}
                  >
                    {selectedDateInfo.sessions}
                  </p>
                  <p className={`text-[8px] sm:text-[9px] ${colors.textMuted}`}>
                    sessions
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-around gap-1">
              <div className="text-center flex-1 min-w-0">
                <div className="flex items-center justify-center gap-0.5">
                  <Clock
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${colors.textMuted} flex-shrink-0`}
                  />
                  <span
                    className={`text-xs sm:text-sm font-bold ${colors.textPrimary}`}
                  >
                    {monthStats.totalHours}h
                  </span>
                </div>
                <p
                  className={`text-[8px] sm:text-[9px] ${colors.textMuted} truncate`}
                >
                  month
                </p>
              </div>
              <div className="text-center flex-1 min-w-0">
                <div className="flex items-center justify-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 flex-shrink-0" />
                  <span
                    className={`text-xs sm:text-sm font-bold ${colors.textPrimary}`}
                  >
                    {focusTracker.stats.currentStreak}
                  </span>
                </div>
                <p
                  className={`text-[8px] sm:text-[9px] ${colors.textMuted} truncate`}
                >
                  streak
                </p>
              </div>
              <div className="text-center flex-1 min-w-0">
                <span
                  className={`text-xs sm:text-sm font-bold ${colors.textPrimary}`}
                >
                  {monthStats.activeDays}
                </span>
                <p
                  className={`text-[8px] sm:text-[9px] ${colors.textMuted} truncate`}
                >
                  active
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Activity legend - only show when not compact */}
        {!isCompact && (
          <div className="flex items-center justify-center gap-0.5 mt-1.5 flex-shrink-0">
            <span
              className={`text-[7px] sm:text-[8px] ${colors.textMuted} mr-0.5`}
            >
              Less
            </span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm ${
                  colors.activity[level as keyof typeof colors.activity]
                }`}
                title={`Level ${level}`}
              />
            ))}
            <span
              className={`text-[7px] sm:text-[8px] ${colors.textMuted} ml-0.5`}
            >
              More
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
