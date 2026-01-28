"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ListTodo,
  Clock,
  AlertTriangle,
  Flag,
  Minus,
  History,
  Sparkles,
  ArrowUpDown,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useTasks } from "@/lib/hooks";
import { validateTaskTitle } from "@/lib/utils/validation";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";

// Using existing type: "low" | "medium" | "high" with user-friendly labels
type Priority = "high" | "medium" | "low";
type StatusFilter = "all" | "active" | "completed";
type PriorityFilter = "all" | "high" | "medium" | "low";
type SortType = "newest" | "oldest" | "priority";

const PRIORITY_CONFIG = {
  high: {
    label: "Urgent",
    shortLabel: "!",
    color: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    dot: "bg-red-400",
    icon: AlertTriangle,
  },
  medium: {
    label: "Important",
    shortLabel: "↑",
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
    icon: Flag,
  },
  low: {
    label: "Normal",
    shortLabel: "—",
    color: "text-slate-400",
    bg: "bg-slate-500/20",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
    icon: Minus,
  },
};

// Format relative time
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Format full date
const formatFullDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function TaskList() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isVeryCompact, setIsVeryCompact] = useState(false);

  // Container resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height, width } = entry.contentRect;
        setIsVeryCompact(height < 320 || width < 300);
        setIsCompact(height < 420 || width < 360);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
    clearCompleted,
    completedCount,
    activeCount,
    completionRate,
  } = useTasks();

  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority>("low");
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [showPriorityFilter, setShowPriorityFilter] = useState(false);
  const [sort, setSort] = useState<SortType>("newest");
  const [showHistory, setShowHistory] = useState(false);

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          accentBgHover: isLightMode ? "hover:bg-green-300/50" : "hover:bg-emerald-500/30",
          border: isLightMode ? "border-green-300/50" : "border-emerald-500/20",
          checkColor: isLightMode ? "text-green-700" : "text-emerald-400",
          button: isLightMode
            ? "from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500"
            : "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400",
          buttonShadow: "shadow-emerald-500/25",
          inputBg: isLightMode ? "bg-white/70" : "bg-black/30",
          inputFocus: "focus:ring-emerald-500/30 focus:border-emerald-400/50",
          cardHover: isLightMode ? "hover:bg-green-200/50" : "hover:bg-emerald-500/10",
          tabActive: isLightMode ? "bg-green-200/60 text-green-800" : "bg-emerald-500/20 text-emerald-300",
          progress: "bg-emerald-500",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800/80" : "text-white/80",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-green-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-green-100/80" : "bg-slate-900/95",
          bgOverlay: isLightMode ? "bg-green-100/50" : "bg-black/20",
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          accentBgHover: isLightMode ? "hover:bg-amber-300/50" : "hover:bg-amber-500/30",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          checkColor: isLightMode ? "text-amber-800" : "text-amber-400",
          button: isLightMode
            ? "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
            : "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
          buttonShadow: "shadow-amber-500/25",
          inputBg: isLightMode ? "bg-white/70" : "bg-black/30",
          inputFocus: "focus:ring-amber-500/30 focus:border-amber-400/50",
          cardHover: isLightMode ? "hover:bg-amber-200/50" : "hover:bg-amber-500/10",
          tabActive: isLightMode ? "bg-amber-200/60 text-amber-800" : "bg-amber-500/20 text-amber-300",
          progress: "bg-amber-500",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-900/80" : "text-white/80",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-amber-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-amber-100/80" : "bg-slate-900/95",
          bgOverlay: isLightMode ? "bg-amber-100/50" : "bg-black/20",
        };
      default:
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          accentBgHover: isLightMode ? "hover:bg-violet-300/50" : "hover:bg-violet-500/30",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          checkColor: isLightMode ? "text-violet-700" : "text-violet-400",
          button: isLightMode
            ? "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            : "from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400",
          buttonShadow: "shadow-violet-500/25",
          inputBg: isLightMode ? "bg-white/70" : "bg-black/30",
          inputFocus: "focus:ring-violet-500/30 focus:border-violet-400/50",
          cardHover: isLightMode ? "hover:bg-violet-200/50" : "hover:bg-violet-500/10",
          tabActive: isLightMode ? "bg-violet-200/60 text-violet-800" : "bg-violet-500/20 text-violet-300",
          progress: "bg-violet-500",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-900/80" : "text-white/80",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
          hoverBg: isLightMode ? "hover:bg-violet-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-violet-100/80" : "bg-slate-900/95",
          bgOverlay: isLightMode ? "bg-violet-100/50" : "bg-black/20",
        };
    }
  }, [theme, isLightMode]);

  const colors = getThemeColors();

  // Count tasks by priority
  const priorityCounts = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.completed);
    return {
      high: activeTasks.filter((t) => t.priority === "high").length,
      medium: activeTasks.filter((t) => t.priority === "medium").length,
      low: activeTasks.filter((t) => !t.priority || t.priority === "low").length,
    };
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.completed);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((t) => {
        const taskPriority = t.priority || "low";
        return taskPriority === priorityFilter;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = (a.priority as Priority) || "low";
        const bPriority = (b.priority as Priority) || "low";
        const priorityDiff = priorityOrder[aPriority] - priorityOrder[bPriority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.createdAt - a.createdAt;
      } else if (sort === "oldest") {
        return a.createdAt - b.createdAt;
      }
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [tasks, statusFilter, priorityFilter, sort]);

  // Completed tasks history
  const completedHistory = useMemo(() => {
    return tasks
      .filter((t) => t.completed && t.completedAt)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [tasks]);

  // Add task with priority
  const handleAddTaskWithPriority = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = newTask.trim();
    if (!trimmedTitle) {
      setError("Task cannot be empty");
      return;
    }

    const validation = validateTaskTitle(trimmedTitle);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    const success = addTask(trimmedTitle);

    if (success) {
      setTimeout(() => {
        const addedTask = tasks.find((t) => t.title === trimmedTitle && !t.priority);
        if (addedTask && selectedPriority !== "low") {
          updateTask(addedTask.id, { priority: selectedPriority });
        }
      }, 50);
      setNewTask("");
      setSelectedPriority("low");
    } else {
      setError("Failed to add task");
    }
  };

  const getPriorityConfig = (priority?: string) => {
    // Handle any priority value, defaulting to "low" for unknown values
    if (priority && priority in PRIORITY_CONFIG) {
      return PRIORITY_CONFIG[priority as Priority];
    }
    return PRIORITY_CONFIG.low;
  };

  // Render task item
  const renderTask = (task: typeof tasks[0], showDate = false) => {
    const priorityConfig = getPriorityConfig(task.priority);
    const PriorityIcon = priorityConfig?.icon || Minus;

    return (
      <div
        key={task.id}
        className={`group/task flex items-start gap-2 rounded-lg ${isLightMode ? 'bg-black/5' : 'bg-white/5'} ${colors.cardHover} border ${colors.border} transition-all ${
          isVeryCompact ? "p-2" : "p-3"
        } ${task.completed ? "opacity-60" : ""}`}
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className="flex-shrink-0 mt-0.5"
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed ? (
            <CheckCircle2 className={`${isVeryCompact ? "w-4 h-4" : "w-5 h-5"} ${colors.checkColor}`} />
          ) : (
            <Circle className={`${isVeryCompact ? "w-4 h-4" : "w-5 h-5"} ${colors.textMuted} group-hover/task:${isLightMode ? 'text-black/60' : 'text-white/60'}`} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {/* Priority indicator */}
            {task.priority && task.priority !== "low" && priorityConfig && (
              <span
                className={`flex-shrink-0 mt-0.5 ${priorityConfig.color} ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                title={priorityConfig.label}
              >
                <PriorityIcon className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              </span>
            )}

            <span
              className={`flex-1 font-medium break-words ${
                isVeryCompact ? "text-xs" : "text-sm"
              } ${task.completed ? `${colors.textMuted} line-through` : colors.textPrimary}`}
            >
              {task.title}
            </span>
          </div>

          {/* Meta info */}
          {(showDate || !isVeryCompact) && (
            <div className={`flex items-center gap-2 mt-1 ${colors.textMuted} ${
              isVeryCompact ? "text-[9px]" : "text-[11px]"
            }`}>
              <Clock className={isVeryCompact ? "w-2.5 h-2.5" : "w-3 h-3"} />
              <span title={formatFullDate(task.createdAt)}>
                {showDate && task.completedAt
                  ? `Completed ${formatRelativeTime(task.completedAt)}`
                  : formatRelativeTime(task.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={() => removeTask(task.id)}
          className={`opacity-0 group-hover/task:opacity-100 transition-opacity flex-shrink-0 ${
            isVeryCompact ? "p-0.5" : "p-1"
          }`}
          aria-label="Delete task"
        >
          <Trash2 className={`${isVeryCompact ? "w-3 h-3" : "w-4 h-4"} text-red-400/60 hover:text-red-400`} />
        </button>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border} shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className={`flex-shrink-0 border-b ${colors.border} ${colors.bgOverlay} ${
        isVeryCompact ? "p-2" : "p-3"
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`rounded-lg ${colors.accentBg} ${isVeryCompact ? "p-1" : "p-1.5"}`}>
              <ListTodo className={`${colors.accent} ${isVeryCompact ? "w-3 h-3" : "w-4 h-4"}`} />
            </div>
            <div className="min-w-0">
              <h2 className={`font-bold ${colors.textPrimary} truncate ${
                isVeryCompact ? "text-xs" : isCompact ? "text-sm" : "text-base"
              }`}>
                Tasks
              </h2>
              {!isVeryCompact && (
                <p className={`text-[10px] ${colors.textMuted}`}>
                  {activeCount} active · {completedCount} done
                </p>
              )}
            </div>
          </div>

          {/* Progress & Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Progress badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${colors.accentBg} ${
              isVeryCompact ? "text-[10px]" : "text-xs"
            }`}>
              <div className={`${isVeryCompact ? "w-8" : "w-12"} h-1.5 ${isLightMode ? 'bg-black/15' : 'bg-white/20'} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${colors.progress} transition-all duration-300`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className={`${colors.accent} font-medium`}>{completionRate.toFixed(0)}%</span>
            </div>

            {/* History toggle */}
            {completedCount > 0 && !isVeryCompact && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`rounded-lg transition-colors ${
                  showHistory ? `${colors.accentBg} ${colors.accent}` : `${isLightMode ? 'bg-black/10' : 'bg-white/10'} ${colors.textMuted} ${colors.hoverBg} hover:${isLightMode ? 'text-black' : 'text-white'}`
                } ${isVeryCompact ? "p-1" : "p-1.5"}`}
                title="View history"
              >
                <History className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {!showHistory && (
          <div className={`${isVeryCompact ? "mt-2" : "mt-3"}`}>
            {/* Status filter tabs */}
            <div className="flex items-center gap-1">
              {(["all", "active", "completed"] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 rounded-lg font-medium transition-colors capitalize ${
                    isVeryCompact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
                  } ${statusFilter === f ? colors.tabActive : `${colors.textMuted} hover:${isLightMode ? 'text-black' : 'text-white'} ${colors.hoverBg}`}`}
                >
                  {f}
                </button>
              ))}

              {/* Priority filter dropdown */}
              <div className="relative ml-1">
                <button
                  onClick={() => setShowPriorityFilter(!showPriorityFilter)}
                  className={`rounded-lg flex items-center gap-1 transition-colors ${
                    isVeryCompact ? "p-1" : "px-2 py-1.5"
                  } ${
                    priorityFilter !== "all"
                      ? `${PRIORITY_CONFIG[priorityFilter].bg} ${PRIORITY_CONFIG[priorityFilter].color}`
                      : `${isLightMode ? 'bg-black/10' : 'bg-white/10'} ${colors.textMuted} ${colors.hoverBg} hover:${isLightMode ? 'text-black' : 'text-white'}`
                  }`}
                  title="Filter by priority"
                >
                  <Filter className={isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                  {!isVeryCompact && priorityFilter !== "all" && (
                    <span className="text-[10px]">{PRIORITY_CONFIG[priorityFilter].label}</span>
                  )}
                </button>

                {showPriorityFilter && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowPriorityFilter(false)} />
                    <div className={`absolute right-0 top-full mt-1 z-50 ${colors.surfaceBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl overflow-hidden min-w-[130px]`}>
                      <button
                        onClick={() => {
                          setPriorityFilter("all");
                          setShowPriorityFilter(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 transition-colors ${
                          priorityFilter === "all"
                            ? `${colors.accentBg} ${colors.accent}`
                            : `${colors.textSecondary} ${colors.hoverBg}`
                        } ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                      >
                        <span>All Priorities</span>
                      </button>
                      {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                        const config = PRIORITY_CONFIG[p];
                        const Icon = config.icon;
                        const count = priorityCounts[p];
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              setPriorityFilter(p);
                              setShowPriorityFilter(false);
                            }}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 transition-colors ${
                              priorityFilter === p
                                ? `${config.bg} ${config.color}`
                                : `${colors.textSecondary} ${colors.hoverBg}`
                            } ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                              {config.label}
                            </span>
                            {count > 0 && (
                              <span className={colors.textMuted}>{count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Sort button */}
              <button
                onClick={() => setSort(sort === "newest" ? "priority" : sort === "priority" ? "oldest" : "newest")}
                className={`rounded-lg ${isLightMode ? 'bg-black/10' : 'bg-white/10'} ${colors.textMuted} ${colors.hoverBg} hover:${isLightMode ? 'text-black' : 'text-white'} transition-colors ${
                  isVeryCompact ? "p-1" : "p-1.5"
                }`}
                title={`Sort: ${sort}`}
              >
                <ArrowUpDown className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              </button>
            </div>
          </div>
        )}

        {/* History header */}
        {showHistory && (
          <div className={`flex items-center justify-between ${isVeryCompact ? "mt-2" : "mt-3"}`}>
            <p className={`${colors.accent} font-medium ${isVeryCompact ? "text-[10px]" : "text-xs"}`}>
              Completed Tasks History
            </p>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className={`text-red-400/70 hover:text-red-400 transition-colors ${
                  isVeryCompact ? "text-[10px]" : "text-xs"
                }`}
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className={`flex-1 overflow-y-auto ${isVeryCompact ? "p-2" : "p-3"}`}>
        {showHistory ? (
          completedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <History className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`} />
              <p className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}>No completed tasks yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedHistory.map((task) => renderTask(task, true))}
            </div>
          )
        ) : (
          filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {statusFilter === "completed" ? (
                <>
                  <CheckCircle2 className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`} />
                  <p className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}>No completed tasks</p>
                </>
              ) : statusFilter === "active" && priorityFilter === "all" ? (
                <>
                  <Sparkles className={`${colors.accent} opacity-40 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`} />
                  <p className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}>All tasks completed!</p>
                </>
              ) : priorityFilter !== "all" ? (
                <>
                  {(() => {
                    const Icon = PRIORITY_CONFIG[priorityFilter].icon;
                    return <Icon className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`} />;
                  })()}
                  <p className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}>
                    No {PRIORITY_CONFIG[priorityFilter].label.toLowerCase()} tasks
                  </p>
                </>
              ) : (
                <>
                  <ListTodo className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`} />
                  <p className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}>No tasks yet</p>
                  {!isVeryCompact && (
                    <p className="text-white/30 text-xs mt-1">Add one below to get started</p>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => renderTask(task))}
            </div>
          )
        )}
      </div>

      {/* Add Task Form */}
      {!showHistory && (
        <div className={`flex-shrink-0 border-t border-white/10 bg-black/20 ${
          isVeryCompact ? "p-2" : "p-3"
        }`}>
          {error && (
            <div className={`mb-2 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg ${
              isVeryCompact ? "text-[10px]" : "text-xs"
            }`}>
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleAddTaskWithPriority} className="flex gap-2">
            {/* Priority selector with label */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className={`flex items-center gap-1.5 rounded-lg border ${
                  PRIORITY_CONFIG[selectedPriority].border
                } ${PRIORITY_CONFIG[selectedPriority].bg} ${PRIORITY_CONFIG[selectedPriority].color} transition-colors ${
                  isVeryCompact ? "px-2 py-1.5" : "px-2.5 py-2"
                }`}
                title={`Priority: ${PRIORITY_CONFIG[selectedPriority].label}`}
              >
                {(() => {
                  const Icon = PRIORITY_CONFIG[selectedPriority].icon;
                  return <Icon className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />;
                })()}
                {!isVeryCompact && (
                  <ChevronDown className="w-3 h-3 opacity-60" />
                )}
              </button>

              {showPriorityMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPriorityMenu(false)} />
                  <div className={`absolute bottom-full left-0 mb-2 z-50 bg-slate-900/95 backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl overflow-hidden`}>
                    <div className={`px-3 py-1.5 border-b border-white/10 ${isVeryCompact ? "text-[9px]" : "text-[10px]"} text-white/40 font-medium`}>
                      Set Priority
                    </div>
                    {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                      const config = PRIORITY_CONFIG[p];
                      const Icon = config.icon;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setSelectedPriority(p);
                            setShowPriorityMenu(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 transition-colors min-w-[120px] ${
                            selectedPriority === p
                              ? `${config.bg} ${config.color}`
                              : "text-white/70 hover:bg-white/10"
                          } ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                        >
                          <Icon className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Input */}
            <input
              type="text"
              value={newTask}
              onChange={(e) => {
                setNewTask(e.target.value);
                setError(null);
              }}
              placeholder={isVeryCompact ? "Add task..." : "Add a new task..."}
              maxLength={200}
              className={`flex-1 ${colors.inputBg} border ${colors.border} rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 ${colors.inputFocus} transition-colors ${
                isVeryCompact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
              }`}
              aria-label="New task"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={!newTask.trim()}
              className={`bg-gradient-to-r ${colors.button} text-white rounded-lg font-medium transition-all shadow-lg ${colors.buttonShadow} disabled:opacity-40 disabled:cursor-not-allowed ${
                isVeryCompact ? "px-3 py-1.5" : "px-4 py-2"
              }`}
              aria-label="Add task"
            >
              <Plus className={isVeryCompact ? "w-4 h-4" : "w-5 h-5"} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
