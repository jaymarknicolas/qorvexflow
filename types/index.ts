/**
 * Core type definitions for QorvexFlow
 */

import { LucideIcon } from "lucide-react";

// ============================================
// Widget Types
// ============================================

export type WidgetType =
  | "pomodoro"
  | "tasks"
  | "music"
  | "stats"
  | "calendar"
  | "notes"
  | "youtube"
  | "quotes"
  | "coffee"
  | "stopwatch"
  | "countdown";

export interface WidgetDefinition {
  id: WidgetType;
  icon: LucideIcon;
  label: string;
  description?: string;
}

export interface WidgetSlot {
  id: string;
  widgetType: WidgetType | null;
}

// ============================================
// Pomodoro Types
// ============================================

export interface PomodoroState {
  timeLeft: number; // in seconds
  isRunning: boolean;
  sessions: number;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  mode: "work" | "break";
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  enableNotifications: boolean;
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

export interface TaskListState {
  tasks: Task[];
  filter: "all" | "active" | "completed";
}

// ============================================
// Music Types
// ============================================

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  url?: string;
}

export interface MusicPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0-100
  volume: number; // 0-100
  playlist: Track[];
  currentIndex: number;
}

// ============================================
// Calendar Types
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  description?: string;
  color?: string;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
}

// ============================================
// Focus Stats Types
// ============================================

export interface FocusDay {
  day: string;
  hours: number;
  date: Date;
}

export interface FocusStatsState {
  weeklyData: FocusDay[];
  totalHours: number;
  dailyAverage: number;
  currentStreak: number;
}

// ============================================
// Workspace Types
// ============================================

export interface WorkspaceLayout {
  id: string;
  name: string;
  slots: Record<string, WidgetType | null>;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceState {
  layouts: WorkspaceLayout[];
  currentLayoutId: string | null;
  slotWidgets: Record<string, WidgetType | null>;
}

// ============================================
// Theme Types
// ============================================

export type ThemeType = "neon" | "lofi" | "ghibli";

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

// ============================================
// User Settings Types
// ============================================

export interface UserSettings {
  theme: ThemeType;
  notifications: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  pomodoroSettings: PomodoroSettings;
}

// ============================================
// Floating Widget Types
// ============================================

export type FloatingWidgetTab = "stopwatch" | "pomodoro" | "tasks" | "notes";

// ============================================
// Drag and Drop Types
// ============================================

export interface DragData {
  from: "sidebar" | "slot";
  widgetType?: WidgetType;
  sourceSlotId?: string;
}

// ============================================
// Storage Types
// ============================================

export interface StorageData {
  workspace: WorkspaceState;
  tasks: Task[];
  pomodoro: Partial<PomodoroState>;
  music: Partial<MusicPlayerState>;
  calendar: Partial<CalendarState>;
  focusStats: Partial<FocusStatsState>;
  settings: UserSettings;
  lastSaved: number;
}

// ============================================
// Error Types
// ============================================

export interface AppError {
  code: string;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

// ============================================
// Validation Types
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
