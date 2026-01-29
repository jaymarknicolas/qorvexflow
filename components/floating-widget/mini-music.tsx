"use client";

import { useState, useEffect, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Disc3 } from "lucide-react";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

export default function MiniMusic() {
  const colors = useWidgetTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(40);
  const [waveformOffset, setWaveformOffset] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setWaveformOffset((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const waveformBars = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        baseHeight: Math.sin(i * 0.5) * 20 + 30,
      })),
    []
  );

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Track info */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-lg ${colors.accentBg} flex items-center justify-center flex-shrink-0 ${
            isPlaying ? "animate-spin" : ""
          }`}
          style={{ animationDuration: "3s" }}
        >
          <Disc3 className={`w-5 h-5 ${colors.accent}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-medium ${colors.textPrimary} truncate`}>
            Rainy Day Study Session
          </p>
          <p className={`text-[10px] ${colors.textMuted} truncate`}>Lofi Girl</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex-shrink-0">
        <div className={`w-full ${colors.isLightMode ? "bg-black/10" : "bg-white/10"} rounded-full h-1`}>
          <div
            className={`${colors.progressBg} h-full rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={`flex justify-between mt-1 text-[9px] ${colors.textMuted}`}>
          <span>0:40</span>
          <span>3:45</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 flex-shrink-0">
        <button className={`p-1.5 ${colors.isLightMode ? "hover:bg-black/5" : "hover:bg-white/10"} rounded-lg transition-colors`}>
          <SkipBack className={`w-3.5 h-3.5 ${colors.textMuted}`} />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 ${colors.accentBg} ${colors.accent} rounded-full ${colors.isLightMode ? "hover:bg-black/10" : "hover:bg-white/15"} transition-colors`}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <button className={`p-1.5 ${colors.isLightMode ? "hover:bg-black/5" : "hover:bg-white/10"} rounded-lg transition-colors`}>
          <SkipForward className={`w-3.5 h-3.5 ${colors.textMuted}`} />
        </button>
      </div>

      {/* Waveform */}
      <div className="mt-auto flex items-end justify-center gap-0.5 h-8 flex-shrink-0">
        {waveformBars.map((bar) => (
          <div
            key={bar.id}
            className="flex-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full opacity-60"
            style={{
              height: `${
                isPlaying
                  ? Math.sin(bar.id * 0.5 + waveformOffset) * 20 + 30
                  : bar.baseHeight
              }%`,
              transition: "height 0.05s ease-out",
            }}
          />
        ))}
      </div>
    </div>
  );
}
