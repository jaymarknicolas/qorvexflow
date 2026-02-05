"use client";

import { useState, useEffect, useCallback } from "react";
import { Youtube, Play, X, AlertCircle, Radio } from "lucide-react";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

interface VideoItem {
  id: string;
  title: string;
}

const QUICK_STREAMS: VideoItem[] = [
  { id: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to relax/study to" },
  { id: "rUxyKA_-grg", title: "Lofi Girl - synthwave radio" },
  { id: "7NOSDKb0HlU", title: "Tokyo Night Lofi" },
  { id: "h2zkV-l_TbY", title: "Coffee Shop Ambience" },
  { id: "gaGrHUekGrc", title: "Rainy Jazz Cafe" },
  { id: "TURbeWK2wwg", title: "Deep Focus Music" },
];

// Storage key for sync
const STORAGE_KEY = "qorvexflow_yt_current";

export default function MiniYouTube() {
  const colors = useWidgetTheme();
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [iframeError, setIframeError] = useState(false);

  // Sync state with localStorage (for cross-window sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            setCurrentVideo(JSON.parse(e.newValue));
            setIframeError(false);
          } catch {
            setCurrentVideo(null);
          }
        } else {
          setCurrentVideo(null);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (currentVideo) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentVideo));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentVideo]);

  const playVideo = useCallback((v: VideoItem) => {
    setIframeError(false);
    setCurrentVideo(v);
  }, []);

  const clearVideo = useCallback(() => {
    setCurrentVideo(null);
    setIframeError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeError(true);
  }, []);

  // Open video in new tab as fallback
  const openInNewTab = useCallback(() => {
    if (currentVideo) {
      window.open(`https://www.youtube.com/watch?v=${currentVideo.id}`, "_blank");
    }
  }, [currentVideo]);

  if (currentVideo) {
    return (
      <div
        className={`flex flex-col h-full bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
      >
        {/* Embedded player or error state */}
        <div className="flex-1 bg-black relative min-h-0">
          {iframeError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
              <p className={`text-xs ${colors.textSecondary} mb-2`}>
                Video can&apos;t play in PiP mode
              </p>
              <button
                onClick={openInNewTab}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium hover:from-red-400 hover:to-red-500 transition-all"
              >
                Open on YouTube
              </button>
            </div>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&rel=0&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
              className="absolute inset-0 w-full h-full"
              title="YouTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onError={handleIframeError}
            />
          )}
        </div>
        {/* Controls */}
        <div
          className={`flex items-center gap-2 p-2 border-t ${colors.border} flex-shrink-0`}
        >
          <Radio className={`w-3 h-3 ${colors.accent} animate-pulse flex-shrink-0`} />
          <p className={`flex-1 text-[10px] ${colors.textPrimary} truncate min-w-0`}>
            {currentVideo.title}
          </p>
          <button
            onClick={clearVideo}
            className={`p-1 rounded ${colors.buttonBg} ${colors.textMuted} hover:bg-red-500/20 hover:text-red-400 transition-colors`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`p-1 rounded-lg ${colors.accentBg}`}>
          <Youtube className={`w-3.5 h-3.5 ${colors.iconColor}`} />
        </div>
        <h2 className={`text-sm font-bold ${colors.textPrimary}`}>
          Lofi Streams
        </h2>
      </div>

      {/* Stream list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {QUICK_STREAMS.map((v) => (
          <button
            key={v.id}
            onClick={() => playVideo(v)}
            className={`w-full flex items-center gap-2 p-1.5 rounded-lg ${
              colors.isLightMode ? "bg-black/5 hover:bg-black/10" : "bg-white/5 hover:bg-white/10"
            } transition-colors text-left`}
          >
            <div className="w-10 h-7 rounded bg-black/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${v.id}/default.jpg`}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className={`text-[10px] ${colors.textSecondary} truncate flex-1`}>
              {v.title}
            </p>
            <Play className={`w-3 h-3 ${colors.textMuted} flex-shrink-0`} />
          </button>
        ))}
      </div>
    </div>
  );
}
