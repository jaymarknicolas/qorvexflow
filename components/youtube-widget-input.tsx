"use client";

import { useState, useEffect } from "react";
import { Youtube, Link as LinkIcon, Play } from "lucide-react";

export default function YouTubeWidgetInput() {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("qorvexflow_youtube_url");
    if (saved) {
      setVideoUrl(saved);
      setEmbedUrl(convertToEmbedUrl(saved));
    }
  }, []);

  const convertToEmbedUrl = (url: string): string => {
    try {
      // Extract video ID from various YouTube URL formats
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
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Input Form - Extra top padding to avoid widget actions overlap */}
      <div className="flex-shrink-0 p-3 pr-10 border-b border-white/10 bg-black/20">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="w-full px-3 py-2 pl-10 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Play className="w-4 h-4" />
            Load
          </button>
          {embedUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white rounded-lg text-sm font-medium transition-all duration-200 border border-white/10"
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
            <div className="w-20 h-20 mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <Youtube className="w-10 h-10 text-red-400" />
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
