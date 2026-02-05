"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Disc3,
  Shuffle,
  ExternalLink,
} from "lucide-react";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";
import { STORAGE_KEYS } from "@/lib/constants";

interface LofiStream {
  id: string;
  title: string;
  videoId: string;
  thumbnail: string;
}

const DEFAULT_LOFI_STREAMS: LofiStream[] = [
  {
    id: "1",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study",
    videoId: "jfKfPfyJRdk",
    thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg",
  },
  {
    id: "2",
    title: "Chillhop Radio - Jazzy & Lofi Hip Hop Beats",
    videoId: "5yx6BWlEVcY",
    thumbnail: "https://i.ytimg.com/vi/5yx6BWlEVcY/mqdefault.jpg",
  },
  {
    id: "3",
    title: "Lofi Girl - Sleep/Chill Radio",
    videoId: "DWcJFNfaw9c",
    thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/mqdefault.jpg",
  },
  {
    id: "4",
    title: "Synthwave Radio - Beats to Chill/Game",
    videoId: "4xDzrJKXOOY",
    thumbnail: "https://i.ytimg.com/vi/4xDzrJKXOOY/mqdefault.jpg",
  },
];

interface MusicState {
  isPlaying: boolean;
  currentStream: LofiStream | null;
}

const MUSIC_STATE_KEY = "qorvexflow_music_state";

export default function MiniMusic() {
  const colors = useWidgetTheme();
  const [waveformOffset, setWaveformOffset] = useState(0);

  // Load music state from localStorage
  const [musicState, setMusicState] = useState<MusicState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.MUSIC_PLAYER);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            isPlaying: false,
            currentStream: parsed.currentLofiStream || DEFAULT_LOFI_STREAMS[0],
          };
        } catch {
          // Fall through
        }
      }
      const stateData = localStorage.getItem(MUSIC_STATE_KEY);
      if (stateData) {
        try {
          return JSON.parse(stateData);
        } catch {
          // Fall through
        }
      }
    }
    return {
      isPlaying: false,
      currentStream: DEFAULT_LOFI_STREAMS[0],
    };
  });

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.MUSIC_PLAYER && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setMusicState((prev) => ({
            ...prev,
            currentStream: parsed.currentLofiStream || prev.currentStream,
          }));
        } catch {
          // Ignore
        }
      }
      if (e.key === MUSIC_STATE_KEY && e.newValue) {
        try {
          setMusicState(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save state changes
  const updateMusicState = useCallback((updates: Partial<MusicState>) => {
    setMusicState((prev) => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Animate waveform when playing
  useEffect(() => {
    if (!musicState.isPlaying) return;
    const interval = setInterval(() => {
      setWaveformOffset((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, [musicState.isPlaying]);

  const waveformBars = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        baseHeight: Math.sin(i * 0.5) * 20 + 30,
      })),
    []
  );

  const openInYouTube = useCallback(() => {
    const stream = musicState.currentStream || DEFAULT_LOFI_STREAMS[0];
    window.open(`https://www.youtube.com/watch?v=${stream.videoId}`, "_blank");
    updateMusicState({ isPlaying: true });
  }, [musicState.currentStream, updateMusicState]);

  const togglePlay = useCallback(() => {
    if (!musicState.isPlaying) {
      openInYouTube();
    } else {
      updateMusicState({ isPlaying: false });
    }
  }, [musicState.isPlaying, openInYouTube, updateMusicState]);

  const shuffleStream = useCallback(() => {
    const availableStreams = DEFAULT_LOFI_STREAMS.filter(
      (s) => s.id !== musicState.currentStream?.id
    );
    const randomStream =
      availableStreams[Math.floor(Math.random() * availableStreams.length)];
    updateMusicState({ currentStream: randomStream, isPlaying: false });
  }, [musicState.currentStream, updateMusicState]);

  const nextStream = useCallback(() => {
    const currentIndex = DEFAULT_LOFI_STREAMS.findIndex(
      (s) => s.id === musicState.currentStream?.id
    );
    const nextIndex = (currentIndex + 1) % DEFAULT_LOFI_STREAMS.length;
    updateMusicState({
      currentStream: DEFAULT_LOFI_STREAMS[nextIndex],
      isPlaying: false,
    });
  }, [musicState.currentStream, updateMusicState]);

  const prevStream = useCallback(() => {
    const currentIndex = DEFAULT_LOFI_STREAMS.findIndex(
      (s) => s.id === musicState.currentStream?.id
    );
    const prevIndex =
      currentIndex <= 0 ? DEFAULT_LOFI_STREAMS.length - 1 : currentIndex - 1;
    updateMusicState({
      currentStream: DEFAULT_LOFI_STREAMS[prevIndex],
      isPlaying: false,
    });
  }, [musicState.currentStream, updateMusicState]);

  const currentStream = musicState.currentStream || DEFAULT_LOFI_STREAMS[0];

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${colors.accentBg}`}>
            <Disc3 className={`w-3.5 h-3.5 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-sm font-bold ${colors.textPrimary}`}>Music</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={openInYouTube}
            className={`p-1 rounded ${colors.buttonBg} ${colors.textMuted} hover:${colors.accent} transition-colors`}
            title="Open in YouTube"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={shuffleStream}
            className={`p-1 rounded ${colors.buttonBg} ${colors.textMuted} hover:${colors.accent} transition-colors`}
            title="Shuffle"
          >
            <Shuffle className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Track info */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${
            musicState.isPlaying ? "animate-pulse" : ""
          }`}
        >
          <img
            src={currentStream.thumbnail}
            alt={currentStream.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-medium ${colors.textPrimary} truncate`}>
            {currentStream.title.split(" - ")[0]}
          </p>
          <p className={`text-[10px] ${colors.textMuted} truncate`}>
            {currentStream.title.split(" - ")[1] || "Lofi Radio"}
          </p>
        </div>
      </div>

      {/* Status indicator */}
      {musicState.isPlaying && (
        <div
          className={`text-[10px] ${colors.accent} flex items-center justify-center gap-1`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Playing in YouTube
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 shrink-0">
        <button
          onClick={prevStream}
          className={`p-1.5 rounded-lg ${colors.buttonBg} transition-colors`}
        >
          <SkipBack className={`w-3.5 h-3.5 ${colors.textMuted}`} />
        </button>
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
          title={musicState.isPlaying ? "Mark as stopped" : "Open in YouTube"}
        >
          {musicState.isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={nextStream}
          className={`p-1.5 rounded-lg ${colors.buttonBg} transition-colors`}
        >
          <SkipForward className={`w-3.5 h-3.5 ${colors.textMuted}`} />
        </button>
      </div>

      {/* Waveform */}
      <div className="mt-auto flex items-end justify-center gap-0.5 h-8 shrink-0">
        {waveformBars.map((bar) => (
          <div
            key={bar.id}
            className={`flex-1 rounded-full opacity-60 ${colors.progressBg}`}
            style={{
              height: `${
                musicState.isPlaying
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
