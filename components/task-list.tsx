"use client";

import type React from "react";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, X } from "lucide-react";
import { useTasks } from "@/lib/hooks";
import { validateTaskTitle } from "@/lib/utils/validation";

export default function TaskList() {
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
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

      <div className="relative bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">To-Do List</h2>
            <p className="text-xs text-white/60 mt-1">
              {activeCount} active, {completedCount} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
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

        <div className="space-y-3 mb-6 flex-1 overflow-y-auto">
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
                  className="group/task flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
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
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              aria-label="New task"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
