"use client";

import { useCallback, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Flame,
  Target,
  Clock,
  BarChart3,
  Calendar,
  Award,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useFocusTrackerContext } from "@/lib/contexts/focus-tracker-context";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "week" | "month";

export default function FocusStats() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
  const focusTracker = useFocusTrackerContext();
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  // Theme colors
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
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/25",
          border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
          lineStart: "rgb(16, 185, 129)",
          lineEnd: "rgb(20, 184, 166)",
          dotColor: "#10b981",
          barColor: "#10b981",
          areaFill: "rgba(16, 185, 129, 0.3)",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800/80" : "text-white/80",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-green-200/50" : "hover:bg-white/10",
          bgOverlay: isLightMode ? "bg-green-100/50" : "bg-white/10",
          surfaceBg: isLightMode ? "bg-green-50/80" : "bg-black/20",
        };
      case "horizon":
        return {
          gradient: isLightMode
            ? "from-sky-50/95 via-orange-50/90 to-violet-50/95"
            : "from-slate-900/95 via-sky-950/90 to-violet-950/95",
          glowFrom: "from-sky-500/20",
          glowTo: "to-violet-500/20",
          accent: isLightMode ? "text-sky-700" : "text-sky-400",
          accentBg: isLightMode ? "bg-sky-200/50" : "bg-sky-500/20",
          border: isLightMode ? "border-sky-300/50" : "border-sky-500/20",
          lineStart: "rgb(14, 165, 233)",
          lineEnd: "rgb(139, 92, 246)",
          dotColor: "#0ea5e9",
          barColor: "#0ea5e9",
          areaFill: "rgba(14, 165, 233, 0.3)",
          textPrimary: isLightMode ? "text-slate-900" : "text-white",
          textSecondary: isLightMode ? "text-slate-800" : "text-white/80",
          textMuted: isLightMode ? "text-slate-600/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-sky-200/50" : "hover:bg-white/10",
          bgOverlay: isLightMode ? "bg-sky-100/60" : "bg-white/10",
          surfaceBg: isLightMode ? "bg-sky-50/80" : "bg-black/20",
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
          lineStart: "rgb(245, 158, 11)",
          lineEnd: "rgb(249, 115, 22)",
          dotColor: "#f59e0b",
          barColor: "#f59e0b",
          areaFill: "rgba(245, 158, 11, 0.3)",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-900/80" : "text-white/80",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-amber-200/50" : "hover:bg-white/10",
          bgOverlay: isLightMode ? "bg-amber-100/50" : "bg-white/10",
          surfaceBg: isLightMode ? "bg-amber-50/80" : "bg-black/20",
        };
      default:
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          lineStart: "rgb(139, 92, 246)",
          lineEnd: "rgb(236, 72, 153)",
          dotColor: "#8b5cf6",
          barColor: "#8b5cf6",
          areaFill: "rgba(139, 92, 246, 0.3)",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-900/80" : "text-white/80",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-violet-200/50" : "hover:bg-white/10",
          bgOverlay: isLightMode ? "bg-violet-100/50" : "bg-white/10",
          surfaceBg: isLightMode ? "bg-violet-50/80" : "bg-black/20",
        };
    }
  }, [theme, isLightMode]);

  const colors = getThemeColors();
  const gradientId = `areaGrad-${theme}`;

  // Prepare chart data based on view mode
  const chartData = useMemo(() => {
    if (viewMode === "week") {
      return focusTracker.stats.thisWeek.map((day) => ({
        name: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
        hours: Math.round((day.totalMinutes / 60) * 10) / 10,
        sessions: day.sessions,
        date: day.date,
      }));
    } else {
      // Monthly view - group by week or show daily
      const monthData = focusTracker.stats.thisMonth;
      // Show last 4 weeks
      const weeks: { name: string; hours: number; sessions: number }[] = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = monthData.length - (4 - i) * 7;
        const weekEnd = weekStart + 7;
        const weekDays = monthData.slice(Math.max(0, weekStart), Math.min(monthData.length, weekEnd));
        const totalMinutes = weekDays.reduce((sum, d) => sum + d.totalMinutes, 0);
        const totalSessions = weekDays.reduce((sum, d) => sum + d.sessions, 0);
        weeks.push({
          name: `W${i + 1}`,
          hours: Math.round((totalMinutes / 60) * 10) / 10,
          sessions: totalSessions,
        });
      }
      return weeks;
    }
  }, [viewMode, focusTracker.stats]);

  // Calculate statistics
  const stats = useMemo(() => {
    const { thisWeek, today, currentStreak, longestStreak, bestDay, totalHoursAllTime } =
      focusTracker.stats;

    const weekTotal = thisWeek.reduce((sum, d) => sum + d.totalMinutes, 0) / 60;
    const weekAvg = weekTotal / 7;
    const activeDaysThisWeek = thisWeek.filter((d) => d.totalMinutes > 0).length;

    // Calculate trend (compare this week vs last week)
    const thisWeekTotal = weekTotal;
    // For trend, we'd need last week data - simplified for now
    const trend = thisWeekTotal > 0 ? "up" : "neutral";

    return {
      todayHours: Math.round((today.totalMinutes / 60) * 10) / 10,
      todaySessions: today.sessions,
      weekTotal: Math.round(weekTotal * 10) / 10,
      weekAvg: Math.round(weekAvg * 10) / 10,
      activeDays: activeDaysThisWeek,
      currentStreak,
      longestStreak,
      bestDayHours: bestDay ? Math.round((bestDay.totalMinutes / 60) * 10) / 10 : 0,
      totalAllTime: Math.round(totalHoursAllTime * 10) / 10,
      trend,
    };
  }, [focusTracker.stats]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`theme-tooltip border ${colors.border} rounded-lg px-3 py-2 shadow-xl ${isLightMode ? 'bg-white/95' : 'bg-black/80'}`}>
          <p className={`font-medium text-sm ${colors.textPrimary}`}>{label}</p>
          <p className={`text-sm ${colors.accent}`}>
            {payload[0].value}h focused
          </p>
          {payload[0].payload.sessions > 0 && (
            <p className={`text-xs ${colors.textMuted}`}>
              {payload[0].payload.sessions} sessions
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative group h-full">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100`}
      />

      <div
        className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-5 h-full flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${colors.accentBg}`}>
              <BarChart3 className={`w-4 h-4 ${colors.accent}`} />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold ${colors.textPrimary}`}>
                Focus Stats
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* View toggle */}
            <div className={`flex rounded-lg p-0.5 ${colors.accentBg}`}>
              <button
                onClick={() => setViewMode("week")}
                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                  viewMode === "week"
                    ? `${isLightMode ? 'bg-black/10' : 'bg-white/20'} ${colors.textPrimary}`
                    : `${colors.textMuted} ${colors.hoverBg}`
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                  viewMode === "month"
                    ? `${isLightMode ? 'bg-black/10' : 'bg-white/20'} ${colors.textPrimary}`
                    : `${colors.textMuted} ${colors.hoverBg}`
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Today's highlight */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl ${colors.accentBg} mb-3 shrink-0`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.bgOverlay}`}>
              <Clock className={`w-4 h-4 ${colors.accent}`} />
            </div>
            <div>
              <p className={`text-[10px] ${colors.textMuted} uppercase tracking-wide`}>
                Today
              </p>
              <p className={`text-xl font-bold ${colors.textPrimary}`}>
                {stats.todayHours}h
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className={`text-lg font-bold ${colors.textPrimary}`}>
                {stats.currentStreak}
              </span>
            </div>
            <p className={`text-[10px] ${colors.textMuted}`}>day streak</p>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0 -mx-2 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.lineStart} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colors.lineEnd} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.05)"}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke={isLightMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)"}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={isLightMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)"}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="hours"
                stroke={colors.lineStart}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={{ fill: colors.dotColor, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: colors.dotColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats grid */}
        <div
          className={`grid grid-cols-4 gap-2 pt-3 border-t ${colors.border} shrink-0`}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Target className={`w-3 h-3 ${colors.textMuted}`} />
            </div>
            <p className={`text-sm font-bold ${colors.textPrimary} mt-1`}>
              {stats.weekTotal}h
            </p>
            <p className={`text-[9px] ${colors.textMuted}`}>this week</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
            </div>
            <p className={`text-sm font-bold ${colors.textPrimary} mt-1`}>
              {stats.weekAvg}h
            </p>
            <p className={`text-[9px] ${colors.textMuted}`}>daily avg</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
            </div>
            <p className={`text-sm font-bold ${colors.textPrimary} mt-1`}>
              {stats.bestDayHours}h
            </p>
            <p className={`text-[9px] ${colors.textMuted}`}>best day</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Calendar className={`w-3 h-3 ${colors.textMuted}`} />
            </div>
            <p className={`text-sm font-bold ${colors.textPrimary} mt-1`}>
              {stats.activeDays}
            </p>
            <p className={`text-[9px] ${colors.textMuted}`}>active days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
