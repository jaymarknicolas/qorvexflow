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
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useSpotifyAuth } from "@/lib/hooks/useSpotifyAuth";
import { useSpotifyPlayback } from "@/lib/hooks/useSpotifyPlayback";

// Music source type
type MusicSourceType = "youtube" | "spotify";

// Spotify icon component
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

// 10 Lofi tracks/streams
const LOFI_TRACKS = [
  { id: 1, name: "Rainy Day Vibes", artist: "Lofi Girl", duration: "∞" },
  { id: 2, name: "Midnight Coffee", artist: "Chillhop", duration: "∞" },
  { id: 3, name: "Study Session", artist: "Lofi Fruits", duration: "∞" },
  { id: 4, name: "Dreamy Nights", artist: "Sleepy Fish", duration: "∞" },
  { id: 5, name: "Cozy Fireplace", artist: "The Jazz Hop Café", duration: "∞" },
  { id: 6, name: "Ocean Waves", artist: "Kupla", duration: "∞" },
  { id: 7, name: "Autumn Leaves", artist: "SwuM", duration: "∞" },
  { id: 8, name: "Morning Dew", artist: "Idealism", duration: "∞" },
  { id: 9, name: "Starry Sky", artist: "In Love With A Ghost", duration: "∞" },
  { id: 10, name: "Peaceful Mind", artist: "Jinsang", duration: "∞" },
];

// YouTube stream URLs
const STREAM_URLS = [
  "https://www.youtube.com/embed/OK2WVZprlJE?autoplay=1&mute=0",
  "https://www.youtube.com/embed/CBSlu_VMS9U?autoplay=1&mute=0",
  "https://www.youtube.com/embed/sF80I-TQiW0?autoplay=1&mute=0",
  "https://www.youtube.com/embed/9kzE8isXlQY?autoplay=1&mute=0",
  "https://www.youtube.com/embed/BrnDlRmW5hs?autoplay=1&mute=0",
  "https://www.youtube.com/embed/S-4hwfyK-XQ?autoplay=1&mute=0",
  "https://www.youtube.com/embed/VUQfT3gNT3g?autoplay=1&mute=0",
  "https://www.youtube.com/embed/Y9mRoCerrpY?autoplay=1&mute=0",
  "https://www.youtube.com/embed/lTRiuFIWV54?autoplay=1&mute=0",
  "https://www.youtube.com/embed/BCxTQq0UiFs?autoplay=1&mute=0",
];

// 10 Ghibli-themed tracks
const GHIBLI_TRACKS = [
  { id: 1, name: "Spirited Away", artist: "Joe Hisaishi", duration: "∞" },
  { id: 2, name: "My Neighbor Totoro", artist: "Joe Hisaishi", duration: "∞" },
  { id: 3, name: "Princess Mononoke", artist: "Joe Hisaishi", duration: "∞" },
  { id: 4, name: "Kiki's Delivery Service", artist: "Joe Hisaishi", duration: "∞" },
  { id: 5, name: "Castle in the Sky", artist: "Joe Hisaishi", duration: "∞" },
  { id: 6, name: "Howl's Moving Castle", artist: "Joe Hisaishi", duration: "∞" },
  { id: 7, name: "Ponyo", artist: "Joe Hisaishi", duration: "∞" },
  { id: 8, name: "Laputa", artist: "Joe Hisaishi", duration: "∞" },
  { id: 9, name: "Arrietty", artist: "Cécile Corbel", duration: "∞" },
  { id: 10, name: "The Wind Rises", artist: "Joe Hisaishi", duration: "∞" },
];

// YouTube stream URLs for Ghibli tracks
const GHIBLI_STREAMS = [
  "https://www.youtube.com/embed/HGl75kurxok?autoplay=1&mute=0",
  "https://www.youtube.com/embed/hgUGe1cf3So?autoplay=1&mute=0",
  "https://www.youtube.com/embed/3jWRrafhO7M?autoplay=1&mute=0",
  "https://www.youtube.com/embed/oCV-C8_VFdk?autoplay=1&mute=0",
  "https://www.youtube.com/embed/7lq6e4Lu4B8?autoplay=1&mute=0",
  "https://www.youtube.com/embed/xTY0SlyVfCQ?autoplay=1&mute=0",
  "https://www.youtube.com/embed/ASCMw-UCafA?autoplay=1&mute=0",
  "https://www.youtube.com/embed/whLvb0yvIFo?autoplay=1&mute=0",
  "https://www.youtube.com/embed/jvM3rO4Ihd4?autoplay=1&mute=0",
  "https://www.youtube.com/embed/I4fxYapxu5M?autoplay=1&mute=0",
];

