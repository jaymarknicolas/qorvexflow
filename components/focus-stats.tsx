"use client";

import { useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, Info, BarChart3 } from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";

interface FocusDay {
  day: string;
  hours: number;
}

export default function FocusStats() {
  const { theme } = useTheme();

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-amber-500/20",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/25",
          border: "border-emerald-400/30",
          lineStart: "rgb(16, 185, 129)", // emerald-500
          lineEnd: "rgb(20, 184, 166)", // teal-500
          dotColor: "#10b981",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/90 to-amber-950/90",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          border: "border-amber-500/20",
          lineStart: "rgb(245, 158, 11)", // amber-500
          lineEnd: "rgb(249, 115, 22)", // orange-500
          dotColor: "#f59e0b",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/90 to-purple-900/90",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          border: "border-violet-500/20",
          lineStart: "rgb(139, 92, 246)", // violet-500
          lineEnd: "rgb(236, 72, 153)", // pink-500
          dotColor: "#8b5cf6",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  // Note: This is sample data. In production, this would come from actual tracking
  const data: FocusDay[] = [
    { day: "Mon", hours: 4.2 },
    { day: "Tue", hours: 5.1 },
    { day: "Wed", hours: 3.8 },
    { day: "Thu", hours: 6.2 },
    { day: "Fri", hours: 7.1 },
    { day: "Sat", hours: 5.5 },
    { day: "Sun", hours: 4.5 },
  ];

  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const dailyAverage = totalHours / data.length;
  const maxDay = data.reduce((max, d) => (d.hours > max.hours ? d : max), data[0]);

  // Create unique gradient ID for this theme
  const gradientId = `lineGrad-${theme}`;

  return (
    <div className="relative group h-full">
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100`} />

      <div className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-6 lg:p-8 h-full flex flex-col`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colors.accentBg}`}>
              <BarChart3 className={`w-4 h-4 ${colors.accent}`} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Focus Stats</h2>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                Hours focused this week
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${colors.accent}`} />
            <button
              className="p-1 hover:bg-white/10 rounded transition-colors group/info"
              aria-label="Sample data"
            >
              <Info className="w-4 h-4 text-white/40 group-hover/info:text-white/60" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-32 sm:h-40 -mx-2 mb-4 sm:mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="day"
                stroke="rgba(255,255,255,0.4)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke={`url(#${gradientId})`}
                strokeWidth={3}
                dot={{ fill: colors.dotColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={colors.lineStart} />
                  <stop offset="100%" stopColor={colors.lineEnd} />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-2 sm:gap-4 mt-auto pt-4 sm:pt-6 border-t ${colors.border}`}>
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {totalHours.toFixed(1)}h
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 mt-1">This week</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {dailyAverage.toFixed(1)}h
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 mt-1">Daily avg</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {maxDay.hours.toFixed(1)}h
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 mt-1">Best day</div>
          </div>
        </div>
      </div>
    </div>
  );
}
