"use client";

import { useState, useEffect, useCallback } from "react";
import { Youtube, Link as LinkIcon, Play } from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";

// Persist YouTube widget state in memory across re-mounts
let persistedYouTubeState: {
  videoUrl: string;
  embedUrl: string;
} | null = null;

// Helper to convert URL to embed format
const convertToEmbedUrl = (url: string): string => {
  try {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    return "";
  } catch {
    return "";
  }
};

export default function YouTubeWidgetInput() {
  const { theme } = useTheme();

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/25",
          border: "border-emerald-400/30",
          buttonGradient: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
          buttonShadow: "shadow-emerald-500/20",
          inputFocus: "focus:ring-emerald-500/50",
          iconBg: "bg-emerald-500/25",
          iconColor: "text-emerald-400",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/90 to-amber-950/90",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          border: "border-amber-500/20",
          buttonGradient: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500",
          buttonShadow: "shadow-amber-500/20",
          inputFocus: "focus:ring-amber-500/50",
          iconBg: "bg-amber-500/20",
          iconColor: "text-amber-400",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/90 to-purple-900/90",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          border: "border-violet-500/20",
          buttonGradient: "from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500",
          buttonShadow: "shadow-violet-500/20",
          inputFocus: "focus:ring-violet-500/50",
          iconBg: "bg-violet-500/20",
          iconColor: "text-violet-400",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  // Initialize from memory first, then localStorage
  const [videoUrl, setVideoUrl] = useState(() => {
    if (persistedYouTubeState !== null) {
      return persistedYouTubeState.videoUrl;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qorvexflow_youtube_url");
      if (saved) {
        return saved;
      }
    }
    return "";
  });

  const [embedUrl, setEmbedUrl] = useState(() => {
    if (persistedYouTubeState !== null) {
      return persistedYouTubeState.embedUrl;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qorvexflow_youtube_url");
      if (saved) {
        return convertToEmbedUrl(saved);
      }
    }
    return "";
  });

  const [inputValue, setInputValue] = useState("");

  // Keep memory state in sync
  useEffect(() => {
    persistedYouTubeState = { videoUrl, embedUrl };
  }, [videoUrl, embedUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const embed = convertToEmbedUrl(inputValue);
    if (embed) {
      setVideoUrl(inputValue);
      setEmbedUrl(embed);
      localStorage.setItem("qorvexflow_youtube_url", inputValue);
      setInputValue("");
    } else {
      alert("Please enter a valid YouTube URL");
    }
  };

  const handleClear = () => {
    setVideoUrl("");
    setEmbedUrl("");
    setInputValue("");
    localStorage.removeItem("qorvexflow_youtube_url");
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border} shadow-2xl overflow-hidden`}>
      {/* Input Form */}
      <div className="flex-shrink-0 p-3 pr-10 border-b border-white/10 bg-black/20">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className={`w-full px-3 py-2 pl-10 bg-black/30 border ${colors.border} rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 ${colors.inputFocus}`}
            />
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          </div>
          <button
            type="submit"
            className={`px-4 py-2 bg-gradient-to-r ${colors.buttonGradient} text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${colors.buttonShadow}`}
          >
            <Play className="w-4 h-4" />
            Load
          </button>
          {embedUrl && (
            <button
              type="button"
              onClick={handleClear}
              className={`px-4 py-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white rounded-lg text-sm font-medium transition-all duration-200 border ${colors.border}`}
            >
              Clear
            </button>
          )}
        </form>
        <p className="text-xs text-white/40 mt-2">
          Supported: youtube.com/watch?v=... or youtu.be/...
        </p>
      </div>

      {/* Video Player */}
      <div className="flex-1 overflow-hidden">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className={`w-20 h-20 mb-4 rounded-full ${colors.iconBg} flex items-center justify-center`}>
              <Youtube className={`w-10 h-10 ${colors.iconColor}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              YouTube Video Player
            </h3>
            <p className="text-white/60 text-sm max-w-xs">
              Paste any YouTube video URL in the input above to start watching.
            </p>
            <div className="mt-4 text-xs text-white/40 space-y-1">
              <p>Example URLs:</p>
              <p className="font-mono text-white/30">
                youtube.com/watch?v=dQw4w9WgXcQ
              </p>
              <p className="font-mono text-white/30">youtu.be/dQw4w9WgXcQ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
