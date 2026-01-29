"use client";

import { Coffee, Plus, Undo2, Flame, Clock } from "lucide-react";
import { useCoffeeCounter } from "@/lib/hooks/useCoffeeCounter";

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

  const handleAdd = () => {
    if (!isOverLimit) addCoffee("regular");
  };

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Counter */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-white/70">Coffee</span>
        </div>
        <span className="text-[10px] text-white/40">
          {settings.dailyLimit - stats.todayCount} left
        </span>
      </div>

      {/* Big number */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div
          className={`text-4xl font-bold ${
            isOverLimit ? "text-red-400" : "text-white"
          }`}
        >
          {stats.todayCount}
        </div>
        <div className="text-[10px] text-white/40">
          of {settings.dailyLimit} cups
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-[140px] mt-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverLimit
                  ? "bg-red-500"
                  : isNearLimit
                  ? "bg-amber-500"
                  : "bg-amber-400"
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
            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleAdd}
          disabled={isOverLimit}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isOverLimit
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {isOverLimit ? "Limit" : "Add Coffee"}
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-around flex-shrink-0 pt-1 border-t border-white/10">
        <div className="flex items-center gap-1">
          <Flame className="w-2.5 h-2.5 text-orange-400" />
          <span className="text-[10px] font-bold text-white">
            {stats.currentStreak}
          </span>
          <span className="text-[8px] text-white/40">streak</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-white/40" />
          <span className="text-[10px] font-bold text-white">
            {timeUntilReset}
          </span>
          <span className="text-[8px] text-white/40">reset</span>
        </div>
      </div>
    </div>
  );
}
