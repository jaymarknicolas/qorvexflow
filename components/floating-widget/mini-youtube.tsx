"use client";

import { useState, useEffect } from "react";
import { Youtube, Play, Radio, X } from "lucide-react";
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

// Module-level persisted state
let persistedVideo: VideoItem | null = null;

export default function MiniYouTube() {
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(() => {
    if (persistedVideo) return persistedVideo;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qorvexflow_yt_current");
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

  useEffect(() => {
    persistedVideo = currentVideo;
  }, [currentVideo]);

  const playVideo = (v: VideoItem) => setCurrentVideo(v);
  const clearVideo = () => setCurrentVideo(null);

  if (currentVideo) {
    return (
      <div className="flex flex-col h-full">
        {/* Embedded player */}
        <div className="flex-1 bg-black relative min-h-0">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            title="YouTube"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {/* Controls */}
        <div className="flex items-center gap-2 p-2 bg-black/40 border-t border-white/10 flex-shrink-0">
          <p className="flex-1 text-[10px] text-white truncate min-w-0">
            {currentVideo.title}
          </p>
          <button
            onClick={clearVideo}
            className="p-1 rounded bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Youtube className="w-4 h-4 text-red-400" />
        <span className="text-xs font-medium text-white">Lofi Streams</span>
      </div>

      {/* Stream list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {QUICK_STREAMS.map((v) => (
          <button
            key={v.id}
            onClick={() => playVideo(v)}
            className="w-full flex items-center gap-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <div className="w-10 h-7 rounded bg-black/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${v.id}/default.jpg`}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-[10px] text-white/70 truncate flex-1">{v.title}</p>
            <Play className="w-3 h-3 text-white/30 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
