"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Coffee,
  Plus,
  Minus,
  Settings,
  Flame,
  TrendingUp,
  Clock,
  Undo2,
  AlertTriangle,
} from "lucide-react";
import { useCoffeeCounter } from "@/lib/hooks/useCoffeeCounter";
import { useTheme } from "@/lib/contexts/theme-context";
import { motion, AnimatePresence } from "framer-motion";

export default function CoffeeCounterWidget() {
  const { theme } = useTheme();
  const {
    todayEntries,
    settings,
    stats,
    addCoffee,
    undoLast,
    updateSettings,
    isOverLimit,
    isNearLimit,
    progressPercent,
    caffeinePercent,
    timeUntilReset,
  } = useCoffeeCounter();

  const [showSettings, setShowSettings] = useState(false);
  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const [tempLimit, setTempLimit] = useState(settings.dailyLimit);

  // Sync temp limit with settings
  useEffect(() => {
    setTempLimit(settings.dailyLimit);
  }, [settings.dailyLimit]);

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
          iconColor: "text-emerald-400",
          buttonBg: "bg-emerald-500/20 hover:bg-emerald-500/30",
          progressBg: "bg-emerald-500",
          coffeeColor: "text-amber-600",
          cupFill: "#92400e",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          glowFrom: "from-amber-500/30",
          glowTo: "to-orange-500/20",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/25",
          border: "border-amber-400/30",
          iconColor: "text-amber-400",
          buttonBg: "bg-amber-500/20 hover:bg-amber-500/30",
          progressBg: "bg-amber-500",
          coffeeColor: "text-amber-700",
          cupFill: "#78350f",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          glowFrom: "from-violet-500/30",
          glowTo: "to-pink-500/20",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/25",
          border: "border-violet-400/30",
          iconColor: "text-violet-400",
          buttonBg: "bg-violet-500/20 hover:bg-violet-500/30",
          progressBg: "bg-violet-500",
          coffeeColor: "text-amber-600",
          cupFill: "#92400e",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  // Handle add coffee with animation
  const handleAddCoffee = () => {
    if (!isOverLimit) {
      addCoffee("regular");
      setShowAddAnimation(true);
      setTimeout(() => setShowAddAnimation(false), 600);
    }
  };

  // Handle undo
  const handleUndo = () => {
    undoLast();
  };

  // Save settings
  const handleSaveSettings = () => {
    updateSettings({ dailyLimit: tempLimit });
    setShowSettings(false);
  };

  // Get status message
  const getStatusMessage = () => {
    if (isOverLimit) {
      return { text: "Daily limit reached!", color: "text-red-400" };
    }
    if (isNearLimit) {
      return { text: "Almost at your limit", color: "text-amber-400" };
    }
    if (stats.todayCount === 0) {
      return { text: "No coffee yet today", color: "text-white/60" };
    }
    return {
      text: `${settings.dailyLimit - stats.todayCount} more cups allowed`,
      color: "text-white/60",
    };
  };

  const status = getStatusMessage();

  // Render coffee cups
  const renderCoffeeCups = () => {
    const cups = [];
    for (let i = 0; i < settings.dailyLimit; i++) {
      const isFilled = i < stats.todayCount;
      cups.push(
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="relative"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
              isFilled ? colors.coffeeColor : "text-white/20"
            }`}
            fill="currentColor"
          >
            {/* Coffee cup shape */}
            <path d="M2 21h18v-2H2v2zM20 8h-2V5H4v3H2v4c0 1.1.9 2 2 2h1.18C5.92 17.83 8.83 20 12 20s6.08-2.17 6.82-6H20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 6h-2.24c-.21.87-.65 1.64-1.24 2.26-.12.13-.25.25-.38.36-.48.4-1.03.71-1.62.92-.55.2-1.13.33-1.76.38-.21.02-.42.03-.64.04H12c-.21 0-.42-.01-.64-.04-.63-.05-1.22-.18-1.76-.38-.59-.21-1.14-.52-1.62-.92-.13-.11-.26-.23-.38-.36-.59-.62-1.03-1.39-1.24-2.26H4v-4h2V7h12v3h2v4z" />
            {/* Coffee liquid fill - only show if filled */}
            {isFilled && (
              <motion.rect
                initial={{ height: 0 }}
                animate={{ height: 6 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                x="6"
                y="9"
                width="10"
                height="6"
                rx="1"
                fill={colors.cupFill}
              />
            )}
          </svg>
          {/* Animated steam for filled cups */}
          {isFilled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 left-1/2 -translate-x-1/2"
            >
              <div className="text-white/30 text-[8px]">~</div>
            </motion.div>
          )}
        </motion.div>
      );
    }
    return cups;
  };

  return (
    <>
      <div className="relative h-full w-full overflow-hidden">
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
        />

        {/* Main container */}
        <div
          className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-6 lg:p-8 h-full w-full flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6 flex-shrink-0">
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1.5 rounded-lg ${colors.accentBg}`}>
                  <Coffee className={`w-4 h-4 ${colors.iconColor}`} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  Coffee Counter
                </h2>
              </div>
              <p className={`text-xs mt-1 truncate pl-8 ${status.color}`}>
                {status.text}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {stats.todayCount > 0 && (
                <button
                  onClick={handleUndo}
                  className={`p-1.5 sm:p-2 ${colors.buttonBg} text-white/60 hover:text-white rounded-lg transition-all duration-200`}
                  aria-label="Undo last coffee"
                  title="Undo last"
                >
                  <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className={`p-1.5 sm:p-2 ${colors.buttonBg} text-white/60 hover:text-white rounded-lg transition-all duration-200`}
                aria-label="Coffee settings"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Main Counter Display */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            {/* Big number display */}
            <div className="relative mb-4">
              <AnimatePresence>
                {showAddAnimation && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1, y: 0 }}
                    animate={{ scale: 1.5, opacity: 0, y: -30 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 flex items-center justify-center ${colors.accent} font-bold text-2xl`}
                  >
                    +1
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                key={stats.todayCount}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`text-5xl sm:text-6xl lg:text-7xl font-bold ${
                  isOverLimit ? "text-red-400" : "text-white"
                }`}
              >
                {stats.todayCount}
              </motion.div>
              <div className="text-center text-white/40 text-sm mt-1">
                of {settings.dailyLimit} cups
              </div>
            </div>

            {/* Coffee cups visualization */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 px-4 max-w-[200px]">
              {renderCoffeeCups()}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-[200px] mb-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isOverLimit
                      ? "bg-red-500"
                      : isNearLimit
                      ? "bg-amber-500"
                      : colors.progressBg
                  }`}
                />
              </div>
            </div>

            {/* Add Coffee Button */}
            <motion.button
              onClick={handleAddCoffee}
              disabled={isOverLimit}
              whileHover={{ scale: isOverLimit ? 1 : 1.05 }}
              whileTap={{ scale: isOverLimit ? 1 : 0.95 }}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                isOverLimit
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : `bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20`
              }`}
            >
              {isOverLimit ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Limit Reached
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Coffee
                </>
              )}
            </motion.button>
          </div>

          {/* Stats Footer */}
          <div
            className={`grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t ${colors.border} flex-shrink-0`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3 h-3 text-orange-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {stats.todayCaffeine}
              </div>
              <div className="text-[10px] sm:text-xs text-white/40">mg caffeine</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {stats.currentStreak}
              </div>
              <div className="text-[10px] sm:text-xs text-white/40">day streak</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {timeUntilReset}
              </div>
              <div className="text-[10px] sm:text-xs text-white/40">until reset</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {typeof window !== "undefined" &&
        showSettings &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-sm bg-gradient-to-br ${colors.gradient} rounded-2xl border ${colors.border} p-6 shadow-2xl`}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className={`w-5 h-5 ${colors.iconColor}`} />
                Coffee Settings
              </h3>

              {/* Daily Limit */}
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">
                  Daily Cup Limit
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTempLimit(Math.max(1, tempLimit - 1))}
                    className={`p-2 ${colors.buttonBg} rounded-lg transition-colors`}
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-white">
                      {tempLimit}
                    </span>
                    <span className="text-white/40 ml-2">cups</span>
                  </div>
                  <button
                    onClick={() => setTempLimit(Math.min(10, tempLimit + 1))}
                    className={`p-2 ${colors.buttonBg} rounded-lg transition-colors`}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className={`p-3 rounded-lg ${colors.accentBg} mb-6`}>
                <p className="text-xs text-white/70">
                  The FDA recommends limiting caffeine intake to 400mg per day
                  (about 4 cups of coffee) for healthy adults.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className={`flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-semibold transition-colors`}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </>
  );
}
