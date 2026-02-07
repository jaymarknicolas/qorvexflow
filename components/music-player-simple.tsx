"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Music2,
  Loader2,
  Youtube,
  Smartphone,
  Wifi,
  WifiOff,
  LogIn,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useSpotifyAuth } from "@/lib/hooks/useSpotifyAuth";
import { useSpotifyPlayback } from "@/lib/hooks/useSpotifyPlayback";
import { useYouTubePlayer } from "@/lib/hooks/useYouTubePlayer";
import {
  useYouTubeSearch,
  YouTubeSearchResult,
} from "@/lib/hooks/useYouTubeSearch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Music source type
type MusicSourceType = "youtube" | "spotify";

// Spotify icon component
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

// Preset video IDs for each theme (extracted from URLs)
const LOFI_VIDEO_IDS = [
  { id: "cIZhlFIyJ_Y", name: "Night lofi playlist", artist: "HITO" },
  { id: "sF80I-TQiW0", name: "90's Chill Lofi", artist: "The Japanese Town" },
  { id: "rjYm7L9B7R0", name: "Night Balcony Lofi", artist: "Retro-Rhythm" },
  { id: "mQAJDULghEw", name: "Deep Flow Coding", artist: "Cosmic Hippo" },
  {
    id: "rhrCG0Vtx3g",
    name: "High-Rise Urban Studio",
    artist: "CraftCozy Roomx",
  },
];

const GHIBLI_VIDEO_IDS = [
  { id: "7lq6e4Lu4B8", name: "GHIBLI Jazz", artist: "JazzNe" },
  {
    id: "HGl75kurxok",
    name: "Piano Ghibli Collection",
    artist: "Vangakuz ヴァンガクズ",
  },
  {
    id: "FrX7tnM80M8",
    name: "Studio Ghibli Experience",
    artist: "Joe Hisaishi Official",
  },
  {
    id: "I4fxYapxu5M",
    name: "3 hour of Studio Ghibli",
    artist: "Ghibli Music BGM",
  },
  {
    id: "SEzAoQJZOhc",
    name: "RELAXING STUDIO GHIBLI",
    artist: "Sound of Nature",
  },
];

const COFFEESHOP_VIDEO_IDS = [
  {
    id: "MYPVQccHhAQ",
    name: "Cozy Coffee Shop",
    artist: "Relaxing Jazz Piano",
  },
  { id: "2RKbS2khgEM", name: "Coffee House Songs", artist: "Coffee Smiley" },
  {
    id: "ENSB1we3sGM",
    name: "Warm Winter Night",
    artist: "Relaxing Jazz Cafe",
  },
  { id: "ELd23Hll3is", name: "Cafe Playlist", artist: "Cherry Music" },
  { id: "-Gc76-sPJKk", name: "Spring R&B Cafe", artist: "Too Good For Mood" },
];

// Track state for each theme
interface ThemeState {
  lofi: { track: number; isPlaying: boolean };
  ghibli: { track: number; isPlaying: boolean };
  coffeeshop: { track: number; isPlaying: boolean };
}

