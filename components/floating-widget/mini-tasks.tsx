"use client";

import { useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { useTasks } from "@/lib/hooks";

export default function MiniTasks() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setNewTask("");
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="flex flex-col h-full p-3 gap-2">
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
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <p className="text-white/30 text-xs text-center py-4">
            No tasks yet
          </p>
        )}

        {activeTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="w-4 h-4 rounded border border-white/20 flex-shrink-0 hover:border-cyan-400 transition-colors flex items-center justify-center"
            />
            <span className="text-sm text-white/80 flex-1 truncate">
              {task.title}
            </span>
            <button
              onClick={() => removeTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-white/30 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {completedTasks.length > 0 && (
          <>
            <div className="text-[10px] text-white/30 uppercase tracking-wider px-2 pt-2">
              Completed ({completedTasks.length})
            </div>
            {completedTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 px-2 py-1 rounded-lg group"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="w-4 h-4 rounded bg-cyan-500/20 border border-cyan-500/30 flex-shrink-0 flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-cyan-400" />
                </button>
                <span className="text-xs text-white/30 flex-1 truncate line-through">
                  {task.title}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-white/30 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Counter */}
      <div className="flex-shrink-0 text-[10px] text-white/30 text-center">
        {activeTasks.length} active / {completedTasks.length} done
      </div>
    </div>
  );
}
