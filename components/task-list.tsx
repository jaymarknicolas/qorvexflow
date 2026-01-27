"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Plus, Trash2, CheckCircle2, Circle, X, ListTodo } from "lucide-react";
import { useTasks } from "@/lib/hooks";
import { validateTaskTitle } from "@/lib/utils/validation";
import { useTheme } from "@/lib/contexts/theme-context";

export default function TaskList() {
  const { theme } = useTheme();

  const {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    clearCompleted,
    completedCount,
    activeCount,
    completionRate,
  } = useTasks();

  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState<string | null>(null);

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
          checkColor: "text-emerald-400",
          badgeBg: "bg-emerald-500/25",
          badgeText: "text-emerald-300",
          buttonBg: "bg-emerald-500/20 hover:bg-emerald-500/30",
          buttonText: "text-emerald-300",
          inputFocus: "focus:border-emerald-400/40 focus:ring-emerald-500/20",
          hoverBg: "hover:bg-emerald-500/10",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/90 to-amber-950/90",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          border: "border-amber-500/20",
          checkColor: "text-amber-400",
          badgeBg: "bg-amber-500/20",
          badgeText: "text-amber-300",
          buttonBg: "bg-amber-500/20 hover:bg-amber-500/30",
          buttonText: "text-amber-300",
          inputFocus: "focus:border-amber-400/40 focus:ring-amber-500/20",
          hoverBg: "hover:bg-amber-500/10",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/90 to-purple-900/90",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          border: "border-violet-500/20",
          checkColor: "text-violet-400",
          badgeBg: "bg-violet-500/20",
          badgeText: "text-violet-300",
          buttonBg: "bg-violet-500/20 hover:bg-violet-500/30",
          buttonText: "text-violet-300",
          inputFocus: "focus:border-violet-400/40 focus:ring-violet-500/20",
          hoverBg: "hover:bg-violet-500/10",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateTaskTitle(newTask);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    const success = addTask(newTask);
    if (success) {
      setNewTask("");
    } else {
      setError("Failed to add task");
    }
  };

  return (
    <div className="relative group h-full">
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100`} />

      <div className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-6 lg:p-8 h-full flex flex-col`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colors.accentBg}`}>
              <ListTodo className={`w-4 h-4 ${colors.accent}`} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">To-Do List</h2>
              <p className="text-xs text-white/60 mt-0.5">
                {activeCount} active, {completedCount} completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs font-semibold px-3 py-1 ${colors.badgeBg} ${colors.badgeText} rounded-full`}>
              {completionRate.toFixed(0)}%
            </div>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs px-2 py-1 text-red-400/80 hover:text-red-400 transition-colors"
                aria-label="Clear completed tasks"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3 mb-4 sm:mb-6 flex-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-white/20 mb-2" />
              <p className="text-white/50 text-sm">
                No tasks yet. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group/task flex items-center gap-3 p-3 rounded-lg bg-white/5 ${colors.hoverBg} border ${colors.border} transition-all`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className={`w-5 h-5 ${colors.checkColor}`} />
                    ) : (
                      <Circle className="w-5 h-5 text-white/40 group-hover/task:text-white/60" />
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm font-medium break-words ${
                      task.completed
                        ? "text-white/50 line-through"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </span>

                  <button
                    onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover/task:opacity-100 transition-opacity"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4 text-red-400/60 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <div className="mt-auto">
          {error && (
            <div className="mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => {
                setNewTask(e.target.value);
                setError(null);
              }}
              placeholder="Add a new task..."
              maxLength={200}
              className={`flex-1 px-4 py-2 bg-white/10 border ${colors.border} rounded-lg text-white placeholder-white/40 focus:outline-none ${colors.inputFocus} transition-colors`}
              aria-label="New task"
            />
            <button
              type="submit"
              className={`px-4 py-2 ${colors.buttonBg} ${colors.buttonText} rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={!newTask.trim()}
              aria-label="Add task"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