// 10 Coffee Shop themed tracks
const COFFEESHOP_TRACKS = [
  { id: 1, name: "Morning Brew", artist: "Cafe Beats", duration: "∞" },
  { id: 2, name: "Espresso Dreams", artist: "Jazz Café", duration: "∞" },
  { id: 3, name: "Rainy Café", artist: "Cozy Sounds", duration: "∞" },
  { id: 4, name: "Latte Afternoons", artist: "Chill Barista", duration: "∞" },
  { id: 5, name: "Acoustic Corner", artist: "Coffee House", duration: "∞" },
  { id: 6, name: "Warm Conversations", artist: "Café Lounge", duration: "∞" },
  { id: 7, name: "Sunday Morning", artist: "Mellow Beans", duration: "∞" },
  { id: 8, name: "French Press", artist: "Paris Café", duration: "∞" },
  { id: 9, name: "Bookstore Vibes", artist: "Quiet Hours", duration: "∞" },
  { id: 10, name: "Closing Time", artist: "Night Café", duration: "∞" },
];

// YouTube stream URLs for Coffee Shop tracks
const COFFEESHOP_STREAMS = [
  "https://www.youtube.com/embed/MYPVQccHhAQ?autoplay=1&mute=0",
  "https://www.youtube.com/embed/ySOE2d9-BKE?autoplay=1&mute=0",
  "https://www.youtube.com/embed/2RKbS2khgEM?autoplay=1&mute=0",
  "https://www.youtube.com/embed/h2zkV-l_TbY?autoplay=1&mute=0",
  "https://www.youtube.com/embed/c0_ejQQcrwI?autoplay=1&mute=0",
  "https://www.youtube.com/embed/DSGyEsJ17cI?autoplay=1&mute=0",
  "https://www.youtube.com/embed/gaGrHUekGrc?autoplay=1&mute=0",
  "https://www.youtube.com/embed/VMAPTo7RVCo?autoplay=1&mute=0",
  "https://www.youtube.com/embed/dFpzSmjgwao?autoplay=1&mute=0",
  "https://www.youtube.com/embed/Dx5qFachd3A?autoplay=1&mute=0",
];

// Track state for each theme to preserve playback position
interface ThemeState {
  lofi: { track: number; isPlaying: boolean };
  ghibli: { track: number; isPlaying: boolean };
  coffeeshop: { track: number; isPlaying: boolean };
}

// Persist music player state in memory across re-mounts
let persistedMusicState: {
  isPlaying: boolean;
  currentTrack: number;
  volume: number;
  isMuted: boolean;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  themeState: ThemeState;
  currentTheme: string;
  musicSource: MusicSourceType;
} | null = null;

