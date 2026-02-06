"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Youtube,
  Search,
  Play,
  X,
  SkipBack,
  SkipForward,
  List,
  Radio,
  Plus,
  Trash2,
  Music,
  Coffee,
  BookOpen,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoItem {
  id: string;
  title: string;
  channel?: string;
  thumbnail?: string;
}

interface PlaylistItem extends VideoItem {
  addedAt: number;
}

interface SearchResult extends VideoItem {
  channel: string;
  thumbnail: string;
}

// Popular lofi/study streams
const CURATED_STREAMS: {
  category: string;
  icon: React.ElementType;
  videos: VideoItem[];
}[] = [
  {
    category: "Lofi Beats",
    icon: Music,
    videos: [
      {
        id: "jfKfPfyJRdk",
        title: "lofi hip hop radio - beats to relax/study to",
      },
      { id: "rUxyKA_-grg", title: "Lofi Girl - synthwave radio" },
      { id: "7NOSDKb0HlU", title: "Tokyo Night Lofi" },
    ],
  },
  {
    category: "Coffee Shop",
    icon: Coffee,
    videos: [
      { id: "h2zkV-l_TbY", title: "Coffee Shop Ambience" },
      { id: "gaGrHUekGrc", title: "Rainy Jazz Cafe" },
      { id: "c0_ejQQcrwI", title: "Autumn Coffee Shop" },
    ],
  },
  {
    category: "Study Focus",
    icon: BookOpen,
    videos: [
      { id: "TURbeWK2wwg", title: "Deep Focus Music" },
      { id: "sjkrrmBnpGE", title: "Study Music Alpha Waves" },
      { id: "lTRiuFIWV54", title: "4 Hours Study Session" },
    ],
  },
];

// Persist state
let persistedState: {
  currentVideo: VideoItem | null;
  playlist: PlaylistItem[];
} | null = null;

// Helper functions
const getVideoId = (url: string): string => {
  try {
    if (url.includes("youtube.com/watch?v=")) {
      return url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      return url.split("embed/")[1]?.split("?")[0] || "";
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    return "";
  } catch {
    return "";
  }
};

const getEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
};

const getThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

