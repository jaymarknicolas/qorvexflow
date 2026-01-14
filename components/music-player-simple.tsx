"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
} from "lucide-react";

const LOFI_STREAMS = [
  {
    id: 1,
    name: "Lofi Hip Hop",
    url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0",
  },
  {
    id: 2,
    name: "Chillhop Radio",
    url: "https://www.youtube.com/embed/5yx6BWlEVcY?autoplay=1&mute=0",
  },
  {
    id: 3,
    name: "Lofi Girl Sleep",
    url: "https://www.youtube.com/embed/DWcJFNfaw9c?autoplay=1&mute=0",
  },
  {
    id: 4,
    name: "Synthwave Radio",
    url: "https://www.youtube.com/embed/4xDzrJKXOOY?autoplay=1&mute=0",
  },
];

export default function MusicPlayerSimple() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStream, setCurrentStream] = useState(0);
  const [progress, setProgress] = useState(0);
  const [waveformOffset, setWaveformOffset] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Animate waveform when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setWaveformOffset((prev) => (prev + 0.1) % (Math.PI * 2));
      setProgress((prev) => (prev + 0.5) % 100);
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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentStream((prev) => (prev + 1) % LOFI_STREAMS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentStream(
      (prev) => (prev - 1 + LOFI_STREAMS.length) % LOFI_STREAMS.length
    );
    setIsPlaying(true);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative h-full">
      {/* Hidden iframe for music playback */}
      {isPlaying && (
        <iframe
          src={LOFI_STREAMS[currentStream].url}
          className="absolute"
          style={{
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
            position: "absolute",
            top: -9999,
          }}
          allow="autoplay"
        />
      )}

      <div className="h-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">
              Lofi Beats
            </h2>
            <p className="text-xs text-white/60 truncate">
              {LOFI_STREAMS[currentStream].name}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleToggleMute}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Volume control"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-white/60" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>
          </div>
        </div>

        {/* Album Art */}
        <div className="mb-3 flex items-center justify-center flex-shrink-0">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl opacity-20"></div>
            <div
              className={`absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-xl flex items-center justify-center ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "3s" }}
            >
              <Disc3 className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-3 flex-shrink-0">
          <div className="text-xs font-semibold text-white/80 mb-1">
            {isPlaying ? "Now Playing" : "Paused"}
          </div>
          <div className="text-xs text-white/60 truncate px-2">
            24/7 Lofi Radio • Stream {currentStream + 1}
          </div>
        </div>

        {/* Stream Selector */}
        <div className="mb-3 flex-shrink-0">
          <div className="grid grid-cols-4 gap-1">
            {LOFI_STREAMS.map((stream, idx) => (
              <button
                key={stream.id}
                onClick={() => {
                  setCurrentStream(idx);
                  setIsPlaying(true);
                }}
                className={`p-1 rounded text-xs transition-colors ${
                  currentStream === idx
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-white/5 hover:bg-white/10 text-white/60"
                }`}
                title={stream.name}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {/* <div className="mb-3 flex-shrink-0">
          <div className="w-full bg-white/10 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div> */}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0">
          <button
            onClick={handlePrev}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Previous stream"
          >
            <SkipBack className="w-3.5 h-3.5 text-white/60" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Next stream"
          >
            <SkipForward className="w-3.5 h-3.5 text-white/60" />
          </button>
        </div>

        {/* Volume Slider */}
        {/* <div className="mb-2 flex-shrink-0">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div> */}

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
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
