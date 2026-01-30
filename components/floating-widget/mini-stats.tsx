"use client";

import { useMemo } from "react";
import { Flame, Clock, Target, TrendingUp } from "lucide-react";
import { useFocusTrackerContext } from "@/lib/contexts/focus-tracker-context";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

export default function MiniStats() {
  const focusTracker = useFocusTrackerContext();

  const stats = useMemo(() => {
    const { thisWeek, today, currentStreak } = focusTracker.stats;
    const weekTotal = thisWeek.reduce((s, d) => s + d.totalMinutes, 0) / 60;

    return {
      todayHours: Math.round((today.totalMinutes / 60) * 10) / 10,
      todaySessions: today.sessions,
      weekTotal: Math.round(weekTotal * 10) / 10,
      streak: currentStreak,
    };
  }, [focusTracker.stats]);

  // Simple bar chart for the week
  const weekBars = useMemo(() => {
    const days = focusTracker.stats.thisWeek;
    const maxMin = Math.max(...days.map((d) => d.totalMinutes), 1);
    return days.map((d) => ({
      label: new Date(d.date).toLocaleDateString("en-US", {
        weekday: "narrow",
      }),
      pct: (d.totalMinutes / maxMin) * 100,
      minutes: d.totalMinutes,
    }));
  }, [focusTracker.stats.thisWeek]);

  const colors = useWidgetTheme();

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient}`}
    >
      {/* Today highlight */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-violet-400" />
          <div>
            <p className="text-[10px] text-white/40">Today</p>
            <p className="text-lg font-bold text-white">{stats.todayHours}h</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-lg font-bold text-white">{stats.streak}</span>
          <span className="text-[10px] text-white/40">streak</span>
        </div>
      </div>

      {/* Week chart */}
      <div className="flex-1 flex items-end gap-1 min-h-0 px-1">
        {weekBars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t bg-violet-500/60 min-h-[2px] transition-all"
                style={{ height: `${Math.max(bar.pct, 3)}%` }}
              />
            </div>
            <span className="text-[8px] text-white/40">{bar.label}</span>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-around flex-shrink-0 pt-1 border-t border-white/10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5">
            <Target className="w-2.5 h-2.5 text-white/40" />
            <span className="text-xs font-bold text-white">
              {stats.weekTotal}h
            </span>
          </div>
          <p className="text-[8px] text-white/40">this week</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5 text-green-400" />
            <span className="text-xs font-bold text-white">
              {stats.todaySessions}
            </span>
          </div>
          <p className="text-[8px] text-white/40">sessions</p>
        </div>
      </div>
    </div>
  );
}
