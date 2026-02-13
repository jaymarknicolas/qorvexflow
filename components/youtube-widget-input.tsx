"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Pencil,
  Check,
  FolderPlus,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CustomPlaylist, PlaylistsState } from "@/types/youtube";

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

const MAX_PLAYLISTS = 10;

// Persist state across re-mounts
let persistedState: {
  currentVideo: VideoItem | null;
  playlistsState: PlaylistsState | null;
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

const getThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

function loadPlaylists(): PlaylistsState {
  if (persistedState?.playlistsState) return persistedState.playlistsState;
  if (typeof window === "undefined")
    return { activePlaylistId: null, playlists: [], version: 1 };

  const newData = localStorage.getItem("qorvexflow_yt_playlists");
  if (newData) {
    try {
      return JSON.parse(newData);
    } catch {
      // fall through
    }
  }

  // Migration from old single playlist
  const oldData = localStorage.getItem("qorvexflow_yt_playlist");
  if (oldData) {
    try {
      const oldVideos: PlaylistItem[] = JSON.parse(oldData);
      const migrated: PlaylistsState = {
        activePlaylistId:
          oldVideos.length > 0 ? "migrated-default" : null,
        playlists:
          oldVideos.length > 0
            ? [
                {
                  id: "migrated-default",
                  name: "My Playlist",
                  videos: oldVideos,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              ]
            : [],
        version: 1,
      };
      localStorage.setItem(
        "qorvexflow_yt_playlists",
        JSON.stringify(migrated),
      );
      localStorage.removeItem("qorvexflow_yt_playlist");
      return migrated;
    } catch {
      // fall through
    }
  }

  return { activePlaylistId: null, playlists: [], version: 1 };
}

export default function YouTubeWidgetInput() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isVeryCompact, setIsVeryCompact] = useState(false);
  const hasStartedRef = useRef(false);

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

  // === State ===
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(() => {
    if (persistedState?.currentVideo) return persistedState.currentVideo;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qorvexflow_yt_current");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Multi-playlist state
  const [playlistsState, setPlaylistsState] =
    useState<PlaylistsState>(loadPlaylists);

  // Derived: active playlist and its videos
  const activePlaylist = useMemo(
    () =>
      playlistsState.playlists.find(
        (p) => p.id === playlistsState.activePlaylistId,
      ) || null,
    [playlistsState],
  );
  const playlist = useMemo(
    () => (activePlaylist?.videos || []) as PlaylistItem[],
    [activePlaylist],
  );
  const totalVideosCount = useMemo(
    () => playlistsState.playlists.reduce((sum, p) => sum + p.videos.length, 0),
    [playlistsState],
  );

  // Dashboard state
  const [dashboardVideos, setDashboardVideos] = useState<SearchResult[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  // Playlist management state
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
    null,
  );
  const [editingName, setEditingName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [view, setView] = useState<
    "player" | "search" | "streams" | "playlist"
  >("player");
  const [showControls] = useState(true);

  // === Persist state ===
  useEffect(() => {
    persistedState = { currentVideo, playlistsState };
    if (currentVideo) {
      localStorage.setItem(
        "qorvexflow_yt_current",
        JSON.stringify(currentVideo),
      );
    } else {
      localStorage.removeItem("qorvexflow_yt_current");
    }
    localStorage.setItem(
      "qorvexflow_yt_playlists",
      JSON.stringify(playlistsState),
    );
  }, [currentVideo, playlistsState]);

  // === Dashboard fetch ===
  const fetchDashboard = useCallback(
    async (force = false) => {
      if (!force) {
        try {
          const cached = sessionStorage.getItem("qorvexflow_yt_dashboard");
          if (cached) {
            const { videos, timestamp, cachedTheme } = JSON.parse(cached);
            // Invalidate if theme changed or cache expired (30 min)
            if (
              cachedTheme === theme &&
              Date.now() - timestamp < 30 * 60 * 1000
            ) {
              setDashboardVideos(videos);
              return;
            }
          }
        } catch {
          // ignore
        }
      }

      setIsDashboardLoading(true);
      try {
        // Build URL with theme and user search interests
        const params = new URLSearchParams();
        params.set("theme", theme);
        const history = getSearchHistory();
        if (history.length > 0) {
          params.set("interests", history.slice(0, 10).join(","));
        }

        const res = await fetch(`/api/youtube/suggested?${params.toString()}`);
        const data = await res.json();
        if (data.videos?.length > 0) {
          setDashboardVideos(data.videos);
          sessionStorage.setItem(
            "qorvexflow_yt_dashboard",
            JSON.stringify({
              videos: data.videos,
              timestamp: Date.now(),
              cachedTheme: theme,
            }),
          );
        }
      } catch {
        // Fail silently, curated streams are the fallback
      } finally {
        setIsDashboardLoading(false);
      }
    },
    [theme],
  );

  useEffect(() => {
    if (!currentVideo) {
      fetchDashboard();
    }
  }, [currentVideo, fetchDashboard]);

  // === Playlist CRUD ===
  const createPlaylist = (name: string) => {
    if (playlistsState.playlists.length >= MAX_PLAYLISTS) return;
    const id = crypto.randomUUID();
    setPlaylistsState((prev) => ({
      ...prev,
      activePlaylistId: id,
      playlists: [
        ...prev.playlists,
        {
          id,
          name: name.trim().slice(0, 50),
          videos: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    }));
  };

  const deletePlaylist = (id: string) => {
    setPlaylistsState((prev) => {
      const remaining = prev.playlists.filter((p) => p.id !== id);
      return {
        ...prev,
        activePlaylistId:
          prev.activePlaylistId === id
            ? remaining[0]?.id || null
            : prev.activePlaylistId,
        playlists: remaining,
      };
    });
  };

  const renamePlaylist = (id: string, newName: string) => {
    const trimmed = newName.trim().slice(0, 50);
    if (!trimmed) return;
    setPlaylistsState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) =>
        p.id === id ? { ...p, name: trimmed, updatedAt: Date.now() } : p,
      ),
    }));
    setEditingPlaylistId(null);
  };

  const switchPlaylist = (id: string) => {
    setPlaylistsState((prev) => ({ ...prev, activePlaylistId: id }));
  };

  // === Search history ===
  const saveSearchHistory = (query: string) => {
    try {
      const raw = localStorage.getItem("qorvexflow_yt_search_history");
      const history: string[] = raw ? JSON.parse(raw) : [];
      // Add to front, deduplicate, keep last 20
      const updated = [
        query.trim(),
        ...history.filter(
          (h) => h.toLowerCase() !== query.trim().toLowerCase(),
        ),
      ].slice(0, 20);
      localStorage.setItem(
        "qorvexflow_yt_search_history",
        JSON.stringify(updated),
      );
    } catch {
      // ignore
    }
  };

  const getSearchHistory = (): string[] => {
    try {
      const raw = localStorage.getItem("qorvexflow_yt_search_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // === Search YouTube ===
  const searchYouTube = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setView("search");

    // Save to search history for personalized suggestions
    saveSearchHistory(query);

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
      setSearchError(
        error instanceof Error ? error.message : "Search failed",
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Play a video
  const playVideo = (video: VideoItem) => {
    hasStartedRef.current = true;
    setCurrentVideo({
      ...video,
      thumbnail: video.thumbnail || getThumbnail(video.id),
    });
    setView("player");
    setSearchQuery("");
  };

  // Add video(s) to active playlist
  const addToPlaylist = (video: VideoItem) => {
    if (!playlistsState.activePlaylistId) return;
    setPlaylistsState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id !== prev.activePlaylistId) return p;
        if (p.videos.find((v) => v.id === video.id)) return p;
        return {
          ...p,
          videos: [
            ...p.videos,
            {
              ...video,
              thumbnail: video.thumbnail || getThumbnail(video.id),
              addedAt: Date.now(),
            },
          ],
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  const addAllToPlaylist = (videos: VideoItem[]) => {
    if (!playlistsState.activePlaylistId) {
      // Auto-create a playlist if none exists
      const id = crypto.randomUUID();
      const now = Date.now();
      setPlaylistsState((prev) => ({
        ...prev,
        activePlaylistId: id,
        playlists: [
          ...prev.playlists,
          {
            id,
            name: "My Playlist",
            videos: videos.map((v, i) => ({
              ...v,
              thumbnail: v.thumbnail || getThumbnail(v.id),
              addedAt: now + i,
            })),
            createdAt: now,
            updatedAt: now,
          },
        ],
      }));
      return;
    }

    setPlaylistsState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id !== prev.activePlaylistId) return p;
        const existingIds = new Set(p.videos.map((v) => v.id));
        const newVideos = videos
          .filter((v) => !existingIds.has(v.id))
          .map((v, i) => ({
            ...v,
            thumbnail: v.thumbnail || getThumbnail(v.id),
            addedAt: Date.now() + i,
          }));
        if (newVideos.length === 0) return p;
        return {
          ...p,
          videos: [...p.videos, ...newVideos],
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  // Remove from active playlist
  const removeFromPlaylist = (videoId: string) => {
    if (!playlistsState.activePlaylistId) return;
    setPlaylistsState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id !== prev.activePlaylistId) return p;
        return {
          ...p,
          videos: p.videos.filter((v) => v.id !== videoId),
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  // Keep refs in sync for the message handler
  const currentVideoRef = useRef(currentVideo);
  const playlistRef = useRef(playlist);
  useEffect(() => {
    currentVideoRef.current = currentVideo;
    playlistRef.current = playlist;
  }, [currentVideo, playlist]);

  // Play next/previous
  const playNext = useCallback(() => {
    const cv = currentVideoRef.current;
    const pl = playlistRef.current;
    if (!cv || pl.length === 0) return;

    const currentIndex = pl.findIndex((p) => p.id === cv.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < pl.length) {
      hasStartedRef.current = true;
      setCurrentVideo(pl[nextIndex]);
    }
  }, []);

  const playPrevious = useCallback(() => {
    const cv = currentVideoRef.current;
    const pl = playlistRef.current;
    if (!cv || pl.length === 0) return;
    const currentIndex = pl.findIndex((p) => p.id === cv.id);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentVideo(pl[prevIndex]);
    }
  }, []);

  // YouTube IFrame Player API
  const playerRef = useRef<any>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).YT?.Player) return;
    if (
      document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      )
    )
      return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    if (!currentVideo) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      return;
    }

    const createPlayer = () => {
      const wrapper = playerWrapperRef.current;
      if (!wrapper) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }

      wrapper.innerHTML = "";
      const playerDiv = document.createElement("div");
      playerDiv.id = "yt-api-player";
      wrapper.appendChild(playerDiv);

      const shouldAutoplay = hasStartedRef.current ? 1 : 0;

      playerRef.current = new (window as any).YT.Player("yt-api-player", {
        videoId: currentVideo.id,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: shouldAutoplay,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            if (shouldAutoplay) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              playNext();
            }
            if (event.data === 1) {
              hasStartedRef.current = true;
            }
          },
        },
      });
    };

    const waitForAPI = () => {
      if ((window as any).YT?.Player) {
        createPlayer();
      } else {
        (window as any).onYouTubeIframeAPIReady = createPlayer;
      }
    };

    const timer = setTimeout(waitForAPI, 50);
    return () => clearTimeout(timer);
  }, [currentVideo?.id, playNext]);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, []);

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

  // Check if video is in active playlist
  const isInPlaylist = (videoId: string) =>
    !!activePlaylist?.videos.find((v) => v.id === videoId);

  // === Render: Search Results ===
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
        <div>
          {/* Bulk Add All */}
          <div
            className={`flex items-center justify-between border-b border-white/5 ${isVeryCompact ? "px-2 py-1.5" : "px-3 py-2"}`}
          >
            <p
              className={`text-white/40 ${isVeryCompact ? "text-[9px]" : "text-xs"}`}
            >
              {searchResults.length} results
            </p>
            <button
              onClick={() => addAllToPlaylist(searchResults)}
              className={`flex items-center gap-1 rounded-lg transition-colors ${colors.accentBg} ${colors.accent} ${colors.accentBgHover} ${
                isVeryCompact
                  ? "px-1.5 py-0.5 text-[9px]"
                  : "px-2 py-1 text-[11px]"
              }`}
            >
              <Plus className="w-3 h-3" />
              Add All
              {activePlaylist && !isVeryCompact && (
                <span className="text-white/40 ml-0.5">
                  to {activePlaylist.name}
                </span>
              )}
            </button>
          </div>

          <div
            className={`space-y-1 ${isVeryCompact ? "p-2" : "p-3"}`}
          >
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
                    isInPlaylist(video.id)
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
        </div>
      )}
    </div>
  );

  // === Render: Streams ===
  const renderStreams = () => (
    <div
      className={`flex-1 overflow-y-auto ${isVeryCompact ? "p-2" : "p-3"}`}
    >
      <div className="space-y-4">
        {CURATED_STREAMS.map((category) => (
          <div key={category.category}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div
                className={`flex items-center gap-2 ${colors.accent}`}
              >
                <category.icon
                  className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                />
                <span
                  className={`font-medium ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                >
                  {category.category}
                </span>
              </div>
              {/* Add All button */}
              <button
                onClick={() => addAllToPlaylist(category.videos)}
                className={`flex items-center gap-1 rounded transition-colors ${colors.accentBg} ${colors.accent} ${colors.accentBgHover} ${
                  isVeryCompact
                    ? "px-1.5 py-0.5 text-[9px]"
                    : "px-2 py-0.5 text-[10px]"
                }`}
              >
                <Plus className="w-3 h-3" />
                Add All
              </button>
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
                      isInPlaylist(video.id) ? colors.accent : ""
                    }`}
                  >
                    <Plus
                      className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // === Render: Playlist ===
  const renderPlaylist = () => (
    <TooltipProvider delayDuration={300}>
    <div
      className={`flex-1 overflow-y-auto ${isVeryCompact ? "p-2" : "p-3"}`}
    >
      {/* Playlist selector header */}
      <div className={`mb-3 ${isVeryCompact ? "space-y-1.5" : "space-y-2"}`}>
        <div className="flex items-center gap-1.5">
          {/* Playlist selector */}
          <select
            value={playlistsState.activePlaylistId || ""}
            onChange={(e) => switchPlaylist(e.target.value)}
            className={`flex-1 min-w-0 ${colors.inputBg} border ${colors.border} rounded-lg text-white focus:outline-none appearance-none cursor-pointer ${
              isVeryCompact
                ? "text-[10px] py-1 px-2"
                : "text-xs py-1.5 px-2"
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              paddingRight: "24px",
            }}
          >
            {playlistsState.playlists.length === 0 && (
              <option value="">No playlists yet</option>
            )}
            {playlistsState.playlists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.videos.length})
              </option>
            ))}
          </select>

          {/* Rename */}
          {activePlaylist && !editingPlaylistId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setEditingPlaylistId(activePlaylist.id);
                    setEditingName(activePlaylist.name);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 text-white/40 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  <Pencil className={isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rename</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Create new playlist */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCreatingPlaylist(true)}
                disabled={playlistsState.playlists.length >= MAX_PLAYLISTS}
                className={`p-1.5 rounded-lg ${colors.accentBg} ${colors.accent} disabled:opacity-30 transition-colors flex-shrink-0`}
              >
                <FolderPlus className={isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {playlistsState.playlists.length >= MAX_PLAYLISTS
                  ? `Max ${MAX_PLAYLISTS} playlists`
                  : "New playlist"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Delete */}
          {activePlaylist && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => deletePlaylist(activePlaylist.id)}
                  className="p-1.5 rounded-lg bg-white/10 text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
                >
                  <Trash2 className={isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete playlist</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Rename form */}
        {editingPlaylistId && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              renamePlaylist(editingPlaylistId, editingName);
            }}
            className="flex gap-1.5"
          >
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              maxLength={50}
              className={`flex-1 ${colors.inputBg} border ${colors.border} rounded-lg text-white focus:outline-none ${
                isVeryCompact
                  ? "text-[10px] py-1 px-2"
                  : "text-xs py-1.5 px-2"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditingPlaylistId(null);
              }}
            />
            <button
              type="submit"
              className={`p-1.5 rounded-lg bg-gradient-to-r ${colors.button} text-white`}
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setEditingPlaylistId(null)}
              className="p-1.5 text-white/40 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        )}

        {/* Create form */}
        {isCreatingPlaylist && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newPlaylistName.trim()) {
                createPlaylist(newPlaylistName);
                setNewPlaylistName("");
                setIsCreatingPlaylist(false);
              }
            }}
            className="flex gap-1.5"
          >
            <input
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name..."
              maxLength={50}
              className={`flex-1 ${colors.inputBg} border ${colors.border} rounded-lg text-white placeholder-white/40 focus:outline-none ${
                isVeryCompact
                  ? "text-[10px] py-1 px-2"
                  : "text-xs py-1.5 px-2"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsCreatingPlaylist(false);
              }}
            />
            <button
              type="submit"
              className={`px-2 py-1 rounded-lg bg-gradient-to-r ${colors.button} text-white ${
                isVeryCompact ? "text-[10px]" : "text-xs"
              }`}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingPlaylist(false)}
              className="p-1.5 text-white/40 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        )}
      </div>

      {/* Playlist content */}
      {!activePlaylist ? (
        <div className="flex flex-col items-center justify-center h-[calc(100%-60px)]">
          <FolderPlus
            className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`}
          />
          <p
            className={`text-white/40 text-center ${isVeryCompact ? "text-[10px]" : "text-sm"}`}
          >
            Create a playlist to get started
          </p>
          <button
            onClick={() => setIsCreatingPlaylist(true)}
            className={`mt-3 flex items-center gap-1.5 ${colors.accentBg} ${colors.accentBgHover} ${colors.accent} rounded-lg transition-colors ${
              isVeryCompact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
            }`}
          >
            <Plus className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
            New Playlist
          </button>
        </div>
      ) : playlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100%-60px)]">
          <List
            className={`text-white/20 ${isVeryCompact ? "w-8 h-8 mb-2" : "w-10 h-10 mb-3"}`}
          />
          <p
            className={`text-white/40 ${isVeryCompact ? "text-[10px]" : "text-sm"}`}
          >
            {activePlaylist.name} is empty
          </p>
          <p
            className={`text-white/30 mt-1 ${isVeryCompact ? "text-[9px]" : "text-xs"}`}
          >
            Search or browse streams to add videos
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
                <Trash2
                  className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </TooltipProvider>
  );

  // === Render: Player or Dashboard ===
  const renderPlayer = () => {
    if (!currentVideo) {
      return (
        <div
          className={`flex-1 overflow-y-auto ${isVeryCompact ? "p-2" : "p-3"}`}
        >
          {/* Dashboard grid */}
          {isDashboardLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2
                className={`animate-spin ${colors.accent} w-6 h-6`}
              />
            </div>
          ) : dashboardVideos.length > 0 ? (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className={`text-white/50 font-medium ${isVeryCompact ? "text-[10px]" : "text-xs"}`}
                >
                  Suggested for you
                </p>
                <button
                  onClick={() => fetchDashboard(true)}
                  className="p-1 text-white/30 hover:text-white transition-colors rounded"
                  title="Refresh suggestions"
                >
                  <RefreshCw
                    className={`${isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} ${isDashboardLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
              <div
                className={`grid gap-2 ${isVeryCompact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}
              >
                {dashboardVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => playVideo(video)}
                    className={`rounded-lg bg-white/5 ${colors.cardHover} cursor-pointer overflow-hidden transition-colors group`}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className={isVeryCompact ? "p-1" : "p-1.5"}>
                      <p
                        className={`text-white line-clamp-2 leading-tight ${isVeryCompact ? "text-[9px]" : "text-[10px]"}`}
                      >
                        {video.title}
                      </p>
                      {!isVeryCompact && video.channel && (
                        <p className="text-white/40 text-[9px] truncate mt-0.5">
                          {video.channel}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Fallback empty state when no dashboard videos */
            <div className="flex flex-col items-center justify-center mb-4 py-4">
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
                  <h3 className="text-white font-semibold mb-1">
                    YouTube Player
                  </h3>
                  <p className="text-white/50 text-sm text-center mb-2">
                    Search or browse streams
                  </p>
                </>
              )}
            </div>
          )}

          {/* Quick buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setView("streams")}
              className={`flex items-center gap-1.5 ${colors.accentBg} ${colors.accentBgHover} ${colors.accent} rounded-lg transition-colors ${
                isVeryCompact
                  ? "px-2 py-1 text-[10px]"
                  : "px-3 py-1.5 text-xs"
              }`}
            >
              <Radio className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              <span>Streams</span>
            </button>
            <button
              onClick={() => setView("playlist")}
              className={`flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors ${
                isVeryCompact
                  ? "px-2 py-1 text-[10px]"
                  : "px-3 py-1.5 text-xs"
              }`}
            >
              <List className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"} />
              <span>
                Playlists
                {totalVideosCount > 0 && ` (${totalVideosCount})`}
              </span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Video */}
        <div className="flex-1 bg-black relative min-h-0">
          <div
            ref={playerWrapperRef}
            className="absolute inset-0 w-full h-full"
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
                              playlist.findIndex(
                                (p) => p.id === currentVideo.id,
                              ) <= 0
                            }
                            className={`rounded bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors ${
                              isVeryCompact ? "p-1" : "p-1.5"
                            }`}
                          >
                            <SkipBack
                              className={
                                isVeryCompact ? "w-3 h-3" : "w-4 h-4"
                              }
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
                              playlist.findIndex(
                                (p) => p.id === currentVideo.id,
                              ) >=
                              playlist.length - 1
                            }
                            className={`rounded bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors ${
                              isVeryCompact ? "p-1" : "p-1.5"
                            }`}
                          >
                            <SkipForward
                              className={
                                isVeryCompact ? "w-3 h-3" : "w-4 h-4"
                              }
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
                        disabled={isInPlaylist(currentVideo.id)}
                        className={`rounded bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors ${
                          isVeryCompact ? "p-1" : "p-1.5"
                        }`}
                      >
                        <Plus
                          className={
                            isVeryCompact ? "w-3 h-3" : "w-4 h-4"
                          }
                        />
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
                        <X
                          className={
                            isVeryCompact ? "w-3 h-3" : "w-4 h-4"
                          }
                        />
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
                    <ArrowLeft
                      className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                    />
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
                    <Search
                      className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                    />
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
                      <Radio
                        className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Streams</p>
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
                      <List
                        className={isVeryCompact ? "w-3 h-3" : "w-4 h-4"}
                      />
                      {totalVideosCount > 0 && (
                        <span
                          className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full font-bold flex items-center justify-center ${
                            isVeryCompact
                              ? "text-[7px] w-3 h-3"
                              : "text-[9px] w-4 h-4"
                          }`}
                        >
                          {playlistsState.playlists.length}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Playlists</p>
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
              {view === "streams" && "Streams"}
              {view === "playlist" &&
                (activePlaylist
                  ? `${activePlaylist.name} (${playlist.length})`
                  : `Playlists (${playlistsState.playlists.length})`)}
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
