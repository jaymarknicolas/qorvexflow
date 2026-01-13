/**
 * Validation Utilities
 * Input validation and sanitization functions
 */

import { TASK_LIMITS, POMODORO_LIMITS } from "@/lib/constants";
import type { ValidationResult } from "@/types";

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  if (typeof window === "undefined") return input;
  const temp = document.createElement("div");
  temp.textContent = input;
  return temp.innerHTML;
}

/**
 * Sanitize and trim string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Validate task title
 */
export function validateTaskTitle(title: string): ValidationResult {
  const errors: string[] = [];

  const sanitized = sanitizeString(title);

  if (!sanitized) {
    errors.push("Task title cannot be empty");
  }

  if (sanitized.length > TASK_LIMITS.MAX_TITLE_LENGTH) {
    errors.push(
      `Task title must be less than ${TASK_LIMITS.MAX_TITLE_LENGTH} characters`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate pomodoro duration
 */
export function validatePomodoroDuration(minutes: number): ValidationResult {
  const errors: string[] = [];

  if (minutes < POMODORO_LIMITS.MIN_DURATION) {
    errors.push(`Duration must be at least ${POMODORO_LIMITS.MIN_DURATION} minute(s)`);
  }

  if (minutes > POMODORO_LIMITS.MAX_DURATION) {
    errors.push(`Duration must be at most ${POMODORO_LIMITS.MAX_DURATION} minutes`);
  }

  if (!Number.isInteger(minutes)) {
    errors.push("Duration must be a whole number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate break duration
 */
export function validateBreakDuration(minutes: number): ValidationResult {
  const errors: string[] = [];

  if (minutes < POMODORO_LIMITS.MIN_BREAK) {
    errors.push(`Break must be at least ${POMODORO_LIMITS.MIN_BREAK} minute(s)`);
  }

  if (minutes > POMODORO_LIMITS.MAX_BREAK) {
    errors.push(`Break must be at most ${POMODORO_LIMITS.MAX_BREAK} minutes`);
  }

  if (!Number.isInteger(minutes)) {
    errors.push("Break duration must be a whole number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];

  try {
    new URL(url);
  } catch {
    errors.push("Invalid URL format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate JSON string
 */
export function validateJson(jsonString: string): ValidationResult {
  const errors: string[] = [];

  try {
    JSON.parse(jsonString);
  } catch (error) {
    errors.push("Invalid JSON format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Escape regex special characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
