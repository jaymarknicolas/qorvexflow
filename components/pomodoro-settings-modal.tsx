"use client";

import { useState, useEffect } from "react";
import { X, Clock, Coffee, Sunset, Bell, Zap, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PomodoroWidgetSettings } from "@/types/widget-settings";

interface PomodoroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroWidgetSettings;
  onSave: (settings: Partial<PomodoroWidgetSettings>) => void;
  onTestSound?: () => void;
}

export default function PomodoroSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  onTestSound,
}: PomodoroSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<PomodoroWidgetSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaults: PomodoroWidgetSettings = {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartPomodoros: true,
      enableNotifications: true,
    };
    setLocalSettings(defaults);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - highest z-index to cover everything */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <div
              onClick={handleModalClick}
              className="pointer-events-auto bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Pomodoro Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white/60 hover:text-white" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="space-y-5 sm:space-y-6">
                  {/* Timer Durations */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Timer Durations
                    </h3>

                    {/* Work Duration */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm text-white/70">
                        <span className="flex items-center gap-2">
                          🍅 Focus Time
                        </span>
                        <span className="text-cyan-400 font-mono">{localSettings.workDuration} min</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        step="1"
                        value={localSettings.workDuration}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            workDuration: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex justify-between text-xs text-white/40">
                        <span>1 min</span>
                        <span>60 min</span>
                      </div>
                    </div>

                    {/* Short Break Duration */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm text-white/70">
                        <span className="flex items-center gap-2">
                          <Coffee className="w-4 h-4" />
                          Short Break
                        </span>
                        <span className="text-green-400 font-mono">{localSettings.breakDuration} min</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={localSettings.breakDuration}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            breakDuration: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-xs text-white/40">
                        <span>1 min</span>
                        <span>30 min</span>
                      </div>
                    </div>

                    {/* Long Break Duration */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm text-white/70">
                        <span className="flex items-center gap-2">
                          <Sunset className="w-4 h-4" />
                          Long Break
                        </span>
                        <span className="text-purple-400 font-mono">{localSettings.longBreakDuration} min</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={localSettings.longBreakDuration}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            longBreakDuration: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-white/40">
                        <span>5 min</span>
                        <span>60 min</span>
                      </div>
                    </div>

                    {/* Long Break Interval */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm text-white/70">
                        <span>Sessions until long break</span>
                        <span className="text-yellow-400 font-mono">{localSettings.longBreakInterval}</span>
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        step="1"
                        value={localSettings.longBreakInterval}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            longBreakInterval: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                      <div className="flex justify-between text-xs text-white/40">
                        <span>2 sessions</span>
                        <span>8 sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-start Options */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Auto-start
                    </h3>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-sm text-white/70">Auto-start breaks</span>
                      <input
                        type="checkbox"
                        checked={localSettings.autoStartBreaks}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            autoStartBreaks: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-sm text-white/70">Auto-start focus sessions</span>
                      <input
                        type="checkbox"
                        checked={localSettings.autoStartPomodoros}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            autoStartPomodoros: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      Notifications
                    </h3>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-white/70 flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Enable sound & notifications
                        </span>
                        <span className="text-xs text-white/40">
                          Browser notifications and audio alerts
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localSettings.enableNotifications}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            enableNotifications: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
                      />
                    </label>

                    {onTestSound && (
                      <button
                        type="button"
                        onClick={onTestSound}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2 text-sm text-white/70 hover:text-cyan-400"
                      >
                        <Volume2 className="w-4 h-4" />
                        Test Notification Sound
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-white/10 flex-shrink-0 bg-slate-900/50">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors order-2 sm:order-1"
                >
                  Reset to Defaults
                </button>
                <div className="flex gap-3 order-1 sm:order-2">
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
