/**
 * Widget Clipboard Service
 * Handles copying and pasting of widgets with their state
 */

import type { WidgetType } from "@/types";

export interface WidgetClipboardData<T = any> {
  widgetType: WidgetType;
  timestamp: number;
  data: T;
  settings?: any;
}

class WidgetClipboardService {
  private clipboard: WidgetClipboardData | null = null;

  /**
   * Copy a widget with its current state
   */
  copy<T = any>(widgetType: WidgetType, data: T, settings?: any): void {
    this.clipboard = {
      widgetType,
      timestamp: Date.now(),
      data,
      settings,
    };
  }

  /**
   * Get the clipboard data
   */
  paste(): WidgetClipboardData | null {
    return this.clipboard;
  }

  /**
   * Check if clipboard has data
   */
  hasData(): boolean {
    return this.clipboard !== null;
  }

  /**
   * Get the widget type in clipboard
   */
  getWidgetType(): WidgetType | null {
    return this.clipboard?.widgetType ?? null;
  }

  /**
   * Clear the clipboard
   */
  clear(): void {
    this.clipboard = null;
  }

  /**
   * Check if clipboard data is recent (within last 5 minutes)
   */
  isRecent(maxAgeMs: number = 5 * 60 * 1000): boolean {
    if (!this.clipboard) return false;
    return Date.now() - this.clipboard.timestamp < maxAgeMs;
  }
}

// Export singleton instance
export const widgetClipboard = new WidgetClipboardService();
