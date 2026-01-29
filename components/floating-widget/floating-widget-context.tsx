"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { WidgetType } from "@/types";

export type FloatingWidgetTab = WidgetType;

interface StopwatchState {
  elapsed: number;
  isRunning: boolean;
  laps: number[];
}

export interface FloatingWidgetPersisted {
  activeTab: FloatingWidgetTab;
  pinnedWidgets: WidgetType[];
}

interface FloatingWidgetContextValue {
  activeTab: FloatingWidgetTab;
  setActiveTab: (tab: FloatingWidgetTab) => void;
  // Pinned widgets
  pinnedWidgets: WidgetType[];
  pinWidget: (type: WidgetType) => void;
  unpinWidget: (type: WidgetType) => void;
  isWidgetPinned: (type: WidgetType) => boolean;
  // Stopwatch
  stopwatch: StopwatchState;
  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resetStopwatch: () => void;
  lapStopwatch: () => void;
  formatTime: (ms: number) => string;
  // PiP
  isPipOpen: boolean;
  openPip: () => Promise<void>;
  closePip: () => void;
  pipContainer: HTMLElement | null;
}

const FloatingWidgetContext = createContext<FloatingWidgetContextValue | null>(
  null
);

const DEFAULT_PERSISTED: FloatingWidgetPersisted = {
  activeTab: "pomodoro",
  pinnedWidgets: [],
};

export function hasDocumentPipSupport(): boolean {
  return (
    typeof window !== "undefined" && "documentPictureInPicture" in window
  );
}

