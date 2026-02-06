"use client";

import { useState, useEffect, useCallback } from "react";
import { Youtube, ExternalLink } from "lucide-react";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Sync state with localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            setCurrentVideo(JSON.parse(e.newValue));
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

  const openInYouTube = useCallback((video: VideoItem) => {
    setCurrentVideo(video);
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1 rounded-lg ${colors.accentBg}`}>
              <Youtube className={`w-3.5 h-3.5 ${colors.iconColor}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lofi Streams</p>
          </TooltipContent>
        </Tooltip>
        <h2 className={`text-sm font-bold ${colors.textPrimary}`}>
          Lofi Streams
        </h2>
      </div>

      {/* Current playing indicator */}
      {currentVideo && (
        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            colors.isLightMode ? "bg-black/5" : "bg-white/5"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${colors.accent} bg-current animate-pulse`}
          />
          <p className={`text-[10px] ${colors.textPrimary} truncate flex-1`}>
            {currentVideo.title}
          </p>
        </div>
      )}

      {/* Stream list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {QUICK_STREAMS.map((v) => (
          <button
            key={v.id}
            onClick={() => openInYouTube(v)}
            className={`w-full flex items-center gap-2 p-1.5 rounded-lg ${
              currentVideo?.id === v.id
                ? colors.isLightMode
                  ? "bg-black/10"
                  : "bg-white/15"
                : colors.isLightMode
                  ? "bg-black/5 hover:bg-black/10"
                  : "bg-white/5 hover:bg-white/10"
            } transition-colors text-left`}
          >
            <div className="w-10 h-7 rounded bg-black/50 flex items-center justify-center shrink-0 overflow-hidden">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="shrink-0">
                  <ExternalLink className={`w-3 h-3 ${colors.textMuted}`} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in YouTube</p>
              </TooltipContent>
            </Tooltip>
          </button>
        ))}
      </div>

      <p className={`text-[9px] ${colors.textMuted} text-center shrink-0`}>
        Opens in YouTube
      </p>
    </div>
    </TooltipProvider>
  );
}
