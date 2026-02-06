/**
 * useTasks Hook
 * Manages task list state and operations
 */

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskStatus } from "@/types";
import { tasksStorage } from "@/lib/services/storage";
import { TASK_LIMITS } from "@/lib/constants";

export interface UseTasksReturn {
  tasks: Task[];
  addTask: (title: string, status?: TaskStatus, priority?: "low" | "medium" | "high") => boolean;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  moveTaskToColumn: (taskId: string, targetStatus: TaskStatus, targetIndex?: number) => void;
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
    (title: string, status: TaskStatus = "todo", priority: "low" | "medium" | "high" = "low"): boolean => {
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
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        title: trimmedTitle,
        completed: status === "done",
        status,
        priority,
        createdAt: Date.now(),
        completedAt: status === "done" ? Date.now() : undefined,
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

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const completed = status === "done";
        return {
          ...task,
          status,
          completed,
          completedAt: completed ? Date.now() : undefined,
        };
      })
    );
  }, []);

  const moveTaskToColumn = useCallback((taskId: string, targetStatus: TaskStatus, targetIndex?: number) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;

      const task = prev[taskIndex];
      const completed = targetStatus === "done";
      const updatedTask: Task = {
        ...task,
        status: targetStatus,
        completed,
        completedAt: completed ? Date.now() : undefined,
      };

      // Remove task from current position
      const newTasks = prev.filter((t) => t.id !== taskId);

      // If targetIndex is specified, insert at that position
      if (targetIndex !== undefined) {
        newTasks.splice(targetIndex, 0, updatedTask);
      } else {
        // Otherwise add to end
        newTasks.push(updatedTask);
      }

      return newTasks;
    });
  }, []);

  const reorderTasks = useCallback((activeId: string, overId: string) => {
    setTasks((prev) => {
      const oldIndex = prev.findIndex((task) => task.id === activeId);
      const newIndex = prev.findIndex((task) => task.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newTasks = [...prev];
      const [movedTask] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, movedTask);

      return newTasks;
    });
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
    updateTaskStatus,
    reorderTasks,
    moveTaskToColumn,
    clearCompleted,
    completedCount,
    activeCount,
    completionRate,
  };
}
