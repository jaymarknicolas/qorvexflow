"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Check, Trash2, ListTodo } from "lucide-react";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";
import type { Task } from "@/types";

// Storage key for tasks
const STORAGE_KEY = "qorvexflow-tasks";

export default function MiniTasks() {
  const colors = useWidgetTheme();
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Sync with localStorage changes from other windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setTasks(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save to localStorage
  const saveTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  }, []);

  const addTask = useCallback(
    (title: string) => {
      const newTaskItem: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      saveTasks([...tasks, newTaskItem]);
    },
    [tasks, saveTasks],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const updated = tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? Date.now() : undefined,
            }
          : task,
      );
      saveTasks(updated);
    },
    [tasks, saveTasks],
  );

  const removeTask = useCallback(
    (id: string) => {
      saveTasks(tasks.filter((task) => task.id !== id));
    },
    [tasks, saveTasks],
  );

  const handleAdd = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setNewTask("");
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border}   overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${colors.accentBg}`}>
            <ListTodo className={`w-3.5 h-3.5 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-sm font-bold ${colors.textPrimary}`}>Tasks</h2>
        </div>
        {tasks.length > 0 && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${colors.accentBg} ${colors.accent}`}
          >
            {activeTasks.length} active
          </span>
        )}
      </div>

      {/* Add Task */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          className={`flex-1 px-3 py-1.5 rounded-lg ${
            colors.isLightMode
              ? "bg-black/5 border-black/10 text-black placeholder:text-black/30"
              : "bg-white/5 border-white/10 text-white placeholder:text-white/30"
          } border text-sm focus:outline-none focus:border-current`}
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <p className={`${colors.textMuted} text-xs text-center py-4`}>
            No tasks yet
          </p>
        )}

        {activeTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
              colors.isLightMode ? "hover:bg-black/5" : "hover:bg-white/5"
            } group`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-4 h-4 rounded border ${
                colors.isLightMode
                  ? "border-black/20 hover:border-current"
                  : "border-white/20 hover:border-cyan-400"
              } flex-shrink-0 transition-colors flex items-center justify-center`}
            />
            <span className={`text-sm ${colors.textSecondary} flex-1 truncate`}>
              {task.title}
            </span>
            <button
              onClick={() => removeTask(task.id)}
              className={`opacity-0 group-hover:opacity-100 p-0.5 ${colors.textMuted} hover:text-red-400 transition-all`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {completedTasks.length > 0 && (
          <>
            <div
              className={`text-[10px] ${colors.textMuted} uppercase tracking-wider px-2 pt-2`}
            >
              Completed ({completedTasks.length})
            </div>
            {completedTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 px-2 py-1 rounded-lg group"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-4 h-4 rounded ${colors.accentBg} border ${colors.border} flex-shrink-0 flex items-center justify-center`}
                >
                  <Check className={`w-2.5 h-2.5 ${colors.accent}`} />
                </button>
                <span
                  className={`text-xs ${colors.textMuted} flex-1 truncate line-through`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className={`opacity-0 group-hover:opacity-100 p-0.5 ${colors.textMuted} hover:text-red-400 transition-all`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Counter */}
      <div
        className={`flex-shrink-0 text-[10px] ${colors.textMuted} text-center`}
      >
        {activeTasks.length} active / {completedTasks.length} done
      </div>
    </div>
  );
}