// Format milliseconds to mm:ss
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function MusicPlayerSimple() {
  const { theme } = useTheme();

  // Spotify hooks
  const spotifyAuth = useSpotifyAuth();
  const [musicSource, setMusicSource] = useState<MusicSourceType>(
    () => persistedMusicState?.musicSource ?? "youtube"
  );
  const spotifyPlayback = useSpotifyPlayback(
    spotifyAuth.accessToken,
    musicSource === "spotify"
  );

  // Use refs to track the previous theme and preserve state
  const prevThemeRef = useRef(persistedMusicState?.currentTheme ?? theme);
  const themeStateRef = useRef<ThemeState>(
    persistedMusicState?.themeState ?? {
      lofi: { track: 0, isPlaying: false },
      ghibli: { track: 0, isPlaying: false },
      coffeeshop: { track: 0, isPlaying: false },
    }
  );

  // Initialize state from persisted memory or defaults
  const [isPlaying, setIsPlaying] = useState(
    () => persistedMusicState?.isPlaying ?? false
  );
  const [currentTrack, setCurrentTrack] = useState(
    () => persistedMusicState?.currentTrack ?? 0
  );
  const [volume, setVolume] = useState(() => persistedMusicState?.volume ?? 70);
  const [isMuted, setIsMuted] = useState(
    () => persistedMusicState?.isMuted ?? false
  );
  const [isShuffleOn, setIsShuffleOn] = useState(
    () => persistedMusicState?.isShuffleOn ?? false
  );
  const [isRepeatOn, setIsRepeatOn] = useState(
    () => persistedMusicState?.isRepeatOn ?? false
  );
  const [waveformOffset, setWaveformOffset] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playHistory, setPlayHistory] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  // Track the current stream key to prevent unnecessary iframe reloads
  const [streamKey, setStreamKey] = useState(0);

  // Persist music player state to memory on changes
  useEffect(() => {
    persistedMusicState = {
      isPlaying,
      currentTrack,
      volume,
      isMuted,
      isShuffleOn,
      isRepeatOn,
      themeState: themeStateRef.current,
      currentTheme: theme,
      musicSource,
    };
  }, [isPlaying, currentTrack, volume, isMuted, isShuffleOn, isRepeatOn, theme, musicSource]);

  // Choose the right track list & stream URLs
  const TRACKS =
    theme === "ghibli"
      ? GHIBLI_TRACKS
      : theme === "coffeeshop"
        ? COFFEESHOP_TRACKS
        : LOFI_TRACKS;
  const STREAMS =
    theme === "ghibli"
      ? GHIBLI_STREAMS
      : theme === "coffeeshop"
        ? COFFEESHOP_STREAMS
        : STREAM_URLS;

  // Handle theme changes - preserve playing state and track position per theme
  useEffect(() => {
    if (prevThemeRef.current !== theme) {
      const prevThemeKey =
        prevThemeRef.current === "ghibli"
          ? "ghibli"
          : prevThemeRef.current === "coffeeshop"
            ? "coffeeshop"
            : "lofi";
      themeStateRef.current[prevThemeKey] = {
        track: currentTrack,
        isPlaying: isPlaying,
      };

      const newThemeKey =
        theme === "ghibli"
          ? "ghibli"
          : theme === "coffeeshop"
            ? "coffeeshop"
            : "lofi";
      const savedState = themeStateRef.current[newThemeKey];

      setCurrentTrack(savedState.track);

      if (isPlaying && musicSource === "youtube") {
        setIsLoading(true);
        setStreamKey((prev) => prev + 1);
      }

      prevThemeRef.current = theme;
    }
  }, [theme, currentTrack, isPlaying, musicSource]);

  // Theme colors
  const getThemeColors = () => {
    if (theme === "ghibli") {
      return {
        primary: "from-green-400 to-emerald-500",
        secondary: "from-amber-400 to-orange-500",
        accent: "text-green-400",
        accentSecondary: "text-amber-400",
        glow: "shadow-green-500/50",
        waveColors: ["#22c55e", "#10b981", "#059669", "#fbbf24", "#f59e0b"],
        bg: "from-green-900/30 to-emerald-900/30",
        border: "border-green-500/20",
        progressBg: "#22c55e",
      };
    }
    if (theme === "coffeeshop") {
      return {
        primary: "from-amber-400 to-orange-500",
        secondary: "from-amber-600 to-amber-800",
        accent: "text-amber-400",
        accentSecondary: "text-orange-400",
        glow: "shadow-amber-500/50",
        waveColors: ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"],
        bg: "from-stone-800/30 to-stone-900/30",
        border: "border-amber-500/20",
        progressBg: "#d97706",
      };
    }
    return {
      primary: "from-violet-400 to-purple-500",
      secondary: "from-pink-400 to-rose-500",
      accent: "text-violet-400",
      accentSecondary: "text-pink-400",
      glow: "shadow-violet-500/50",
      waveColors: ["#8b5cf6", "#a855f7", "#c084fc", "#ec4899", "#f472b6"],
      bg: "from-violet-900/30 to-purple-900/30",
      border: "border-violet-500/20",
      progressBg: "#8b5cf6",
    };
  };

  const colors = getThemeColors();

  // Animate waveform when playing
  useEffect(() => {
    const shouldAnimate =
      musicSource === "youtube" ? isPlaying : spotifyPlayback.isPlaying;
    if (!shouldAnimate) return;

    const interval = setInterval(() => {
      setWaveformOffset((prev) => (prev + 0.15) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, spotifyPlayback.isPlaying, musicSource]);

  // Enhanced waveform bars with varying characteristics
  const waveformBars = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      baseHeight: Math.sin(i * 0.4) * 15 + 25,
      frequency: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      colorIndex: i % colors.waveColors.length,
    }));
  }, [colors.waveColors.length]);

  // YouTube playback handlers
  const handlePlayPause = () => {
    if (musicSource === "spotify") {
      if (spotifyPlayback.isPlaying) {
        spotifyPlayback.pause();
      } else {
        spotifyPlayback.play();
      }
    } else {
      if (!isPlaying) {
        setIsLoading(true);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const getNextTrack = useCallback(() => {
    if (isShuffleOn) {
      let next;
      do {
        next = Math.floor(Math.random() * TRACKS.length);
      } while (next === currentTrack && TRACKS.length > 1);
      return next;
    }
    return (currentTrack + 1) % TRACKS.length;
  }, [currentTrack, isShuffleOn, TRACKS.length]);

  const handleNext = async () => {
    if (musicSource === "spotify") {
      await spotifyPlayback.skipNext();
    } else {
      setIsLoading(true);
      setPlayHistory((prev) => [...prev, currentTrack]);
      setCurrentTrack(getNextTrack());
      if (!isPlaying) setIsPlaying(true);
    }
  };

  const handlePrev = async () => {
    if (musicSource === "spotify") {
      await spotifyPlayback.skipPrevious();
    } else {
      setIsLoading(true);
      if (playHistory.length > 0) {
        const prevTrack = playHistory[playHistory.length - 1];
        setPlayHistory((prev) => prev.slice(0, -1));
        setCurrentTrack(prevTrack);
      } else {
        setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
      }
      if (!isPlaying) setIsPlaying(true);
    }
  };

  const handleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
    setPlayHistory([]);
  };

  const handleRepeat = () => {
    setIsRepeatOn(!isRepeatOn);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (musicSource === "spotify") {
      spotifyPlayback.setVolume(newVolume);
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (musicSource === "spotify" && spotifyPlayback.currentTrack) {
      const seekPosition = parseFloat(e.target.value);
      spotifyPlayback.seek(seekPosition);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  // Current track data
  const currentTrackData = TRACKS[currentTrack];

  // Only set random track on first ever mount (when no persisted state)
  const hasInitializedRef = useRef(persistedMusicState !== null);
  useEffect(() => {
    if (!hasInitializedRef.current) {
      const randomIndex = Math.floor(Math.random() * LOFI_TRACKS.length);
      setCurrentTrack(randomIndex);
      hasInitializedRef.current = true;
    }
  }, []);

  // Handle source change
  const handleSourceChange = (source: MusicSourceType) => {
    if (source === "spotify" && !spotifyAuth.isConnected) {
      spotifyAuth.connect();
      return;
    }

    // If switching away from YouTube, stop playback
    if (musicSource === "youtube" && source === "spotify") {
      setIsPlaying(false);
    }

    setMusicSource(source);
    setShowSourceMenu(false);
  };

  // Determine effective playing state and track info
  const effectiveIsPlaying =
    musicSource === "spotify" ? spotifyPlayback.isPlaying : isPlaying;
  const effectiveIsLoading =
    musicSource === "spotify" ? spotifyPlayback.isLoading : isLoading;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Hidden iframe for YouTube playback */}
      {musicSource === "youtube" && isPlaying && (
        <iframe
          key={`stream-${currentTrack}-${streamKey}`}
          src={STREAMS[currentTrack % STREAMS.length]}
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
          onLoad={handleIframeLoad}
        />
      )}

      {/* Background glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
      />

      <div
        className={`relative h-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border ${colors.border} rounded-2xl p-4 sm:p-5 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg bg-gradient-to-br ${colors.primary} bg-opacity-20`}
            >
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {musicSource === "spotify"
                  ? "Spotify"
                  : theme === "lofi"
                    ? "Lofi"
                    : theme === "coffeeshop"
                      ? "Coffee Shop"
                      : "Ghibli"}{" "}
                {musicSource === "spotify" ? "Connect" : "Beats"}
              </h2>
              <p className="text-[10px] text-white/50">
                {effectiveIsLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    {musicSource === "spotify" ? "Connecting..." : "Loading stream..."}
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
                  <>
                    {isPlaying ? "Now Playing" : "Paused"} • Track{" "}
                    {currentTrack + 1}/{TRACKS.length}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Source Toggle & Volume */}
          <div className="flex items-center gap-1">
            {/* Source Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                  musicSource === "spotify" ? "text-green-400" : colors.accent
                }`}
                aria-label="Change music source"
              >
                {musicSource === "spotify" ? (
                  <SpotifyIcon className="w-4 h-4" />
                ) : (
                  <Youtube className="w-4 h-4" />
                )}
              </button>

              {/* Source Menu */}
              {showSourceMenu && (
                <div className="absolute right-0 top-full mt-2 p-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-30 min-w-[180px]">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider px-2 pb-1 mb-1 border-b border-white/10">
                    Music Source
                  </div>

                  {/* YouTube Option */}
                  <button
                    onClick={() => handleSourceChange("youtube")}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                      musicSource === "youtube"
                        ? `bg-gradient-to-r ${colors.primary} text-white`
                        : "hover:bg-white/10 text-white/70"
                    }`}
                  >
                    <Youtube className="w-4 h-4" />
                    <span className="text-sm">YouTube Streams</span>
                  </button>

                  {/* Spotify Option */}
                  <button
                    onClick={() => handleSourceChange("spotify")}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors mt-1 ${
                      musicSource === "spotify"
                        ? "bg-green-500/20 text-green-400"
                        : "hover:bg-white/10 text-white/70"
                    }`}
                  >
                    <SpotifyIcon className="w-4 h-4" />
                    <span className="text-sm flex-1 text-left">
                      {spotifyAuth.isConnected ? "Spotify Connect" : "Connect Spotify"}
                    </span>
                    {spotifyAuth.isConnected ? (
                      <Wifi className="w-3 h-3 text-green-400" />
                    ) : (
                      <LogIn className="w-3 h-3" />
                    )}
                  </button>

                  {/* Disconnect Spotify */}
                  {spotifyAuth.isConnected && (
                    <button
                      onClick={() => {
                        spotifyAuth.disconnect();
                        if (musicSource === "spotify") {
                          setMusicSource("youtube");
                        }
                        setShowSourceMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors mt-1 hover:bg-red-500/10 text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Disconnect Spotify</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Volume Control */}
            <div
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${colors.accent}`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <VolumeIcon className="w-4 h-4" />
              </button>

              {showVolumeSlider && (
                <div className="absolute right-0 top-full mt-2 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-20 min-w-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <VolumeIcon className={`w-3 h-3 ${colors.accent}`} />
                    <span className="text-xs text-white/70">
                      {Math.round(volume)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${colors.progressBg} ${
                        isMuted ? 0 : volume
                      }%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume}%)`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Album Art / Visualizer */}
        <div className="relative mb-4 flex items-center justify-center flex-shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28">
            {/* Outer glow ring */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${
                colors.primary
              } opacity-20 ${effectiveIsPlaying && !effectiveIsLoading ? "animate-pulse" : ""}`}
              style={{ animationDuration: "2s" }}
            />

            {/* Album disc or Spotify album art */}
            <div
              className={`absolute inset-2 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 ${
                colors.border
              } flex items-center justify-center overflow-hidden ${
                effectiveIsPlaying && !effectiveIsLoading ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "4s" }}
            >
              {musicSource === "spotify" && spotifyPlayback.currentTrack?.albumArt ? (
                <img
                  src={spotifyPlayback.currentTrack.albumArt}
                  alt={spotifyPlayback.currentTrack.album}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <>
                  {/* Vinyl grooves */}
                  <div className="absolute inset-4 rounded-full border border-white/5" />
                  <div className="absolute inset-6 rounded-full border border-white/5" />
                  <div className="absolute inset-8 rounded-full border border-white/5" />

                  {/* Center label */}
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

            {/* Loading indicator overlay */}
            {effectiveIsLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border-2 border-t-transparent bg-gradient-to-br ${colors.primary} opacity-30 animate-spin`}
                  style={{ animationDuration: "1s" }}
                />
              </div>
            )}

            {/* Playing indicator rings */}
            {effectiveIsPlaying && !effectiveIsLoading && (
              <>
                <div
                  className={`absolute inset-0 rounded-full border-2 ${colors.border} animate-ping`}
                  style={{ animationDuration: "2s" }}
                />
                <div
                  className={`absolute -inset-2 rounded-full border ${colors.border} animate-ping`}
                  style={{ animationDuration: "3s", animationDelay: "0.5s" }}
                />
              </>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-4 flex-shrink-0 px-2">
          <h3 className="text-base sm:text-lg font-bold text-white truncate">
            {musicSource === "spotify" && spotifyPlayback.currentTrack
              ? spotifyPlayback.currentTrack.name
              : currentTrackData.name}
          </h3>
          <p className={`text-xs sm:text-sm ${colors.accent} truncate`}>
            {musicSource === "spotify" && spotifyPlayback.currentTrack
              ? spotifyPlayback.currentTrack.artist
              : currentTrackData.artist}
          </p>
        </div>

        {/* Progress Bar (Spotify only) */}
        {musicSource === "spotify" && spotifyPlayback.currentTrack && (
          <div className="mb-4 px-2">
            <input
              type="range"
              min="0"
              max={spotifyPlayback.currentTrack.duration_ms}
              value={spotifyPlayback.progress_ms}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${colors.progressBg} ${
                  (spotifyPlayback.progress_ms / spotifyPlayback.currentTrack.duration_ms) * 100
                }%, rgba(255,255,255,0.2) ${
                  (spotifyPlayback.progress_ms / spotifyPlayback.currentTrack.duration_ms) * 100
                }%)`,
              }}
            />
            <div className="flex justify-between mt-1 text-[10px] text-white/50">
              <span>{formatTime(spotifyPlayback.progress_ms)}</span>
              <span>{formatTime(spotifyPlayback.currentTrack.duration_ms)}</span>
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 flex-shrink-0">
          {/* Shuffle */}
          <button
            onClick={handleShuffle}
            className={`p-2 rounded-lg transition-all ${
              isShuffleOn
                ? `bg-gradient-to-br ${colors.primary} text-white shadow-lg ${colors.glow}`
                : "hover:bg-white/10 text-white/60 hover:text-white"
            }`}
            aria-label={isShuffleOn ? "Shuffle on" : "Shuffle off"}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={handlePrev}
            disabled={effectiveIsLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={effectiveIsLoading || (musicSource === "spotify" && !spotifyPlayback.hasActiveDevice)}
            className={`p-3 sm:p-4 bg-gradient-to-br ${colors.primary} text-white rounded-full hover:scale-105 shadow-lg ${colors.glow} transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100`}
            aria-label={effectiveIsLoading ? "Loading" : effectiveIsPlaying ? "Pause" : "Play"}
          >
            {effectiveIsLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : effectiveIsPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={effectiveIsLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Repeat */}
          <button
            onClick={handleRepeat}
            className={`p-2 rounded-lg transition-all ${
              isRepeatOn
                ? `bg-gradient-to-br ${colors.primary} text-white shadow-lg ${colors.glow}`
                : "hover:bg-white/10 text-white/60 hover:text-white"
            }`}
            aria-label={isRepeatOn ? "Repeat on" : "Repeat off"}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Waveform */}
        <div className="mt-auto flex items-end justify-center gap-[2px] h-12 sm:h-14 flex-shrink-0 px-2">
          {waveformBars.map((bar) => {
            const isAnimating = effectiveIsPlaying && !effectiveIsLoading;
            const height = isAnimating
              ? Math.sin(bar.id * bar.frequency + waveformOffset + bar.phase) * 25 + 35
              : bar.baseHeight;

            const colorIndex = Math.floor(
              (bar.id + Math.floor(waveformOffset * 2)) % colors.waveColors.length
            );

            return (
              <div
                key={bar.id}
                className="flex-1 rounded-full transition-all duration-75"
                style={{
                  height: `${height}%`,
                  background: isAnimating
                    ? `linear-gradient(to top, ${colors.waveColors[colorIndex]}, ${
                        colors.waveColors[(colorIndex + 1) % colors.waveColors.length]
                      })`
                    : `linear-gradient(to top, ${colors.waveColors[0]}40, ${colors.waveColors[2]}40)`,
                  opacity: isAnimating ? 0.9 : 0.4,
                  boxShadow: isAnimating
                    ? `0 0 8px ${colors.waveColors[colorIndex]}60`
                    : "none",
                }}
              />
            );
          })}
        </div>

        {/* Track indicator dots (YouTube only) / Device indicator (Spotify) */}
        <div className="flex items-center justify-center gap-1 mt-3 flex-shrink-0">
          {musicSource === "youtube" ? (
            TRACKS.slice(0, 10).map((_, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => {
                  if (currentTrack !== idx) {
                    setIsLoading(true);
                    setCurrentTrack(idx);
                    if (!isPlaying) setIsPlaying(true);
                  }
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all disabled:cursor-not-allowed ${
                  currentTrack === idx
                    ? `bg-gradient-to-r ${colors.primary} w-4`
                    : "bg-white/20 hover:bg-white/40 disabled:hover:bg-white/20"
                }`}
                aria-label={`Play track ${idx + 1}`}
              />
            ))
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <Smartphone className="w-3 h-3" />
              <span>
                {spotifyPlayback.hasActiveDevice
                  ? `Playing on ${spotifyPlayback.activeDevice?.name}`
                  : "Open Spotify on a device"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close source menu */}
      {showSourceMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowSourceMenu(false)}
        />
      )}
    </div>
  );
}