export function FloatingWidgetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [persisted, setPersisted] = useLocalStorage<FloatingWidgetPersisted>(
    "qorvex-floating-widget",
    DEFAULT_PERSISTED
  );

  const [activeTab, setActiveTabState] = useState<FloatingWidgetTab>(
    persisted.activeTab ?? "pomodoro"
  );
  const [pinnedWidgets, setPinnedWidgetsState] = useState<WidgetType[]>(
    persisted.pinnedWidgets ?? []
  );

  // PiP window state
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  // Stopwatch
  const [stopwatch, setStopwatch] = useState<StopwatchState>({
    elapsed: 0,
    isRunning: false,
    laps: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  // Persist to localStorage directly (avoid setPersisted in effect to prevent infinite loop)
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "qorvex-floating-widget",
        JSON.stringify({ activeTab, pinnedWidgets })
      );
    } catch {}
  }, [activeTab, pinnedWidgets]);

  // ─── Stopwatch ───────────────────────────────────────────
  const getElapsed = useCallback(() => {
    if (!isRunningRef.current) return accumulatedRef.current;
    return accumulatedRef.current + (Date.now() - startTimeRef.current);
  }, []);

  useEffect(() => {
    if (stopwatch.isRunning) {
      isRunningRef.current = true;
      startTimeRef.current = Date.now();
      accumulatedRef.current = stopwatch.elapsed;
      intervalRef.current = setInterval(() => {
        setStopwatch((prev) => ({ ...prev, elapsed: getElapsed() }));
      }, 50);
    } else {
      isRunningRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopwatch.isRunning]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isRunningRef.current) {
        setStopwatch((prev) => ({ ...prev, elapsed: getElapsed() }));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [getElapsed]);

  // ─── Pin/Unpin ───────────────────────────────────────────
  const pinWidget = useCallback((type: WidgetType) => {
    setPinnedWidgetsState((prev) =>
      prev.includes(type) ? prev : [...prev, type]
    );
  }, []);

  const unpinWidget = useCallback((type: WidgetType) => {
    setPinnedWidgetsState((prev) => prev.filter((w) => w !== type));
  }, []);

  const isWidgetPinned = useCallback(
    (type: WidgetType) => pinnedWidgets.includes(type),
    [pinnedWidgets]
  );

  // ─── PiP window management ──────────────────────────────
  const openPip = useCallback(async () => {
    if (!hasDocumentPipSupport()) return;
    if (pipWindowRef.current) return;

    try {
      // @ts-expect-error -- Document PiP API types not yet in TS lib
      const pip: Window = await window.documentPictureInPicture.requestWindow({
        width: 400,
        height: 380,
      });

      pipWindowRef.current = pip;

      // Copy stylesheets
      for (const sheet of [...document.styleSheets]) {
        try {
          if (sheet.href) {
            const link = pip.document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href;
            pip.document.head.appendChild(link);
          } else if (sheet.cssRules) {
            const style = pip.document.createElement("style");
            style.textContent = [...sheet.cssRules]
              .map((r) => r.cssText)
              .join("\n");
            pip.document.head.appendChild(style);
          }
        } catch {
          // CORS restricted
        }
      }

      // Copy inline <style> tags (Tailwind / Next.js injected)
      document.querySelectorAll("style").forEach((el) => {
        pip.document.head.appendChild(el.cloneNode(true));
      });

      // Copy data attributes (theme, color scheme) and classes
      const root = document.documentElement;
      const pipRoot = pip.document.documentElement;
      pipRoot.setAttribute(
        "data-theme",
        root.getAttribute("data-theme") || "lofi"
      );
      pipRoot.setAttribute(
        "data-color-scheme",
        root.getAttribute("data-color-scheme") || "dark"
      );
      pipRoot.className = root.className;

      pip.document.body.style.margin = "0";
      pip.document.body.style.padding = "0";
      pip.document.body.style.overflow = "hidden";
      pip.document.body.style.fontFamily =
        "var(--font-geist-sans), system-ui, sans-serif";

      const mountDiv = pip.document.createElement("div");
      mountDiv.id = "pip-root";
      mountDiv.style.width = "100%";
      mountDiv.style.height = "100vh";
      pip.document.body.appendChild(mountDiv);

      setPipContainer(mountDiv);
      setPipWindow(pip);

      pip.addEventListener("pagehide", () => {
        setPipWindow(null);
        setPipContainer(null);
        pipWindowRef.current = null;
      });
    } catch (err) {
      console.error("Failed to open Document PiP:", err);
    }
  }, []);

  const closePip = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
    }
    setPipWindow(null);
    setPipContainer(null);
  }, []);

  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  // ─── Stopwatch controls ──────────────────────────────────
  const setActiveTab = useCallback(
    (tab: FloatingWidgetTab) => setActiveTabState(tab),
    []
  );

  const startStopwatch = useCallback(() => {
    setStopwatch((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pauseStopwatch = useCallback(() => {
    const elapsed = getElapsed();
    accumulatedRef.current = elapsed;
    setStopwatch((prev) => ({ ...prev, isRunning: false, elapsed }));
  }, [getElapsed]);

  const resetStopwatch = useCallback(() => {
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    isRunningRef.current = false;
    setStopwatch({ elapsed: 0, isRunning: false, laps: [] });
  }, []);

  const lapStopwatch = useCallback(() => {
    setStopwatch((prev) => ({
      ...prev,
      laps: [...prev.laps, prev.elapsed],
    }));
  }, []);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centis = Math.floor((ms % 1000) / 10);
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  }, []);

  return (
    <FloatingWidgetContext.Provider
      value={{
        activeTab,
        setActiveTab,
        pinnedWidgets,
        pinWidget,
        unpinWidget,
        isWidgetPinned,
        stopwatch,
        startStopwatch,
        pauseStopwatch,
        resetStopwatch,
        lapStopwatch,
        formatTime,
        isPipOpen: !!pipWindow,
        openPip,
        closePip,
        pipContainer,
      }}
    >
      {children}
    </FloatingWidgetContext.Provider>
  );
}

export function useFloatingWidget() {
  const ctx = useContext(FloatingWidgetContext);
  if (!ctx)
    throw new Error(
      "useFloatingWidget must be used within FloatingWidgetProvider"
    );
  return ctx;
}
