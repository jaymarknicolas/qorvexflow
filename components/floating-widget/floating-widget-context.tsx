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
import { useAppSettings } from "@/lib/contexts/app-settings-context";
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
  // PiP prompt
  showPipPrompt: boolean;
  hidePipPrompt: () => void;
  dismissPipPrompt: () => void;
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
  const { settings: appSettings, updateSettings } = useAppSettings();

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

      // Copy stylesheets and wait for external ones to load
      const linkLoadPromises: Promise<void>[] = [];
      for (const sheet of [...document.styleSheets]) {
        try {
          if (sheet.href) {
            const link = pip.document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href;
            linkLoadPromises.push(
              new Promise<void>((resolve) => {
                link.onload = () => resolve();
                link.onerror = () => resolve(); // don't block on error
              })
            );
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
      // Hide until styles are ready
      mountDiv.style.visibility = "hidden";
      pip.document.body.appendChild(mountDiv);

      // Wait for all external stylesheets to load before showing content
      await Promise.all(linkLoadPromises);
      mountDiv.style.visibility = "visible";

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

  // ─── PiP prompt ─────────────────────────────────────────────
  // Prompt stays visible until user explicitly closes it or opens PiP.
  // Closing/dismissing disables pipEnabled in settings.
  // User re-enables via the settings modal toggle.
  const [showPipPrompt, setShowPipPrompt] = useState(false);

  const hidePipPrompt = useCallback(() => {
    setShowPipPrompt(false);
    updateSettings({ pipEnabled: false });
  }, [updateSettings]);

  const dismissPipPrompt = useCallback(() => {
    setShowPipPrompt(false);
    updateSettings({ pipEnabled: false });
  }, [updateSettings]);

  // ─── Auto PiP via Media Session API ─────────────────────
  // Chrome fires "enterpictureinpicture" on tab switch only when:
  //   1. A <video> element with `autopictureinpicture` attribute is playing
  //   2. A media session handler for "enterpictureinpicture" is registered
  // We create a tiny canvas-based video to satisfy requirement #1, and our
  // handler opens Document PiP (instead of the default video-element PiP).
  // If a real music/YouTube widget is already playing, we skip the fake video.
  const openPipRef = useRef(openPip);
  openPipRef.current = openPip;
  const fakeVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasDocumentPipSupport() || !appSettings.pipEnabled) return;
    if (!navigator.mediaSession) return;

    // Check if any real media (music/YouTube widget) is currently playing
    const hasActiveMedia = () => {
      const els = document.querySelectorAll("audio, video");
      for (const el of els) {
        const media = el as HTMLMediaElement;
        if (media === fakeVideoRef.current) continue;
        if (!media.paused) return true;
      }
      return false;
    };

    // Create a tiny invisible <video> playing a canvas stream.
    // The `autopictureinpicture` attribute tells Chrome to trigger the
    // media session "enterpictureinpicture" action when the user leaves the tab.
    let video: HTMLVideoElement | null = null;
    let canvas: HTMLCanvasElement | null = null;

    const startFakeVideo = () => {
      if (fakeVideoRef.current) return;
      try {
        canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw a single pixel so the stream isn't empty
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 2, 2);

        // Must keep drawing for the stream to stay "active"
        canvasIntervalRef.current = setInterval(() => {
          ctx.fillRect(0, 0, 2, 2);
        }, 1000);

        const stream = canvas.captureStream(1); // 1 fps
        video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("autopictureinpicture", "");
        video.style.cssText =
          "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
        document.body.appendChild(video);
        video.play().catch(() => {});
        fakeVideoRef.current = video;
      } catch {
        // Canvas/stream not available
      }
    };

    const stopFakeVideo = () => {
      if (fakeVideoRef.current) {
        fakeVideoRef.current.pause();
        fakeVideoRef.current.srcObject = null;
        fakeVideoRef.current.remove();
        fakeVideoRef.current = null;
      }
      if (canvasIntervalRef.current) {
        clearInterval(canvasIntervalRef.current);
        canvasIntervalRef.current = null;
      }
      video = null;
      canvas = null;
    };

    // Only create fake video if no real media is already playing
    if (!hasActiveMedia()) {
      startFakeVideo();
    }

    // Swap between fake video and real media dynamically
    const onPlay = () => {
      if (hasActiveMedia()) stopFakeVideo();
    };
    const onPause = () => {
      if (!hasActiveMedia()) startFakeVideo();
    };
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onPause, true);
    document.addEventListener("ended", onPause, true);

    // This handler is called by Chrome when the user switches tabs
    // (triggered by the autopictureinpicture video or real media).
    // We open Document PiP here instead of the default video PiP.
    const handler = async () => {
      if (!pipWindowRef.current) {
        await openPipRef.current();
      }
    };

    try {
      // @ts-expect-error -- "enterpictureinpicture" not yet in TS MediaSessionAction type
      navigator.mediaSession.setActionHandler("enterpictureinpicture", handler);
    } catch {
      // Browser doesn't support enterpictureinpicture action
    }

    return () => {
      try {
        // @ts-expect-error -- same as above
        navigator.mediaSession.setActionHandler("enterpictureinpicture", null);
      } catch {}
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onPause, true);
      document.removeEventListener("ended", onPause, true);
      stopFakeVideo();
    };
  }, [appSettings.pipEnabled]);

  // Fallback: show prompt when user returns to the tab (if auto PiP didn't trigger)
  useEffect(() => {
    if (!hasDocumentPipSupport() || !appSettings.pipEnabled) return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        !pipWindowRef.current
      ) {
        setShowPipPrompt(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [appSettings.pipEnabled]);

  // Sync prompt with pipEnabled toggle
  useEffect(() => {
    if (!appSettings.pipEnabled) {
      setShowPipPrompt(false);
    } else if (appSettings.pipEnabled && !pipWindowRef.current && hasDocumentPipSupport()) {
      setShowPipPrompt(true);
    }
  }, [appSettings.pipEnabled]);

  // Hide prompt when PiP opens
  useEffect(() => {
    if (pipWindow) {
      setShowPipPrompt(false);
    }
  }, [pipWindow]);

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
        showPipPrompt,
        hidePipPrompt,
        dismissPipPrompt,
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
