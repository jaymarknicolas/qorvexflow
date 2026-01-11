"use client";

import type React from "react";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTask.trim(),
        completed: false,
      },
    ]);

    setNewTask("");
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleRemoveTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completedTasks = tasks.filter((t) => t.completed);
  const completionRate =
    tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

      <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-white">To-Do List</h2>
          <div className="text-xs font-semibold px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
            {completionRate.toFixed(0)}%
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-white/80">
            Today&apos;s Tasks
          </h3>

          {tasks.length === 0 ? (
            <p className="text-white/50 text-sm py-4">
              No tasks yet. Add one to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/40 group-hover:text-white/60" />
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm font-medium ${
                      task.completed
                        ? "text-white/50 line-through"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </span>

                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-400/60 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
