"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Disc3,
} from "lucide-react";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(40);
  const [waveformOffset, setWaveformOffset] = useState(0);

  // Animate waveform when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setWaveformOffset((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Pre-calculate waveform heights for performance
  const waveformBars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      baseHeight: Math.sin(i * 0.5) * 20 + 30,
    }));
  }, []);

  return (
    <div className="relative group h-full">
      <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

      <div className="relative bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Lofi Beats</h2>
          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Volume control"
          >
            <Volume2 className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Album Art */}
        <div className="mb-4 flex items-center justify-center flex-shrink-0">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-400 to-blue-600 rounded-xl opacity-20"></div>
            <div
              className={`absolute inset-0 bg-linear-to-br from-cyan-400/30 to-blue-600/30 rounded-xl flex items-center justify-center ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "3s" }}
            >
              <Disc3 className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-4 flex-shrink-0">
          <div className="text-xs font-semibold text-white/80 mb-1">
            Now Playing:
          </div>
          <div className="text-xs text-white/60 truncate px-2">
            Rainy Day Study Session - Lofi Girl
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 flex-shrink-0">
          <div className="w-full bg-white/10 rounded-full h-1.5 cursor-pointer group/bar hover:h-2 transition-all">
            <div
              className="bg-linear-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-white/50">
            <span>0:40</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4 flex-shrink-0">
          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4 text-white/60" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Waveform - Fixed performance issue */}
        <div className="mt-auto flex items-end justify-center gap-1 h-10 flex-shrink-0">
          {waveformBars.map((bar) => (
            <div
              key={bar.id}
              className="flex-1 bg-linear-to-t from-cyan-400 to-blue-500 rounded-full opacity-60 hover:opacity-100 transition-opacity"
              style={{
                height: `${
                  isPlaying
                    ? Math.sin(bar.id * 0.5 + waveformOffset) * 20 + 30
                    : bar.baseHeight
                }%`,
                transition: "height 0.05s ease-out",
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
