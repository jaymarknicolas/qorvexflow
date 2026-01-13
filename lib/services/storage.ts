/**
 * Local Storage Service
 * Handles all data persistence operations
 */

import type { StorageData } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

export class StorageService {
  private static isClient = typeof window !== "undefined";

  /**
   * Safely get item from localStorage
   */
  private static getItem(key: string): string | null {
    if (!this.isClient) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Safely set item in localStorage
   */
  private static setItem(key: string, value: string): boolean {
    if (!this.isClient) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Safely remove item from localStorage
   */
  private static removeItem(key: string): boolean {
    if (!this.isClient) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Load data from localStorage with fallback
   */
  static load<T>(key: string, defaultValue: T): T {
    const data = this.getItem(key);
    if (!data) return defaultValue;

    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error parsing localStorage data (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Save data to localStorage
   */
  static save<T>(key: string, data: T): boolean {
    try {
      const serialized = JSON.stringify(data);
      return this.setItem(key, serialized);
    } catch (error) {
      console.error(`Error serializing data for localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Remove data from localStorage
   */
  static remove(key: string): boolean {
    return this.removeItem(key);
  }

  /**
   * Clear all app data from localStorage
   */
  static clearAll(): boolean {
    if (!this.isClient) return false;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        this.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    if (!this.isClient) return false;
    try {
      const testKey = "__qorvexflow_test__";
      this.setItem(testKey, "test");
      this.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage size estimate (in KB)
   */
  static getStorageSize(): number {
    if (!this.isClient) return 0;
    let total = 0;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        const item = this.getItem(key);
        if (item) {
          total += item.length + key.length;
        }
      });
      return Math.round(total / 1024); // Convert to KB
    } catch (error) {
      console.error("Error calculating storage size:", error);
      return 0;
    }
  }

  /**
   * Export all data as JSON
   */
  static exportData(): Partial<StorageData> | null {
    if (!this.isClient) return null;
    try {
      const data: Partial<StorageData> = {};
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const item = this.getItem(storageKey);
        if (item) {
          try {
            data[key.toLowerCase() as keyof StorageData] = JSON.parse(item);
          } catch {
            // Skip invalid JSON
          }
        }
      });
      return data;
    } catch (error) {
      console.error("Error exporting data:", error);
      return null;
    }
  }

  /**
   * Import data from JSON
   */
  static importData(data: Partial<StorageData>): boolean {
    if (!this.isClient) return false;
    try {
      Object.entries(data).forEach(([key, value]) => {
        const storageKey = STORAGE_KEYS[key.toUpperCase() as keyof typeof STORAGE_KEYS];
        if (storageKey && value !== undefined) {
          this.save(storageKey, value);
        }
      });
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }
}

// Convenience methods for specific data types

export const workspaceStorage = {
  load: () =>
    StorageService.load(STORAGE_KEYS.WORKSPACE, {
      slotWidgets: {},
    }),
  save: (data: any) => StorageService.save(STORAGE_KEYS.WORKSPACE, data),
};

export const tasksStorage = {
  load: () => StorageService.load(STORAGE_KEYS.TASKS, []),
  save: (data: any[]) => StorageService.save(STORAGE_KEYS.TASKS, data),
};

export const pomodoroStorage = {
  load: () =>
    StorageService.load(STORAGE_KEYS.POMODORO, {
      sessions: 0,
    }),
  save: (data: any) => StorageService.save(STORAGE_KEYS.POMODORO, data),
};

export const settingsStorage = {
  load: () =>
    StorageService.load(STORAGE_KEYS.SETTINGS, {
      theme: "neon",
      notifications: true,
      soundEnabled: true,
      autoSave: true,
    }),
  save: (data: any) => StorageService.save(STORAGE_KEYS.SETTINGS, data),
};
