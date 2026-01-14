/**
 * useTasks Hook
 * Manages task list state and operations
 */

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/types";
import { tasksStorage } from "@/lib/services/storage";
import { TASK_LIMITS } from "@/lib/constants";

export interface UseTasksReturn {
  tasks: Task[];
  addTask: (title: string) => boolean;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  clearCompleted: () => void;
  completedCount: number;
  activeCount: number;
  completionRate: number;
}

// Persist tasks in memory across re-mounts (for when component re-renders)
let persistedTasks: Task[] | null = null;

export function useTasks(): UseTasksReturn {
  // Initialize from memory first, then localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (persistedTasks !== null) {
      return persistedTasks;
    }
    // Try to load from localStorage during initialization
    if (typeof window !== "undefined") {
      const savedTasks = tasksStorage.load();
      persistedTasks = savedTasks;
      return savedTasks;
    }
    return [];
  });

  // Keep memory state in sync
  useEffect(() => {
    persistedTasks = tasks;
  }, [tasks]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    tasksStorage.save(tasks);
  }, [tasks]);

  const addTask = useCallback(
    (title: string): boolean => {
      const trimmedTitle = title.trim();

      // Validation
      if (!trimmedTitle) {
        console.warn("Task title cannot be empty");
        return false;
      }

      if (trimmedTitle.length > TASK_LIMITS.MAX_TITLE_LENGTH) {
        console.warn(`Task title exceeds maximum length of ${TASK_LIMITS.MAX_TITLE_LENGTH}`);
        return false;
      }

      if (tasks.length >= TASK_LIMITS.MAX_TASKS) {
        console.warn(`Cannot add more than ${TASK_LIMITS.MAX_TASKS} tasks`);
        return false;
      }

      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: trimmedTitle,
        completed: false,
        createdAt: Date.now(),
      };

      setTasks((prev) => [...prev, newTask]);
      return true;
    },
    [tasks.length]
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? Date.now() : undefined,
            }
          : task
      )
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completionRate =
    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
    clearCompleted,
    completedCount,
    activeCount,
    completionRate,
  };
}
