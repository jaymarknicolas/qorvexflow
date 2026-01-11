"use client";

import { useState } from "react";
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

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

      <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Lofi Beats</h2>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Volume2 className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Album Art */}
        <div className="mb-6 flex items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl opacity-20"></div>
            <div
              className={`absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-xl flex items-center justify-center ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "3s" }}
            >
              <Disc3 className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-6">
          <div className="text-sm font-semibold text-white/80 mb-1">
            Now Playing:
          </div>
          <div className="text-sm text-white/60">
            Rainy Day Study Session - Lofi Girl
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-white/10 rounded-full h-2 cursor-pointer group/bar hover:h-3 transition-all">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/50">
            <span>0:40</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <SkipBack className="w-5 h-5 text-white/60" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <SkipForward className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Waveform */}
        <div className="mt-6 flex items-end justify-center gap-1 h-12">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full opacity-60 hover:opacity-100 transition-opacity"
              style={{
                height: `${
                  Math.sin(i * 0.5 + (isPlaying ? Date.now() / 200 : 0)) * 20 +
                  30
                }%`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