export default function YouTubeWidgetInput() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isVeryCompact, setIsVeryCompact] = useState(false);

  // Container resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height, width } = entry.contentRect;
        setIsVeryCompact(height < 300 || width < 300);
        setIsCompact(height < 400 || width < 380);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/20",
          accentBgHover: "hover:bg-emerald-500/30",
          border: "border-emerald-500/20",
          button:
            "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400",
          buttonShadow: "shadow-emerald-500/25",
          inputBg: "bg-black/30",
          inputFocus: "focus:ring-emerald-500/30 focus:border-emerald-400/50",
          cardHover: "hover:bg-emerald-500/15",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          accentBgHover: "hover:bg-amber-500/30",
          border: "border-amber-500/20",
          button:
            "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
          buttonShadow: "shadow-amber-500/25",
          inputBg: "bg-black/30",
          inputFocus: "focus:ring-amber-500/30 focus:border-amber-400/50",
          cardHover: "hover:bg-amber-500/15",
        };
      default:
        return {
          gradient: "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          accentBgHover: "hover:bg-violet-500/30",
          border: "border-violet-500/20",
          button:
            "from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400",
          buttonShadow: "shadow-violet-500/25",
          inputBg: "bg-black/30",
          inputFocus: "focus:ring-violet-500/30 focus:border-violet-400/50",
          cardHover: "hover:bg-violet-500/15",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  // State
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(() => {
    if (persistedState?.currentVideo) return persistedState.currentVideo;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qorvexflow_yt_current");
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => {
    if (persistedState?.playlist) return persistedState.playlist;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qorvexflow_yt_playlist");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [view, setView] = useState<
    "player" | "search" | "streams" | "playlist"
  >("player");
  const [showControls, setShowControls] = useState(true);

  // Persist state
  useEffect(() => {
    persistedState = { currentVideo, playlist };
    if (currentVideo) {
      localStorage.setItem(
        "qorvexflow_yt_current",
        JSON.stringify(currentVideo),
      );
    } else {
      localStorage.removeItem("qorvexflow_yt_current");
    }
    localStorage.setItem("qorvexflow_yt_playlist", JSON.stringify(playlist));
  }, [currentVideo, playlist]);

  // Search YouTube
  const searchYouTube = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setView("search");

    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setSearchResults(data.videos);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Play video
  const playVideo = (video: VideoItem) => {
    setCurrentVideo({
      ...video,
      thumbnail: video.thumbnail || getThumbnail(video.id),
    });
    setView("player");
    setSearchQuery("");
  };

  // Add to playlist
  const addToPlaylist = (video: VideoItem) => {
    if (!playlist.find((p) => p.id === video.id)) {
      setPlaylist((prev) => [
        ...prev,
        {
          ...video,
          thumbnail: video.thumbnail || getThumbnail(video.id),
          addedAt: Date.now(),
        },
      ]);
    }
  };

  // Remove from playlist
  const removeFromPlaylist = (id: string) => {
    setPlaylist((prev) => prev.filter((p) => p.id !== id));
  };

  // Play next/previous
  const playNext = () => {
    if (!currentVideo || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((p) => p.id === currentVideo.id);
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      setCurrentVideo(playlist[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (!currentVideo || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((p) => p.id === currentVideo.id);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentVideo(playlist[prevIndex]);
    }
  };

  // Handle search/URL submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const videoId = getVideoId(searchQuery);
    if (videoId) {
      playVideo({ id: videoId, title: `` });
      setSearchQuery("");
    } else {
      searchYouTube(searchQuery);
    }
  };

  // Clear video
  const clearVideo = () => {
    setCurrentVideo(null);
  };

  // Render search results
  const renderSearchResults = () => (
    <div className="flex-1 overflow-y-auto">
      {isSearching ? (
        <div className="flex items-center justify-center h-full">
          <Loader2
            className={`animate-spin ${colors.accent} ${isVeryCompact ? "w-6 h-6" : "w-8 h-8"}`}
          />
        </div>
      ) : searchError ? (
        <div
          className={`flex flex-col items-center justify-center h-full text-center ${isVeryCompact ? "p-3" : "p-6"}`}
        >
          <AlertCircle
            className={`text-red-400/60 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`}
          />
          <p
            className={`text-white/60 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}
          >
            {searchError}
          </p>
          {searchError.includes("API key") && (
            <p
              className={`text-white/40 mt-2 ${isVeryCompact ? "text-[9px]" : "text-xs"}`}
            >
              Add NEXT_PUBLIC_YOUTUBE_API_KEY to .env.local
            </p>
          )}
        </div>
      ) : searchResults.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center h-full ${isVeryCompact ? "p-3" : "p-6"}`}
        >
          <Search
            className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`}
          />
          <p
            className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}
          >
            Search for videos
          </p>
        </div>
      ) : (
        <div className={`space-y-1 ${isVeryCompact ? "p-2" : "p-3"}`}>
          {searchResults.map((video) => (
            <div
              key={video.id}
              className={`flex gap-2 rounded-lg bg-white/5 ${colors.cardHover} transition-colors cursor-pointer overflow-hidden ${
                isVeryCompact ? "p-1.5" : "p-2"
              }`}
              onClick={() => playVideo(video)}
            >
              {/* Thumbnail */}
              <div
                className={`relative flex-shrink-0 rounded overflow-hidden bg-black/50 ${
                  isVeryCompact ? "w-16 h-10" : "w-24 h-14"
                }`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p
                  className={`text-white font-medium line-clamp-2 ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                >
                  {video.title}
                </p>
                <p
                  className={`text-white/50 truncate ${isVeryCompact ? "text-[9px]" : "text-[11px]"}`}
                >
                  {video.channel}
                </p>
              </div>

              {/* Add to playlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToPlaylist(video);
                }}
                className={`self-center p-1.5 rounded-lg bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0 ${
                  playlist.find((p) => p.id === video.id)
                    ? `${colors.accent} ${colors.accentBg}`
                    : ""
                }`}
                title="Add to playlist"
              >
                <Plus className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render streams
  const renderStreams = () => (
    <div className={`flex-1 overflow-y-auto ${isVeryCompact ? "p-2" : "p-3"}`}>
      <div className="space-y-4">
        {CURATED_STREAMS.map((category) => (
          <div key={category.category}>
            <div className={`flex items-center gap-2 mb-2 ${colors.accent}`}>
              <category.icon
                className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
              />
              <span
                className={`font-medium ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
              >
                {category.category}
              </span>
            </div>
            <div className="space-y-1">
              {category.videos.map((video) => (
                <div
                  key={video.id}
                  className={`flex gap-2 rounded-lg bg-white/5 ${colors.cardHover} transition-colors cursor-pointer overflow-hidden ${
                    isVeryCompact ? "p-1.5" : "p-2"
                  }`}
                  onClick={() => playVideo(video)}
                >
                  {/* Thumbnail */}
                  <div
                    className={`relative flex-shrink-0 rounded overflow-hidden bg-black/50 ${
                      isVeryCompact ? "w-14 h-9" : "w-20 h-12"
                    }`}
                  >
                    <img
                      src={getThumbnail(video.id)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex items-center">
                    <p
                      className={`text-white truncate ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                    >
                      {video.title}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToPlaylist(video);
                    }}
                    className={`self-center p-1 rounded text-white/40 hover:text-white transition-colors ${
                      playlist.find((p) => p.id === video.id)
                        ? colors.accent
                        : ""
                    }`}
                  >
                    <Plus className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render playlist
  const renderPlaylist = () => (
    <div className={`flex-1 overflow-y-auto ${isVeryCompact ? "p-2" : "p-3"}`}>
      {playlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <List
            className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`}
          />
          <p
            className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}
          >
            Playlist is empty
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {playlist.map((video, index) => (
            <div
              key={video.id}
              className={`flex gap-2 rounded-lg transition-colors cursor-pointer overflow-hidden ${
                currentVideo?.id === video.id
                  ? `${colors.accentBg} border ${colors.border}`
                  : `bg-white/5 ${colors.cardHover}`
              } ${isVeryCompact ? "p-1.5" : "p-2"}`}
              onClick={() => playVideo(video)}
            >
              {/* Number */}
              <span
                className={`text-white/40 w-4 text-center self-center ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
              >
                {index + 1}
              </span>

              {/* Thumbnail */}
              <div
                className={`relative flex-shrink-0 rounded overflow-hidden bg-black/50 ${
                  isVeryCompact ? "w-12 h-8" : "w-16 h-10"
                }`}
              >
                <img
                  src={video.thumbnail || getThumbnail(video.id)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {currentVideo?.id === video.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Play
                      className={`${colors.accent} ${isVeryCompact ? "w-3 h-3" : "w-4 h-4"}`}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex items-center">
                <p
                  className={`text-white truncate ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                >
                  {video.title}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromPlaylist(video.id);
                }}
                className="self-center p-1 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render player or empty state
  const renderPlayer = () => {
    if (!currentVideo) {
      return (
        <div
          className={`flex-1 flex flex-col items-center justify-center ${isVeryCompact ? "p-3" : "p-6"}`}
        >
          <div
            className={`rounded-2xl ${colors.accentBg} flex items-center justify-center ${
              isVeryCompact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"
            }`}
          >
            <Youtube
              className={`${colors.accent} ${isVeryCompact ? "w-6 h-6" : "w-8 h-8"}`}
            />
          </div>

          {!isVeryCompact && (
            <>
              <h3 className="text-white font-semibold mb-1">YouTube Player</h3>
              <p className="text-white/50 text-sm text-center mb-4">
                Search or browse lofi streams
              </p>
            </>
          )}

          {/* Quick buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setView("streams")}
              className={`flex items-center gap-1.5 ${colors.accentBg} ${colors.accentBgHover} ${colors.accent} rounded-lg transition-colors ${
                isVeryCompact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
              }`}
            >
              <Radio className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              <span>Lofi Streams</span>
            </button>
            {playlist.length > 0 && (
              <button
                onClick={() => setView("playlist")}
                className={`flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors ${
                  isVeryCompact
                    ? "px-2 py-1 text-[10px]"
                    : "px-3 py-1.5 text-xs"
                }`}
              >
                <List className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                <span>Playlist ({playlist.length})</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Video */}
        <div className="flex-1 bg-black relative min-h-0">
          <iframe
            src={getEmbedUrl(currentVideo.id)}
            className="absolute inset-0 w-full h-full"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Controls */}
        {showControls && (
          <TooltipProvider delayDuration={300}>
          <div
            className={`flex-shrink-0 border-t border-white/10 bg-black/40 ${
              isVeryCompact ? "p-1.5" : "p-2"
            }`}
          >
            <div className="flex items-center gap-2">
              <p
                className={`flex-1 text-white truncate min-w-0 ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
              >
                {currentVideo.title}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {playlist.length > 0 && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={playPrevious}
                          disabled={
                            playlist.findIndex((p) => p.id === currentVideo.id) <= 0
                          }
                          className={`rounded bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors ${
                            isVeryCompact ? "p-1" : "p-1.5"
                          }`}
                        >
                          <SkipBack
                            className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Previous</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={playNext}
                          disabled={
                            playlist.findIndex((p) => p.id === currentVideo.id) >=
                            playlist.length - 1
                          }
                          className={`rounded bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors ${
                            isVeryCompact ? "p-1" : "p-1.5"
                          }`}
                        >
                          <SkipForward
                            className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Next</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => addToPlaylist(currentVideo)}
                      disabled={!!playlist.find((p) => p.id === currentVideo.id)}
                      className={`rounded bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors ${
                        isVeryCompact ? "p-1" : "p-1.5"
                      }`}
                    >
                      <Plus className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to playlist</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={clearVideo}
                      className={`rounded bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors ${
                        isVeryCompact ? "p-1" : "p-1.5"
                      }`}
                    >
                      <X className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          </TooltipProvider>
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border} shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <TooltipProvider delayDuration={300}>
      <div
        className={`flex-shrink-0 border-b border-white/10 bg-black/20 ${
          isVeryCompact ? "p-2" : "p-3"
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Back button when in sub-views */}
          {view !== "player" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("player")}
                  className={`rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors ${
                    isVeryCompact ? "p-1" : "p-1.5"
                  }`}
                >
                  <ArrowLeft className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isVeryCompact ? "Search..." : "Search or paste URL..."
                }
                className={`w-full ${colors.inputBg} border ${colors.border} rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all ${
                  isVeryCompact
                    ? "pl-7 pr-2 py-1.5 text-[10px]"
                    : "pl-9 pr-3 py-2 text-sm"
                }`}
              />
              <Search
                className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${
                  isVeryCompact ? "left-2 w-3 h-3" : "left-3 w-4 h-4"
                }`}
              />
            </div>
            {searchQuery && (
              <button
                type="submit"
                className={`bg-gradient-to-r ${colors.button} text-white rounded-lg transition-all shadow-lg ${colors.buttonShadow} ${
                  isVeryCompact ? "px-2 py-1" : "px-3 py-2"
                }`}
              >
                {isSearching ? (
                  <Loader2
                    className={`animate-spin ${isVeryCompact ? "w-3 h-3" : "w-4 h-4"}`}
                  />
                ) : (
                  <Search className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                )}
              </button>
            )}
          </form>

          {/* Nav buttons */}
          {view === "player" && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView("streams")}
                    className={`rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors ${
                      isVeryCompact ? "p-1.5" : "p-2"
                    }`}
                  >
                    <Radio className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lofi Streams</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView("playlist")}
                    className={`rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors relative ${
                      isVeryCompact ? "p-1.5" : "p-2"
                    }`}
                  >
                    <List className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
                    {playlist.length > 0 && (
                      <span
                        className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full font-bold flex items-center justify-center ${
                          isVeryCompact
                            ? "text-[7px] w-3 h-3"
                            : "text-[9px] w-4 h-4"
                        }`}
                      >
                        {playlist.length}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Playlist</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* View title */}
        {view !== "player" && (
          <p
            className={`mt-2 font-medium ${colors.accent} ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
          >
            {view === "search" && `Search results for "${searchQuery}"`}
            {view === "streams" && "Lofi & Study Streams"}
            {view === "playlist" && `Playlist (${playlist.length})`}
          </p>
        )}
      </div>
      </TooltipProvider>

      {/* Content */}
      {view === "player" && renderPlayer()}
      {view === "search" && renderSearchResults()}
      {view === "streams" && renderStreams()}
      {view === "playlist" && renderPlaylist()}
    </div>
  );
}
