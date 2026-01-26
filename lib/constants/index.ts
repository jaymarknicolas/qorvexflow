/**
 * Application constants
 */

// ============================================
// Widget Configuration
// ============================================

// Maximum slots supported across all layouts (grid-6 needs 6)
export const SLOT_IDS = ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6"] as const;
export type SlotId = (typeof SLOT_IDS)[number];

export const WIDGET_TYPES = ["pomodoro", "tasks", "music", "stats", "calendar", "notes", "youtube"] as const;
export type WidgetType = (typeof WIDGET_TYPES)[number];

// ============================================
// Pomodoro Constants
// ============================================

export const DEFAULT_POMODORO_DURATION = 25; // minutes
export const DEFAULT_BREAK_DURATION = 5; // minutes
export const DEFAULT_LONG_BREAK_DURATION = 15; // minutes
export const LONG_BREAK_INTERVAL = 4; // after 4 pomodoros

export const POMODORO_LIMITS = {
  MIN_DURATION: 1, // minutes
  MAX_DURATION: 120, // minutes
  MIN_BREAK: 1,
  MAX_BREAK: 30,
} as const;

// ============================================
// Task Configuration
// ============================================

export const TASK_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_TASKS: 100,
} as const;

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  WORKSPACE: "qorvexflow_workspace",
  TASKS: "qorvexflow_tasks",
  POMODORO: "qorvexflow_pomodoro",
  MUSIC: "qorvexflow_music",
  MUSIC_PLAYER: "qorvexflow_music_player",
  CALENDAR: "qorvexflow_calendar",
  FOCUS_STATS: "qorvexflow_focus_stats",
  SETTINGS: "qorvexflow_settings",
  NOTES: "qorvexflow_notes",
  YOUTUBE: "qorvexflow_youtube",
  LAST_SAVED: "qorvexflow_last_saved",
  SPOTIFY_SOURCE: "qorvexflow_spotify_source",
} as const;

// ============================================
// Theme Configuration
// ============================================

export const THEMES = ["neon", "lofi", "ghibli"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "neon";

// ============================================
// Calendar Configuration
// ============================================

export const CALENDAR_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const CALENDAR_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

// ============================================
// Validation Constants
// ============================================

export const DEBOUNCE_DELAY = 300; // ms
export const AUTO_SAVE_DELAY = 1000; // ms

// ============================================
// Animation Constants
// ============================================

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
