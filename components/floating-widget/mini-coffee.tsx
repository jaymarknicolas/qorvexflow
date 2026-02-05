"use client";

import { Coffee, Plus, Undo2, Flame, Clock } from "lucide-react";
import { useCoffeeCounter } from "@/lib/hooks/useCoffeeCounter";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

export default function MiniCoffee() {
  const {
    settings,
    stats,
    addCoffee,
    undoLast,
    isOverLimit,
    isNearLimit,
    progressPercent,
    timeUntilReset,
  } = useCoffeeCounter();

  const colors = useWidgetTheme();

  const handleAdd = () => {
    if (!isOverLimit) addCoffee("regular");
  };

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${colors.accentBg}`}>
            <Coffee className={`w-3.5 h-3.5 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-sm font-bold ${colors.textPrimary}`}>Coffee</h2>
        </div>
        <span className={`text-[10px] ${colors.textMuted}`}>
          {settings.dailyLimit - stats.todayCount} left
        </span>
      </div>

      {/* Big number */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div
          className={`text-4xl font-bold ${
            isOverLimit ? "text-red-400" : colors.textPrimary
          }`}
        >
          {stats.todayCount}
        </div>
        <div className={`text-[10px] ${colors.textMuted}`}>
          of {settings.dailyLimit} cups
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-[140px] mt-2">
          <div
            className={`h-1.5 ${colors.isLightMode ? "bg-black/10" : "bg-white/10"} rounded-full overflow-hidden`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                isOverLimit
                  ? "bg-red-500"
                  : isNearLimit
                    ? "bg-amber-500"
                    : colors.progressBg
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 flex-shrink-0">
        {stats.todayCount > 0 && (
          <button
            onClick={undoLast}
            className={`p-1.5 rounded-lg ${colors.buttonBg} ${colors.textMuted} transition-colors`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleAdd}
          disabled={isOverLimit}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
            isOverLimit
              ? `${colors.isLightMode ? "bg-black/10 text-black/30" : "bg-white/10 text-white/30"} cursor-not-allowed`
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/20"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {isOverLimit ? "Limit" : "Add Coffee"}
        </button>
      </div>

      {/* Stats */}
      <div
        className={`flex items-center justify-around flex-shrink-0 pt-1 border-t ${colors.border}`}
      >
        <div className="flex items-center gap-1">
          <Flame className="w-2.5 h-2.5 text-orange-400" />
          <span className={`text-[10px] font-bold ${colors.textPrimary}`}>
            {stats.currentStreak}
          </span>
          <span className={`text-[8px] ${colors.textMuted}`}>streak</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className={`w-2.5 h-2.5 ${colors.textMuted}`} />
          <span className={`text-[10px] font-bold ${colors.textPrimary}`}>
            {timeUntilReset}
          </span>
          <span className={`text-[8px] ${colors.textMuted}`}>reset</span>
        </div>
      </div>
    </div>
  );
}