// Persist state
let persistedMusicState: {
  currentTrack: number;
  volume: number;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  themeState: ThemeState;
  currentTheme: string;
  musicSource: MusicSourceType;
} | null = null;

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicPlayerSimple() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";

  // Local state - defined first so they can be used in callbacks
  const [currentTrack, setCurrentTrack] = useState(
    () => persistedMusicState?.currentTrack ?? 0,
  );
  const [isShuffleOn, setIsShuffleOn] = useState(
    () => persistedMusicState?.isShuffleOn ?? false,
  );
  const [isRepeatOn, setIsRepeatOn] = useState(
    () => persistedMusicState?.isRepeatOn ?? false,
  );
  const [playHistory, setPlayHistory] = useState<number[]>([]);
  const [musicSource, setMusicSource] = useState<MusicSourceType>(
    () => persistedMusicState?.musicSource ?? "youtube",
  );

  const prevThemeRef = useRef(persistedMusicState?.currentTheme ?? theme);
  const themeStateRef = useRef<ThemeState>(
    persistedMusicState?.themeState ?? {
      lofi: { track: 0, isPlaying: false },
      ghibli: { track: 0, isPlaying: false },
      coffeeshop: { track: 0, isPlaying: false },
    },
  );

  // Get current theme's video list
  const VIDEO_LIST =
    theme === "ghibli"
      ? GHIBLI_VIDEO_IDS
      : theme === "coffeeshop"
        ? COFFEESHOP_VIDEO_IDS
        : LOFI_VIDEO_IDS;

  // Auto-play callback ref - updated when dependencies change
  const autoPlayNextRef = useRef<() => void>(() => {});

  // Spotify hooks
  const spotifyAuth = useSpotifyAuth();
  const spotifyPlayback = useSpotifyPlayback(
    spotifyAuth.accessToken,
    musicSource === "spotify",
  );

  // YouTube hooks with onEnded callback
  const youtubePlayer = useYouTubePlayer("youtube-player-container", {
    onEnded: () => autoPlayNextRef.current(),
  });
  const youtubeSearch = useYouTubeSearch();

  // Update auto-play callback when dependencies change
  useEffect(() => {
    autoPlayNextRef.current = () => {
      if (musicSource !== "youtube") return;

      if (isRepeatOn) {
        // Repeat current track
        const video = VIDEO_LIST[currentTrack];
        youtubePlayer.loadVideo(video.id, {
          title: video.name,
          artist: video.artist,
        });
      } else {
        // Play next track
        const nextTrack = isShuffleOn
          ? Math.floor(Math.random() * VIDEO_LIST.length)
          : (currentTrack + 1) % VIDEO_LIST.length;
        setPlayHistory((prev) => [...prev, currentTrack]);
        setCurrentTrack(nextTrack);
        const video = VIDEO_LIST[nextTrack];
        youtubePlayer.loadVideo(video.id, {
          title: video.name,
          artist: video.artist,
        });
      }
    };
  }, [musicSource, isRepeatOn, isShuffleOn, currentTrack, VIDEO_LIST, youtubePlayer]);

  // Rest of local state
  const [volume, setVolume] = useState(() => persistedMusicState?.volume ?? 70);
  const [waveformOffset, setWaveformOffset] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Persist state
  useEffect(() => {
    persistedMusicState = {
      currentTrack,
      volume,
      isShuffleOn,
      isRepeatOn,
      themeState: themeStateRef.current,
      currentTheme: theme,
      musicSource,
    };
  }, [currentTrack, volume, isShuffleOn, isRepeatOn, theme, musicSource]);

  // Handle theme changes
  useEffect(() => {
    if (prevThemeRef.current !== theme && musicSource === "youtube") {
      const prevThemeKey =
        prevThemeRef.current === "ghibli"
          ? "ghibli"
          : prevThemeRef.current === "coffeeshop"
            ? "coffeeshop"
            : "lofi";
      themeStateRef.current[prevThemeKey] = {
        track: currentTrack,
        isPlaying: youtubePlayer.isPlaying,
      };

      const newThemeKey =
        theme === "ghibli"
          ? "ghibli"
          : theme === "coffeeshop"
            ? "coffeeshop"
            : "lofi";
      const savedState = themeStateRef.current[newThemeKey];
      setCurrentTrack(savedState.track);

      // Load the new theme's track
      const newVideoList =
        theme === "ghibli"
          ? GHIBLI_VIDEO_IDS
          : theme === "coffeeshop"
            ? COFFEESHOP_VIDEO_IDS
            : LOFI_VIDEO_IDS;
      const video = newVideoList[savedState.track];
      if (video && youtubePlayer.isReady) {
        youtubePlayer.loadVideo(video.id, {
          title: video.name,
          artist: video.artist,
        });
      }

      prevThemeRef.current = theme;
    }
  }, [
    theme,
    currentTrack,
    youtubePlayer.isPlaying,
    youtubePlayer.isReady,
    musicSource,
  ]);

  // Theme colors - light mode aware
  const getThemeColors = () => {
    if (theme === "ghibli") {
      return {
        primary: "from-green-400 to-emerald-500",
        secondary: "from-amber-400 to-orange-500",
        accent: isLightMode ? "text-green-700" : "text-emerald-400",
        accentSecondary: isLightMode ? "text-amber-700" : "text-amber-400",
        glow: "shadow-green-500/50",
        waveColors: ["#22c55e", "#10b981", "#059669", "#fbbf24", "#f59e0b"],
        gradient: isLightMode
          ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
          : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
        glowFrom: "from-green-500/30",
        glowTo: "to-amber-500/20",
        border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
        progressBg: "#22c55e",
        accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
        iconColor: isLightMode ? "text-green-700" : "text-emerald-400",
        textPrimary: isLightMode ? "text-green-900" : "text-white",
        textSecondary: isLightMode ? "text-green-800" : "text-white/80",
        textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
        hoverBg: isLightMode ? "hover:bg-green-200/50" : "hover:bg-white/10",
        surfaceBg: isLightMode ? "bg-green-100/80" : "bg-slate-900/95",
      };
    }
    if (theme === "coffeeshop") {
      return {
        primary: "from-amber-400 to-orange-500",
        secondary: "from-amber-600 to-amber-800",
        accent: isLightMode ? "text-amber-800" : "text-amber-400",
        accentSecondary: isLightMode ? "text-orange-700" : "text-orange-400",
        glow: "shadow-amber-500/50",
        waveColors: ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"],
        gradient: isLightMode
          ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
          : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
        glowFrom: "from-amber-500/20",
        glowTo: "to-orange-500/20",
        border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
        progressBg: "#d97706",
        accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
        iconColor: isLightMode ? "text-amber-700" : "text-amber-400",
        textPrimary: isLightMode ? "text-amber-950" : "text-white",
        textSecondary: isLightMode ? "text-amber-900" : "text-white/80",
        textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
        hoverBg: isLightMode ? "hover:bg-amber-200/50" : "hover:bg-white/10",
        surfaceBg: isLightMode ? "bg-amber-100/80" : "bg-slate-900/95",
      };
    }
    // lofi theme
    return {
      primary: "from-violet-400 to-purple-500",
      secondary: "from-pink-400 to-rose-500",
      accent: isLightMode ? "text-violet-700" : "text-violet-400",
      accentSecondary: isLightMode ? "text-pink-700" : "text-pink-400",
      glow: "shadow-violet-500/50",
      waveColors: ["#8b5cf6", "#a855f7", "#c084fc", "#ec4899", "#f472b6"],
      gradient: isLightMode
        ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
        : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
      glowFrom: "from-violet-500/20",
      glowTo: "to-pink-500/20",
      border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
      progressBg: "#8b5cf6",
      accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
      iconColor: isLightMode ? "text-violet-700" : "text-violet-400",
      textPrimary: isLightMode ? "text-violet-950" : "text-white",
      textSecondary: isLightMode ? "text-violet-900" : "text-white/80",
      textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
      hoverBg: isLightMode ? "hover:bg-violet-200/50" : "hover:bg-white/10",
      surfaceBg: isLightMode ? "bg-violet-100/80" : "bg-slate-900/95",
    };
  };

  const colors = getThemeColors();

  // Animate waveform using requestAnimationFrame for smoother animation
  useEffect(() => {
    const shouldAnimate =
      musicSource === "youtube"
        ? youtubePlayer.isPlaying && !youtubePlayer.isLoading
        : spotifyPlayback.isPlaying && !spotifyPlayback.isLoading;

    if (!shouldAnimate) return;

    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= 50) {
        setWaveformOffset((prev) => (prev + 0.15) % (Math.PI * 2));
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    youtubePlayer.isPlaying,
    youtubePlayer.isLoading,
    spotifyPlayback.isPlaying,
    spotifyPlayback.isLoading,
    musicSource,
  ]);

  // Waveform bars - generate once on mount with stable values
  const waveformBars = useMemo(() => {
    return Array.from({ length: 34 }, (_, i) => ({
      id: i,
      baseHeight: Math.sin(i * 0.5) * 20 + 100,
      frequency: 0.3 + (Math.sin(i * 1.5) * 0.5 + 0.5) * 0.4,
      phase: (i * 0.7) % (Math.PI * 2),
    }));
  }, []);

  // Playback handlers
  const handlePlayPause = () => {
    if (musicSource === "spotify") {
      if (spotifyPlayback.isPlaying) {
        spotifyPlayback.pause();
      } else {
        spotifyPlayback.play();
      }
    } else {
      youtubePlayer.togglePlay();
    }
  };

  const handleNext = async () => {
    if (musicSource === "spotify") {
      await spotifyPlayback.skipNext();
    } else {
      const nextTrack = isShuffleOn
        ? Math.floor(Math.random() * VIDEO_LIST.length)
        : (currentTrack + 1) % VIDEO_LIST.length;
      setPlayHistory((prev) => [...prev, currentTrack]);
      setCurrentTrack(nextTrack);
      const video = VIDEO_LIST[nextTrack];
      youtubePlayer.loadVideo(video.id, {
        title: video.name,
        artist: video.artist,
      });
    }
  };

  const handlePrev = async () => {
    if (musicSource === "spotify") {
      await spotifyPlayback.skipPrevious();
    } else {
      let prevTrack;
      if (playHistory.length > 0) {
        prevTrack = playHistory[playHistory.length - 1];
        setPlayHistory((prev) => prev.slice(0, -1));
      } else {
        prevTrack = (currentTrack - 1 + VIDEO_LIST.length) % VIDEO_LIST.length;
      }
      setCurrentTrack(prevTrack);
      const video = VIDEO_LIST[prevTrack];
      youtubePlayer.loadVideo(video.id, {
        title: video.name,
        artist: video.artist,
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (musicSource === "youtube") {
      youtubePlayer.setVolume(newVolume);
    } else {
      spotifyPlayback.setVolume(newVolume);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (musicSource === "youtube") {
      youtubePlayer.seekTo(seekTime);
    } else if (spotifyPlayback.currentTrack) {
      spotifyPlayback.seek(seekTime * 1000);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      youtubeSearch.search(searchQuery);
    }
  };

  const handleSelectSearchResult = (result: YouTubeSearchResult) => {
    youtubePlayer.loadVideo(result.videoId, {
      title: result.title,
      artist: result.channelTitle,
      duration: result.duration,
    });
    setShowSearch(false);
    setSearchQuery("");
    youtubeSearch.clearResults();
  };

  const handleSourceChange = (source: MusicSourceType) => {
    if (source === "spotify" && !spotifyAuth.isConnected) {
      spotifyAuth.connect();
      return;
    }
    if (musicSource === "youtube" && source === "spotify") {
      youtubePlayer.pause();
    }
    setMusicSource(source);
    setShowSourceMenu(false);
  };

  // Load initial video when player is ready (cue only, don't auto-play on startup)
  useEffect(() => {
    if (
      youtubePlayer.isReady &&
      !youtubePlayer.currentTrack &&
      musicSource === "youtube"
    ) {
      const video = VIDEO_LIST[currentTrack];
      youtubePlayer.loadVideo(video.id, {
        title: video.name,
        artist: video.artist,
      }, false);
    }
  }, [youtubePlayer.isReady, musicSource]);

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  // Determine effective state
  const effectiveIsPlaying =
    musicSource === "youtube"
      ? youtubePlayer.isPlaying
      : spotifyPlayback.isPlaying;
  const effectiveIsLoading =
    musicSource === "youtube"
      ? youtubePlayer.isLoading
      : spotifyPlayback.isLoading;

  const currentTrackInfo =
    musicSource === "youtube"
      ? youtubePlayer.currentTrack
      : spotifyPlayback.currentTrack;

  const currentProgress =
    musicSource === "youtube"
      ? youtubePlayer.currentTime
      : (spotifyPlayback.progress_ms || 0) / 1000;

  const totalDuration =
    musicSource === "youtube"
      ? youtubePlayer.duration
      : (spotifyPlayback.currentTrack?.duration_ms || 0) / 1000;

  return (
    <div className="relative group h-full w-full overflow-hidden">
      {/* Hidden YouTube player container - kept in viewport to prevent browser power-saving pause */}
      <div
        id="youtube-player-container"
        className="absolute overflow-hidden"
        style={{
          width: 256,
          height: 144,
          opacity: 0,
          pointerEvents: "none",
          bottom: 0,
          right: 0,
          zIndex: -1,
        }}
      />

      {/* Background glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors.glowFrom} ${colors.glowTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none`}
      />

      <div
        className={`relative h-full bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-5 flex flex-col overflow-hidden`}
      >
        {/* Search Overlay */}
        {showSearch && (
          <div className={`absolute inset-0 ${colors.surfaceBg} backdrop-blur-xl z-40 p-4 pt-12 flex flex-col rounded-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold ${colors.textPrimary}`}>
                Search YouTube Music
              </h3>
              <button
                onClick={() => {
                  setShowSearch(false);
                  youtubeSearch.clearResults();
                }}
                className={`p-1 ${colors.hoverBg} rounded-lg`}
              >
                <X className={`w-4 h-4 ${colors.textMuted}`} />
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for songs..."
                className={`flex-1 ${colors.accentBg} border ${colors.border} rounded-lg px-3 py-2 text-sm ${colors.textPrimary} placeholder:${colors.textMuted} focus:outline-none focus:border-current`}
                autoFocus
              />
              <button
                type="submit"
                disabled={youtubeSearch.isSearching}
                className={`px-3 py-2 bg-gradient-to-r ${colors.primary} rounded-lg text-white text-sm font-medium disabled:opacity-50`}
              >
                {youtubeSearch.isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2">
              {youtubeSearch.results.map((result) => (
                <button
                  key={result.videoId}
                  onClick={() => handleSelectSearchResult(result)}
                  className={`w-full flex items-center gap-3 p-2 ${colors.hoverBg} rounded-lg transition-colors text-left`}
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${colors.textPrimary} truncate`}>
                      {result.title}
                    </p>
                    <p className={`text-xs ${colors.textMuted} truncate`}>
                      {result.channelTitle}
                    </p>
                  </div>
                  {result.duration && (
                    <span className={`text-xs ${colors.textMuted}`}>
                      {formatTime(result.duration)}
                    </span>
                  )}
                </button>
              ))}
              {youtubeSearch.error && (
                <p className="text-center text-red-400 text-sm">
                  {youtubeSearch.error}
                </p>
              )}
            </div>
          </div>
        )}
        {/* Header */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`p-1.5 rounded-lg ${colors.accentBg}`}>
                    <Music2 className={`w-4 h-4 ${colors.iconColor}`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Music Player</p>
                </TooltipContent>
              </Tooltip>
              <div>
              <h2 className={`text-sm font-bold ${colors.textPrimary}`}>
                {musicSource === "spotify"
                  ? "Spotify"
                  : theme === "lofi"
                    ? "Lofi"
                    : theme === "coffeeshop"
                      ? "Coffee Shop"
                      : "Ghibli"}{" "}
                {musicSource === "spotify" ? "Connect" : "Beats"}
              </h2>
              <p className={`text-[10px] ${colors.textMuted}`}>
                {effectiveIsLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Loading...
                  </span>
                ) : musicSource === "spotify" ? (
                  spotifyPlayback.hasActiveDevice ? (
                    <span className="flex items-center gap-1">
                      <Wifi className="w-2.5 h-2.5" />
                      {spotifyPlayback.activeDevice?.name || "Connected"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <WifiOff className="w-2.5 h-2.5" />
                      No device
                    </span>
                  )
                ) : (
                  <>{effectiveIsPlaying ? "Now Playing" : "Paused"}</>
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Search (YouTube only) */}
            {musicSource === "youtube" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowSearch(true)}
                    className={`p-2 rounded-lg ${colors.hoverBg} transition-colors ${colors.accent}`}
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search YouTube</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Source Toggle */}
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowSourceMenu(!showSourceMenu)}
                    className={`p-2 rounded-lg ${colors.hoverBg} transition-colors ${
                      musicSource === "spotify" ? "text-green-500" : colors.accent
                    }`}
                  >
                    {musicSource === "spotify" ? (
                      <Youtube className="w-4 h-4" />
                    ) : (
                      <SpotifyIcon className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch source</p>
                </TooltipContent>
              </Tooltip>

              {showSourceMenu && (
                <div className={`absolute right-0 top-full mt-2 p-2 ${colors.surfaceBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl z-30 min-w-[180px]`}>
                  <div className={`text-[10px] ${colors.textMuted} uppercase tracking-wider px-2 pb-1 mb-1 border-b ${colors.border}`}>
                    Music Source
                  </div>

                  <button
                    onClick={() => handleSourceChange("youtube")}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                      musicSource === "youtube"
                        ? `bg-gradient-to-r ${colors.primary} text-white`
                        : `${colors.hoverBg} ${colors.textSecondary}`
                    }`}
                  >
                    <Youtube className="w-4 h-4" />
                    <span className="text-sm">YouTube Music</span>
                  </button>

                  <button
                    onClick={() => handleSourceChange("spotify")}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors mt-1 ${
                      musicSource === "spotify"
                        ? "bg-green-500/20 text-green-600"
                        : `${colors.hoverBg} ${colors.textSecondary}`
                    }`}
                  >
                    <SpotifyIcon className="w-4 h-4" />
                    <span className="text-sm flex-1 text-left">
                      {spotifyAuth.isConnected
                        ? "Spotify Connect"
                        : "Connect Spotify"}
                    </span>
                    {spotifyAuth.isConnected ? (
                      <Wifi className="w-3 h-3 text-green-500" />
                    ) : (
                      <LogIn className="w-3 h-3" />
                    )}
                  </button>

                  {spotifyAuth.isConnected && (
                    <button
                      onClick={() => {
                        spotifyAuth.disconnect();
                        if (musicSource === "spotify")
                          setMusicSource("youtube");
                        setShowSourceMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors mt-1 hover:bg-red-500/10 text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Disconnect</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Volume */}
            <div
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`p-2 rounded-lg ${colors.hoverBg} transition-colors ${colors.accent}`}
                  >
                    <VolumeIcon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Volume</p>
                </TooltipContent>
              </Tooltip>

              {showVolumeSlider && (
                <div className="absolute right-0 top-full pt-2 z-20">
                  <div className={`p-3 ${colors.surfaceBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl min-w-[140px]`}>
                    <div className="flex items-center gap-2 mb-2">
                      <VolumeIcon className={`w-3 h-3 ${colors.accent}`} />
                      <span className={`text-xs ${colors.textSecondary}`}>
                        {Math.round(volume)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className={`w-full h-1.5 ${isLightMode ? 'bg-black/10' : 'bg-white/20'} rounded-full appearance-none cursor-pointer`}
                      style={{
                        background: `linear-gradient(to right, ${colors.progressBg} ${volume}%, ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'} ${volume}%)`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </TooltipProvider>
        {/* Album Art */}
        <div className="relative mb-4 flex items-center justify-center flex-shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28">
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.primary} opacity-20 ${
                effectiveIsPlaying && !effectiveIsLoading ? "animate-pulse" : ""
              }`}
              style={{ animationDuration: "2s" }}
            />

            <div
              className={`absolute inset-2 rounded-full ${isLightMode ? 'bg-white/80' : 'bg-gradient-to-br from-slate-800 to-slate-900'} border-2 ${colors.border} flex items-center justify-center overflow-hidden ${
                effectiveIsPlaying && !effectiveIsLoading ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "4s" }}
            >
              {/* Spotify album art */}
              {musicSource === "spotify" &&
              spotifyPlayback.currentTrack?.albumArt ? (
                <img
                  src={spotifyPlayback.currentTrack.albumArt}
                  alt="Album art"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : /* YouTube album art - check if currentTrackInfo exists and has thumbnail */
              musicSource === "youtube" &&
                currentTrackInfo &&
                (currentTrackInfo as any)?.thumbnail ? (
                <img
                  src={(currentTrackInfo as any).thumbnail}
                  alt="Album art"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <>
                  <div className="absolute inset-4 rounded-full border border-white/5" />
                  <div className="absolute inset-6 rounded-full border border-white/5" />
                  <div className="absolute inset-8 rounded-full border border-white/5" />
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${colors.primary} flex items-center justify-center shadow-lg ${colors.glow}`}
                  >
                    {effectiveIsLoading ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
                    ) : (
                      <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </div>
                </>
              )}
            </div>

            {effectiveIsPlaying && !effectiveIsLoading && (
              <>
                <div
                  className={`absolute inset-0 rounded-full border-2 ${colors.border} animate-ping`}
                  style={{ animationDuration: "2s" }}
                />
              </>
            )}
          </div>
        </div>
        {/* Track Info */}
        <div className="text-center mb-2 flex-shrink-0 px-2">
          <h3 className={`text-base sm:text-lg font-bold ${colors.textPrimary} truncate`}>
            {musicSource === "spotify"
              ? spotifyPlayback.currentTrack?.name || "Not Playing"
              : (currentTrackInfo && (currentTrackInfo as any)?.title) ||
                VIDEO_LIST[currentTrack]?.name ||
                "Loading..."}
          </h3>
          <p className={`text-xs sm:text-sm ${colors.accent} truncate`}>
            {musicSource === "spotify"
              ? spotifyPlayback.currentTrack?.artist || "-"
              : (currentTrackInfo && (currentTrackInfo as any)?.artist) ||
                VIDEO_LIST[currentTrack]?.artist ||
                "YouTube"}
          </p>
        </div>
        {/* Progress Bar */}
        {totalDuration > 0 && (
          <div className=" px-2">
            <input
              type="range"
              min="0"
              max={totalDuration}
              value={currentProgress}
              onChange={handleSeek}
              className={`w-full h-1 ${isLightMode ? 'bg-black/10' : 'bg-white/20'} rounded-full appearance-none cursor-pointer`}
              style={{
                background: `linear-gradient(to right, ${colors.progressBg} ${
                  (currentProgress / totalDuration) * 100
                }%, ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'} ${(currentProgress / totalDuration) * 100}%)`,
              }}
            />
            <div className={`flex justify-between mt-1 text-[10px] ${colors.textMuted}`}>
              <span>{formatTime(currentProgress)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>
        )}
        {/* Main Controls */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsShuffleOn(!isShuffleOn);
                    setPlayHistory([]);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isShuffleOn
                      ? `bg-gradient-to-br ${colors.primary} text-white shadow-lg ${colors.glow}`
                      : `${colors.hoverBg} ${colors.textMuted} ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isShuffleOn ? "Shuffle on" : "Shuffle off"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handlePrev}
                  disabled={effectiveIsLoading}
                  className={`p-2 ${colors.hoverBg} rounded-lg transition-colors ${colors.textSecondary} ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'} disabled:opacity-50`}
                >
                  <SkipBack className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handlePlayPause}
                  disabled={
                    effectiveIsLoading ||
                    (musicSource === "spotify" && !spotifyPlayback.hasActiveDevice)
                  }
                  className={`p-3 sm:p-4 bg-gradient-to-br ${colors.primary} text-white rounded-full hover:scale-105 shadow-lg ${colors.glow} transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100`}
                >
                  {effectiveIsLoading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : effectiveIsPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{effectiveIsPlaying ? "Pause" : "Play"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleNext}
                  disabled={effectiveIsLoading}
                  className={`p-2 ${colors.hoverBg} rounded-lg transition-colors ${colors.textSecondary} ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'} disabled:opacity-50`}
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsRepeatOn(!isRepeatOn)}
                  className={`p-2 rounded-lg transition-all ${
                    isRepeatOn
                      ? `bg-gradient-to-br ${colors.primary} text-white shadow-lg ${colors.glow}`
                      : `${colors.hoverBg} ${colors.textMuted} ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRepeatOn ? "Repeat on" : "Repeat off"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 mt-3 flex-shrink-0">
          {musicSource === "youtube" ? (
            VIDEO_LIST.map((_, idx) => (
              <button
                key={idx}
                disabled={effectiveIsLoading}
                onClick={() => {
                  setCurrentTrack(idx);
                  const video = VIDEO_LIST[idx];
                  youtubePlayer.loadVideo(video.id, {
                    title: video.name,
                    artist: video.artist,
                  });
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all disabled:cursor-not-allowed ${
                  currentTrack === idx
                    ? `bg-gradient-to-r ${colors.primary} w-4`
                    : `${isLightMode ? 'bg-black/20 hover:bg-black/40' : 'bg-white/20 hover:bg-white/40'}`
                }`}
              />
            ))
          ) : (
            <div className={`flex items-center gap-2 text-[10px] ${colors.textMuted}`}>
              <Smartphone className="w-3 h-3" />
              <span>
                {spotifyPlayback.hasActiveDevice
                  ? `Playing on ${spotifyPlayback.activeDevice?.name}`
                  : "Open Spotify on a device"}
              </span>
            </div>
          )}
        </div>
        {/* Waveform */}
        {totalDuration > 0 && (
          <div className="mt-2 absolute flex items-end justify-center gap-[3px] h-1/2 sm:h-16 flex-shrink-0 w-full -z-1 -bottom-1 opacity-30 pointer-events-none left-0 right-0">
            {waveformBars.map((bar) => {
              const isAnimating = effectiveIsPlaying && !effectiveIsLoading;
              const height = isAnimating
                ? Math.sin(
                    bar.id * bar.frequency + waveformOffset + bar.phase,
                  ) *
                    25 +
                  35
                : bar.baseHeight;
              const colorIndex = bar.id % colors.waveColors.length;
              const animatedColorIndex = isAnimating
                ? Math.floor(
                    (bar.id + Math.floor(waveformOffset * 2)) %
                      colors.waveColors.length,
                  )
                : colorIndex;

              return (
                <div
                  key={bar.id}
                  className="rounded-full"
                  style={{
                    width: "16px",
                    minWidth: "4px",
                    height: `${Math.max(height, 15)}%`,
                    minHeight: "16px",
                    backgroundColor: isAnimating
                      ? colors.waveColors[animatedColorIndex]
                      : colors.waveColors[colorIndex],
                    opacity: isAnimating ? 1 : 0.5,
                    boxShadow: isAnimating
                      ? `0 0 8px ${colors.waveColors[animatedColorIndex]}80`
                      : "none",
                    transition: "height 100ms ease-out, opacity 200ms ease",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {showSourceMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowSourceMenu(false)}
        />
      )}
    </div>
  );
}
