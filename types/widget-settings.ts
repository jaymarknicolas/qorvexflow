/**
 * Widget-specific settings types
 */

export interface PomodoroWidgetSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // sessions before long break
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  enableNotifications: boolean;
}

export interface TasksWidgetSettings {
  defaultFilter: "all" | "active" | "completed";
  showCompleted: boolean;
  maxVisibleTasks: number;
  sortBy: "created" | "priority" | "title";
  enablePriority: boolean;
}

export interface MusicWidgetSettings {
  defaultVolume: number; // 0-100
  autoPlay: boolean;
  shuffleMode: boolean;
  loopMode: boolean;
  preferredSource: "youtube" | "spotify";
}

export interface CalendarWidgetSettings {
  startDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  defaultView: "month" | "week" | "day";
  show24Hour: boolean;
  showWeekNumbers: boolean;
}

export interface NotesWidgetSettings {
  defaultFontSize: number; // in pixels
  editorTheme: "light" | "dark";
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  spellCheck: boolean;
}

export interface YouTubeWidgetSettings {
  defaultQuality: "auto" | "144p" | "240p" | "360p" | "480p" | "720p" | "1080p";
  autoPlayNext: boolean;
  showCaptions: boolean;
  volume: number; // 0-100
  loopPlaylist: boolean;
}

export interface StatsWidgetSettings {
  chartType: "line" | "bar" | "area";
  showAverage: boolean;
  timeRange: "week" | "month" | "year";
}

export interface QuotesWidgetSettings {
  autoRotate: boolean;
  rotateInterval: number; // in minutes
  showAuthor: boolean;
  showCategory: boolean;
}

export interface CoffeeWidgetSettings {
  dailyLimit: number;
  caffeineLimit: number; // mg
  resetHour: number; // 0-23
  showStreak: boolean;
}

export interface StopwatchWidgetSettings {
  // No specific settings needed
}

export interface CountdownWidgetSettings {
  // No specific settings needed
}

export interface WeatherWidgetSettings {
  // Location is managed globally via AmbientContext
}

export type WidgetSettings = {
  pomodoro: PomodoroWidgetSettings;
  tasks: TasksWidgetSettings;
  music: MusicWidgetSettings;
  calendar: CalendarWidgetSettings;
  notes: NotesWidgetSettings;
  youtube: YouTubeWidgetSettings;
  stats: StatsWidgetSettings;
  quotes: QuotesWidgetSettings;
  coffee: CoffeeWidgetSettings;
  stopwatch: StopwatchWidgetSettings;
  countdown: CountdownWidgetSettings;
  weather: WeatherWidgetSettings;
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  pomodoro: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    enableNotifications: true,
  },
  tasks: {
    defaultFilter: "all",
    showCompleted: true,
    maxVisibleTasks: 10,
    sortBy: "created",
    enablePriority: true,
  },
  music: {
    defaultVolume: 70,
    autoPlay: false,
    shuffleMode: false,
    loopMode: false,
    preferredSource: "youtube",
  },
  calendar: {
    startDayOfWeek: 0,
    defaultView: "month",
    show24Hour: false,
    showWeekNumbers: false,
  },
  notes: {
    defaultFontSize: 14,
    editorTheme: "dark",
    autoSave: true,
    autoSaveInterval: 2,
    spellCheck: true,
  },
  youtube: {
    defaultQuality: "auto",
    autoPlayNext: true,
    showCaptions: false,
    volume: 70,
    loopPlaylist: false,
  },
  stats: {
    chartType: "line",
    showAverage: true,
    timeRange: "week",
  },
  quotes: {
    autoRotate: false,
    rotateInterval: 60,
    showAuthor: true,
    showCategory: true,
  },
  coffee: {
    dailyLimit: 4,
    caffeineLimit: 400,
    resetHour: 4,
    showStreak: true,
  },
  stopwatch: {},
  countdown: {},
  weather: {},
};
