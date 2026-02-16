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
  Heart,
  Plus,
  ChevronDown,
  Compass,
  Trash2,
  Pencil,
  Check,
  ListMusic,
  RefreshCw,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import { useSpotifyAuth } from "@/lib/hooks/useSpotifyAuth";
import { useSpotifyPlayback } from "@/lib/hooks/useSpotifyPlayback";
import { spotifyAPI, SpotifyTrack, SpotifyPlaylist as SpotifyAPIPlaylist } from "@/lib/services/spotify-api";
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
import type { MusicTrack, MusicPlaylist, MusicPlaylistsState } from "@/types/music";

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

// localStorage keys
const PLAYLISTS_STORAGE_KEY = "qorvexflow_music_playlists";
const SEARCH_HISTORY_KEY = "qorvexflow_music_search_history";

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Load playlists from localStorage
function loadPlaylists(): MusicPlaylistsState {
  try {
    const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return {
    activeYoutubePlaylistId: null,
    activeSpotifyPlaylistId: null,
    playlists: [],
    version: 1,
  };
}

// Save playlists to localStorage
function savePlaylists(state: MusicPlaylistsState) {
  try {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// Search history helpers
function getSearchHistory(): string[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(query: string) {
  try {
    const history = getSearchHistory();
    const updated = [query, ...history.filter((q) => q !== query)].slice(0, 20);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {}
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
  // YouTube search queue - when set, next/prev cycle through search results instead of preset list
  const [youtubeSearchQueue, setYoutubeSearchQueue] = useState<{ id: string; name: string; artist: string }[] | null>(null);
  const [youtubeQueueIndex, setYoutubeQueueIndex] = useState(0);
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

  // Playlist state
  const [playlistsState, setPlaylistsState] = useState<MusicPlaylistsState>(() => loadPlaylists());
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

  // Dashboard state - shows on init
  const [showDashboard, setShowDashboard] = useState(true);
  const [dashboardVideos, setDashboardVideos] = useState<{ id: string; title: string; channel: string; thumbnail?: string }[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardSpotifyPlaylists, setDashboardSpotifyPlaylists] = useState<SpotifyAPIPlaylist[]>([]);
  const [isDashboardSpotifyLoading, setIsDashboardSpotifyLoading] = useState(false);

  // Browse state
  const [showBrowse, setShowBrowse] = useState(false);
  const [browseVideos, setBrowseVideos] = useState<{ id: string; title: string; channel: string; thumbnail?: string }[]>([]);
  const [isBrowseLoading, setIsBrowseLoading] = useState(false);
  const [spotifyUserPlaylists, setSpotifyUserPlaylists] = useState<SpotifyAPIPlaylist[]>([]);
  const [isSpotifyBrowseLoading, setIsSpotifyBrowseLoading] = useState(false);
  const [browseSpotifyTracks, setBrowseSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [browseSpotifyPlaylistName, setBrowseSpotifyPlaylistName] = useState<string | null>(null);
  const [isBrowseSpotifyTracksLoading, setIsBrowseSpotifyTracksLoading] = useState(false);

  // Save playlists whenever state changes
  useEffect(() => {
    savePlaylists(playlistsState);
  }, [playlistsState]);

  // Derived playlist values
  const activePlaylistId = musicSource === "youtube"
    ? playlistsState.activeYoutubePlaylistId
    : playlistsState.activeSpotifyPlaylistId;

  const activePlaylist = playlistsState.playlists.find(
    (p) => p.id === activePlaylistId && p.source === musicSource,
  );

  const sourcePlaylists = playlistsState.playlists.filter(
    (p) => p.source === musicSource,
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

  // Playlist CRUD functions
  const createPlaylist = useCallback((name: string, source: MusicSourceType) => {
    if (playlistsState.playlists.length >= 10) return null;
    const id = crypto.randomUUID();
    const now = Date.now();
    const newPlaylist: MusicPlaylist = {
      id,
      name,
      source,
      tracks: [],
      createdAt: now,
      updatedAt: now,
    };
    setPlaylistsState((prev) => {
      const updated = {
        ...prev,
        playlists: [...prev.playlists, newPlaylist],
        ...(source === "youtube"
          ? { activeYoutubePlaylistId: id }
          : { activeSpotifyPlaylistId: id }),
      };
      return updated;
    });
    return id;
  }, [playlistsState.playlists.length]);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylistsState((prev) => {
      const playlist = prev.playlists.find((p) => p.id === id);
      const updated = {
        ...prev,
        playlists: prev.playlists.filter((p) => p.id !== id),
      };
      if (playlist?.source === "youtube" && prev.activeYoutubePlaylistId === id) {
        updated.activeYoutubePlaylistId = null;
      }
      if (playlist?.source === "spotify" && prev.activeSpotifyPlaylistId === id) {
        updated.activeSpotifyPlaylistId = null;
      }
      return updated;
    });
  }, []);

  const renamePlaylist = useCallback((id: string, newName: string) => {
    setPlaylistsState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) =>
        p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const switchPlaylist = useCallback((id: string | null) => {
    setPlaylistsState((prev) => ({
      ...prev,
      ...(musicSource === "youtube"
        ? { activeYoutubePlaylistId: id }
        : { activeSpotifyPlaylistId: id }),
    }));
    // If switching to a custom playlist and it has tracks, load them
    if (id) {
      const playlist = playlistsState.playlists.find((p) => p.id === id);
      if (playlist && playlist.tracks.length > 0 && musicSource === "youtube") {
        const queue = playlist.tracks.map((t) => ({
          id: t.id,
          name: t.name,
          artist: t.artist,
        }));
        setYoutubeSearchQueue(queue);
        setYoutubeQueueIndex(0);
        const video = queue[0];
        youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist }, false);
      } else if (playlist && playlist.tracks.length > 0 && musicSource === "spotify") {
        const uris = playlist.tracks.filter((t) => t.uri).map((t) => t.uri!);
        if (uris.length > 0) {
          spotifyAPI.play(undefined, uris, { position: 0 });
        }
      }
    } else {
      // Switching back to presets
      if (musicSource === "youtube") {
        setYoutubeSearchQueue(null);
        const video = VIDEO_LIST[currentTrack];
        youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist }, false);
      }
    }
    setShowPlaylistDropdown(false);
  }, [musicSource, playlistsState.playlists, VIDEO_LIST, currentTrack, youtubePlayer]);

  const addTrackToPlaylist = useCallback((track: MusicTrack, playlistId?: string) => {
    const targetId = playlistId || activePlaylistId;
    if (!targetId) {
      // Auto-create "Favorites" playlist
      const id = crypto.randomUUID();
      const now = Date.now();
      const newPlaylist: MusicPlaylist = {
        id,
        name: "Favorites",
        source: musicSource,
        tracks: [track],
        createdAt: now,
        updatedAt: now,
      };
      setPlaylistsState((prev) => ({
        ...prev,
        playlists: [...prev.playlists, newPlaylist],
        ...(musicSource === "youtube"
          ? { activeYoutubePlaylistId: id }
          : { activeSpotifyPlaylistId: id }),
      }));
      return;
    }

    setPlaylistsState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id !== targetId) return p;
        if (p.tracks.some((t) => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track], updatedAt: Date.now() };
      }),
    }));
  }, [activePlaylistId, musicSource]);

  const removeTrackFromPlaylist = useCallback((trackId: string, playlistId?: string) => {
    const targetId = playlistId || activePlaylistId;
    if (!targetId) return;
    setPlaylistsState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id !== targetId) return p;
        return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId), updatedAt: Date.now() };
      }),
    }));
  }, [activePlaylistId]);

  // Check if current track is in a playlist
  const isCurrentTrackInPlaylist = useCallback((playlistId?: string) => {
    const targetId = playlistId || activePlaylistId;
    if (!targetId) return false;
    const playlist = playlistsState.playlists.find((p) => p.id === targetId);
    if (!playlist) return false;

    if (musicSource === "youtube") {
      const trackInfo = youtubePlayer.currentTrack;
      if (!trackInfo) return false;
      // Match by video ID from the search queue or preset
      if (youtubeSearchQueue && youtubeSearchQueue[youtubeQueueIndex]) {
        return playlist.tracks.some((t) => t.id === youtubeSearchQueue[youtubeQueueIndex].id);
      }
      const presetVideo = VIDEO_LIST[currentTrack];
      return playlist.tracks.some((t) => t.id === presetVideo?.id);
    } else {
      const spotTrack = spotifyPlayback.currentTrack;
      if (!spotTrack) return false;
      return playlist.tracks.some((t) => t.id === spotTrack.id);
    }
  }, [activePlaylistId, playlistsState.playlists, musicSource, youtubePlayer.currentTrack, youtubeSearchQueue, youtubeQueueIndex, VIDEO_LIST, currentTrack, spotifyPlayback.currentTrack]);

  // Build current track as MusicTrack for saving
  const getCurrentMusicTrack = useCallback((): MusicTrack | null => {
    if (musicSource === "youtube") {
      let id: string, name: string, artist: string;
      if (youtubeSearchQueue && youtubeSearchQueue[youtubeQueueIndex]) {
        const q = youtubeSearchQueue[youtubeQueueIndex];
        id = q.id;
        name = q.name;
        artist = q.artist;
      } else {
        const preset = VIDEO_LIST[currentTrack];
        if (!preset) return null;
        id = preset.id;
        name = preset.name;
        artist = preset.artist;
      }
      return { id, name, artist, source: "youtube", addedAt: Date.now() };
    } else {
      const track = spotifyPlayback.currentTrack;
      if (!track) return null;
      return {
        id: track.id,
        name: track.name,
        artist: track.artist,
        thumbnail: track.albumArt,
        uri: track.uri,
        source: "spotify",
        addedAt: Date.now(),
      };
    }
  }, [musicSource, youtubeSearchQueue, youtubeQueueIndex, VIDEO_LIST, currentTrack, spotifyPlayback.currentTrack]);

  // Handle heart/save click
  const handleHeartClick = useCallback(() => {
    const track = getCurrentMusicTrack();
    if (!track) return;

    if (sourcePlaylists.length === 0) {
      // No playlists - auto-create Favorites and add
      addTrackToPlaylist(track);
      return;
    }

    if (sourcePlaylists.length === 1 && activePlaylistId) {
      // Only one playlist - toggle directly
      if (isCurrentTrackInPlaylist(activePlaylistId)) {
        removeTrackFromPlaylist(track.id, activePlaylistId);
      } else {
        addTrackToPlaylist(track, activePlaylistId);
      }
      return;
    }

    // Multiple playlists - show picker
    setShowPlaylistPicker(!showPlaylistPicker);
  }, [getCurrentMusicTrack, sourcePlaylists, activePlaylistId, addTrackToPlaylist, removeTrackFromPlaylist, isCurrentTrackInPlaylist, showPlaylistPicker]);

  // Browse: fetch YouTube suggestions
  const fetchBrowseVideos = useCallback(async (force = false) => {
    setIsBrowseLoading(true);
    try {
      const history = getSearchHistory();
      const themeParam = theme === "ghibli" ? "ghibli" : theme === "coffeeshop" ? "coffeeshop" : "default";
      const params = new URLSearchParams({ theme: themeParam });
      if (history.length > 0) {
        params.set("interests", history.slice(0, 10).join(","));
      }
      if (force) {
        params.set("_t", Date.now().toString());
      }
      const resp = await fetch(`/api/youtube/suggested?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setBrowseVideos(data.videos || []);
      }
    } catch (err) {
      console.error("Failed to fetch browse videos:", err);
    } finally {
      setIsBrowseLoading(false);
    }
  }, [theme]);

  // Browse: fetch Spotify user playlists
  const fetchSpotifyBrowse = useCallback(async () => {
    if (!spotifyAuth.isConnected) return;
    setIsSpotifyBrowseLoading(true);
    try {
      const playlists = await spotifyAPI.getUserPlaylists(20);
      setSpotifyUserPlaylists(playlists);
    } catch (err) {
      console.error("Failed to fetch Spotify playlists:", err);
    } finally {
      setIsSpotifyBrowseLoading(false);
    }
  }, [spotifyAuth.isConnected]);

  // Browse: fetch tracks from a Spotify playlist
  const fetchSpotifyPlaylistTracks = useCallback(async (playlistId: string, playlistName: string) => {
    setIsBrowseSpotifyTracksLoading(true);
    setBrowseSpotifyPlaylistName(playlistName);
    try {
      const tracks = await spotifyAPI.getPlaylistTracks(playlistId);
      setBrowseSpotifyTracks(tracks);
    } catch (err) {
      console.error("Failed to fetch Spotify playlist tracks:", err);
    } finally {
      setIsBrowseSpotifyTracksLoading(false);
    }
  }, []);

  // Dashboard: fetch YouTube suggestions on mount
  const fetchDashboardVideos = useCallback(async (force = false) => {
    setIsDashboardLoading(true);
    try {
      const history = getSearchHistory();
      const themeParam = theme === "ghibli" ? "ghibli" : theme === "coffeeshop" ? "coffeeshop" : "default";
      const params = new URLSearchParams({ theme: themeParam });
      if (history.length > 0) {
        params.set("interests", history.slice(0, 10).join(","));
      }
      // Cache-buster when explicitly refreshing to bypass browser HTTP cache
      if (force) {
        params.set("_t", Date.now().toString());
      }
      const resp = await fetch(`/api/youtube/suggested?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setDashboardVideos(data.videos || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard videos:", err);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [theme]);

  // Dashboard: fetch Spotify user playlists on mount
  const fetchDashboardSpotify = useCallback(async () => {
    if (!spotifyAuth.isConnected) return;
    setIsDashboardSpotifyLoading(true);
    try {
      const playlists = await spotifyAPI.getUserPlaylists(20);
      setDashboardSpotifyPlaylists(playlists);
    } catch (err) {
      console.error("Failed to fetch dashboard Spotify playlists:", err);
    } finally {
      setIsDashboardSpotifyLoading(false);
    }
  }, [spotifyAuth.isConnected]);

  // Auto-fetch dashboard on mount
  useEffect(() => {
    if (musicSource === "youtube") {
      fetchDashboardVideos();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch Spotify dashboard when connected
  useEffect(() => {
    if (musicSource === "spotify" && spotifyAuth.isConnected) {
      fetchDashboardSpotify();
    }
  }, [spotifyAuth.isConnected, musicSource]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch dashboard on theme change
  useEffect(() => {
    if (musicSource === "youtube" && showDashboard) {
      fetchDashboardVideos();
    }
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dashboard play handlers
  const handleDashboardPlayVideo = (video: { id: string; title: string; channel: string; thumbnail?: string }) => {
    const queue = dashboardVideos.map((v) => ({
      id: v.id,
      name: v.title,
      artist: v.channel,
    }));
    const idx = dashboardVideos.findIndex((v) => v.id === video.id);
    setYoutubeSearchQueue(queue);
    setYoutubeQueueIndex(idx >= 0 ? idx : 0);
    youtubePlayer.loadVideo(video.id, { title: video.title, artist: video.channel });
    setShowDashboard(false);
  };

  const handleDashboardPlaySpotifyPlaylist = async (playlist: SpotifyAPIPlaylist) => {
    try {
      const tracks = await spotifyAPI.getPlaylistTracks(playlist.id);
      if (tracks.length > 0) {
        const uris = tracks.map((t) => t.uri);
        await spotifyAPI.play(undefined, uris, { position: 0 });
      }
    } catch (err) {
      console.error("Failed to play Spotify playlist:", err);
    }
    setShowDashboard(false);
  };

  // Update auto-play callback when dependencies change
  useEffect(() => {
    autoPlayNextRef.current = () => {
      if (musicSource !== "youtube") return;

      if (youtubeSearchQueue && youtubeSearchQueue.length > 0) {
        // Playing from search queue
        if (isRepeatOn) {
          const video = youtubeSearchQueue[youtubeQueueIndex];
          youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
        } else {
          const nextIdx = isShuffleOn
            ? Math.floor(Math.random() * youtubeSearchQueue.length)
            : (youtubeQueueIndex + 1) % youtubeSearchQueue.length;
          setYoutubeQueueIndex(nextIdx);
          const video = youtubeSearchQueue[nextIdx];
          youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
        }
      } else {
        // Playing from preset list
        if (isRepeatOn) {
          const video = VIDEO_LIST[currentTrack];
          youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
        } else {
          const nextTrack = isShuffleOn
            ? Math.floor(Math.random() * VIDEO_LIST.length)
            : (currentTrack + 1) % VIDEO_LIST.length;
          setPlayHistory((prev) => [...prev, currentTrack]);
          setCurrentTrack(nextTrack);
          const video = VIDEO_LIST[nextTrack];
          youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
        }
      }
    };
  }, [
    musicSource,
    isRepeatOn,
    isShuffleOn,
    currentTrack,
    VIDEO_LIST,
    youtubePlayer,
    youtubeSearchQueue,
    youtubeQueueIndex,
  ]);

  // Rest of local state
  const [volume, setVolume] = useState(() => persistedMusicState?.volume ?? 70);
  const [waveformOffset, setWaveformOffset] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [spotifySearchResults, setSpotifySearchResults] = useState<SpotifyTrack[]>([]);
  const [isSpotifySearching, setIsSpotifySearching] = useState(false);
  const [spotifySearchError, setSpotifySearchError] = useState<string | null>(null);

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
        heartActive: isLightMode ? "text-green-600" : "text-emerald-400",
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
        heartActive: isLightMode ? "text-amber-600" : "text-amber-400",
      };
    }
    if (theme === "horizon") {
      return {
        primary: "from-orange-400 via-sky-400 to-violet-500",
        secondary: "from-sky-400 to-violet-500",
        accent: isLightMode ? "text-sky-700" : "text-sky-400",
        accentSecondary: isLightMode ? "text-violet-700" : "text-violet-400",
        glow: "shadow-sky-500/50",
        waveColors: ["#fb923c", "#38bdf8", "#0ea5e9", "#8b5cf6", "#6366f1"],
        gradient: isLightMode
          ? "from-orange-50/95 via-sky-50/90 to-violet-50/95"
          : "from-slate-900/95 via-blue-950/90 to-indigo-950/95",
        glowFrom: "from-sky-500/20",
        glowTo: "to-violet-500/20",
        border: isLightMode ? "border-sky-300/50" : "border-sky-500/20",
        progressBg: "#0ea5e9",
        accentBg: isLightMode ? "bg-sky-200/50" : "bg-sky-500/20",
        iconColor: isLightMode ? "text-sky-700" : "text-sky-400",
        textPrimary: isLightMode ? "text-sky-950" : "text-white",
        textSecondary: isLightMode ? "text-sky-900" : "text-white/80",
        textMuted: isLightMode ? "text-sky-800/70" : "text-white/50",
        hoverBg: isLightMode ? "hover:bg-sky-200/50" : "hover:bg-white/10",
        surfaceBg: isLightMode ? "bg-sky-100/80" : "bg-slate-900/95",
        heartActive: isLightMode ? "text-sky-600" : "text-sky-400",
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
      heartActive: isLightMode ? "text-pink-600" : "text-pink-400",
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
    } else if (youtubeSearchQueue && youtubeSearchQueue.length > 0) {
      const nextIdx = isShuffleOn
        ? Math.floor(Math.random() * youtubeSearchQueue.length)
        : (youtubeQueueIndex + 1) % youtubeSearchQueue.length;
      setYoutubeQueueIndex(nextIdx);
      const video = youtubeSearchQueue[nextIdx];
      youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
    } else {
      const nextTrack = isShuffleOn
        ? Math.floor(Math.random() * VIDEO_LIST.length)
        : (currentTrack + 1) % VIDEO_LIST.length;
      setPlayHistory((prev) => [...prev, currentTrack]);
      setCurrentTrack(nextTrack);
      const video = VIDEO_LIST[nextTrack];
      youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
    }
  };

  const handlePrev = async () => {
    if (musicSource === "spotify") {
      await spotifyPlayback.skipPrevious();
    } else if (youtubeSearchQueue && youtubeSearchQueue.length > 0) {
      const prevIdx = isShuffleOn
        ? Math.floor(Math.random() * youtubeSearchQueue.length)
        : (youtubeQueueIndex - 1 + youtubeSearchQueue.length) % youtubeSearchQueue.length;
      setYoutubeQueueIndex(prevIdx);
      const video = youtubeSearchQueue[prevIdx];
      youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
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
      youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Save search history for personalized browse
    saveSearchHistory(searchQuery.trim());

    if (musicSource === "spotify") {
      setIsSpotifySearching(true);
      setSpotifySearchError(null);
      try {
        const results = await spotifyAPI.searchTracks(searchQuery);
        setSpotifySearchResults(results);
      } catch (err) {
        setSpotifySearchError("Failed to search Spotify");
      } finally {
        setIsSpotifySearching(false);
      }
    } else {
      youtubeSearch.search(searchQuery);
    }
  };

  const handleSelectSpotifyResult = async (track: SpotifyTrack) => {
    // Pass all search results as the queue so next/prev work
    const allUris = spotifySearchResults.map((t) => t.uri);
    const trackIndex = spotifySearchResults.findIndex((t) => t.id === track.id);
    await spotifyAPI.play(
      undefined,
      allUris,
      { position: trackIndex >= 0 ? trackIndex : 0 },
    );
    // Sync shuffle/repeat state to Spotify so the queue respects current settings
    if (isShuffleOn) {
      await spotifyPlayback.setShuffle(true);
    }
    if (isRepeatOn) {
      await spotifyPlayback.setRepeat("track");
    }
    setShowSearch(false);
    setShowDashboard(false);
    setSearchQuery("");
    setSpotifySearchResults([]);
  };

  const handleSelectSearchResult = (result: YouTubeSearchResult) => {
    // Store all search results as queue so next/prev cycle through them
    const queue = youtubeSearch.results.map((r) => ({
      id: r.videoId,
      name: r.title,
      artist: r.channelTitle,
    }));
    const resultIndex = youtubeSearch.results.findIndex((r) => r.videoId === result.videoId);
    setYoutubeSearchQueue(queue);
    setYoutubeQueueIndex(resultIndex >= 0 ? resultIndex : 0);

    youtubePlayer.loadVideo(result.videoId, {
      title: result.title,
      artist: result.channelTitle,
      duration: result.duration,
    });
    setShowSearch(false);
    setShowDashboard(false);
    setSearchQuery("");
    youtubeSearch.clearResults();
  };

  const handleSourceChange = async (source: MusicSourceType) => {
    // Close search if open
    setShowSearch(false);
    setShowBrowse(false);
    setSearchQuery("");
    setSpotifySearchResults([]);
    youtubeSearch.clearResults();

    if (source === "spotify" && !spotifyAuth.isConnected) {
      sessionStorage.setItem("pending_spotify_switch", "true");
      spotifyAuth.connect();
      return;
    }
    if (musicSource === "youtube" && source === "spotify") {
      youtubePlayer.pause();
    }
    if (musicSource === "spotify" && source === "youtube") {
      await spotifyPlayback.pause();
    }
    setMusicSource(source);
    setShowSourceMenu(false);
  };

  // Auto-switch to Spotify after OAuth redirect
  useEffect(() => {
    if (spotifyAuth.isConnected && musicSource !== "spotify") {
      const pending = sessionStorage.getItem("pending_spotify_switch");
      if (pending) {
        sessionStorage.removeItem("pending_spotify_switch");
        youtubePlayer.pause();
        setMusicSource("spotify");
      }
    }
  }, [spotifyAuth.isConnected]);

  // Load initial video when player is ready (cue only, don't auto-play on startup)
  useEffect(() => {
    if (
      youtubePlayer.isReady &&
      !youtubePlayer.currentTrack &&
      musicSource === "youtube"
    ) {
      const video = VIDEO_LIST[currentTrack];
      youtubePlayer.loadVideo(
        video.id,
        {
          title: video.name,
          artist: video.artist,
        },
        false,
      );
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
      : spotifyPlayback.isLoading ||
        (spotifyAuth.isConnected && !spotifyPlayback.isSDKReady);

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

  // Play a browse video (YouTube)
  const handlePlayBrowseVideo = (video: { id: string; title: string; channel: string; thumbnail?: string }) => {
    const queue = browseVideos.map((v) => ({
      id: v.id,
      name: v.title,
      artist: v.channel,
    }));
    const idx = browseVideos.findIndex((v) => v.id === video.id);
    setYoutubeSearchQueue(queue);
    setYoutubeQueueIndex(idx >= 0 ? idx : 0);
    youtubePlayer.loadVideo(video.id, { title: video.title, artist: video.channel });
    setShowBrowse(false);
  };

  // Add browse video to active playlist
  const handleAddBrowseVideoToPlaylist = (video: { id: string; title: string; channel: string; thumbnail?: string }) => {
    const track: MusicTrack = {
      id: video.id,
      name: video.title,
      artist: video.channel,
      thumbnail: video.thumbnail,
      source: "youtube",
      addedAt: Date.now(),
    };
    addTrackToPlaylist(track);
  };

  // Play Spotify browse track
  const handlePlaySpotifyBrowseTrack = async (track: SpotifyTrack) => {
    const allUris = browseSpotifyTracks.map((t) => t.uri);
    const trackIndex = browseSpotifyTracks.findIndex((t) => t.id === track.id);
    await spotifyAPI.play(undefined, allUris, { position: trackIndex >= 0 ? trackIndex : 0 });
    setShowBrowse(false);
  };

  // Add Spotify browse track to local playlist
  const handleAddSpotifyBrowseTrackToPlaylist = (track: SpotifyTrack) => {
    const musicTrack: MusicTrack = {
      id: track.id,
      name: track.name,
      artist: track.artist,
      thumbnail: track.albumArt,
      uri: track.uri,
      source: "spotify",
      addedAt: Date.now(),
    };
    addTrackToPlaylist(musicTrack);
  };

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
          <div
            className={`absolute inset-0 ${colors.surfaceBg} backdrop-blur-xl z-40 p-4 pt-12 flex flex-col rounded-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold ${colors.textPrimary}`}>
                Search {musicSource === "spotify" ? "Spotify" : "YouTube Music"}
              </h3>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  youtubeSearch.clearResults();
                  setSpotifySearchResults([]);
                  setSpotifySearchError(null);
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
                placeholder={`Search ${musicSource === "spotify" ? "Spotify" : "YouTube"} for songs...`}
                className={`flex-1 ${colors.accentBg} border ${colors.border} rounded-lg px-3 py-2 text-sm ${colors.textPrimary} placeholder:${colors.textMuted} focus:outline-none focus:border-current`}
                autoFocus
              />
              <button
                type="submit"
                disabled={musicSource === "spotify" ? isSpotifySearching : youtubeSearch.isSearching}
                className={`px-3 py-2 bg-gradient-to-r ${colors.primary} rounded-lg text-white text-sm font-medium disabled:opacity-50`}
              >
                {(musicSource === "spotify" ? isSpotifySearching : youtubeSearch.isSearching) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
              {musicSource === "spotify" ? (
                <>
                  {spotifySearchResults.map((track, idx) => (
                    <div
                      key={`${track.id}-${idx}`}
                      className={`w-full flex items-center gap-3 p-2 ${colors.hoverBg} rounded-lg transition-colors text-left`}
                    >
                      <button
                        onClick={() => handleSelectSpotifyResult(track)}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        {track.albumArt ? (
                          <img
                            src={track.albumArt}
                            alt={track.name}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded ${colors.accentBg} flex items-center justify-center flex-shrink-0`}>
                            <Music2 className={`w-5 h-5 ${colors.textMuted}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${colors.textPrimary} truncate`}>
                            {track.name}
                          </p>
                          <p className={`text-xs ${colors.textMuted} truncate`}>
                            {track.artist} · {track.album}
                          </p>
                        </div>
                      </button>
                      <span className={`text-xs ${colors.textMuted} flex-shrink-0`}>
                        {formatTime(track.duration_ms / 1000)}
                      </span>
                      {activePlaylistId && (
                        <button
                          onClick={() => {
                            const musicTrack: MusicTrack = {
                              id: track.id,
                              name: track.name,
                              artist: track.artist,
                              thumbnail: track.albumArt,
                              uri: track.uri,
                              source: "spotify",
                              addedAt: Date.now(),
                            };
                            addTrackToPlaylist(musicTrack);
                          }}
                          className={`p-1 ${colors.hoverBg} rounded flex-shrink-0`}
                          title="Add to playlist"
                        >
                          <Plus className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                        </button>
                      )}
                    </div>
                  ))}
                  {spotifySearchError && (
                    <p className="text-center text-red-400 text-sm">
                      {spotifySearchError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {youtubeSearch.results.map((result, idx) => (
                    <div
                      key={`${result.videoId}-${idx}`}
                      className={`w-full flex items-center gap-3 p-2 ${colors.hoverBg} rounded-lg transition-colors text-left`}
                    >
                      <button
                        onClick={() => handleSelectSearchResult(result)}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <img
                          src={result.thumbnail}
                          alt={result.title}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${colors.textPrimary} truncate`}>
                            {result.title}
                          </p>
                          <p className={`text-xs ${colors.textMuted} truncate`}>
                            {result.channelTitle}
                          </p>
                        </div>
                      </button>
                      {result.duration && (
                        <span className={`text-xs ${colors.textMuted} flex-shrink-0`}>
                          {formatTime(result.duration)}
                        </span>
                      )}
                      {activePlaylistId && (
                        <button
                          onClick={() => {
                            const musicTrack: MusicTrack = {
                              id: result.videoId,
                              name: result.title,
                              artist: result.channelTitle,
                              thumbnail: result.thumbnail,
                              source: "youtube",
                              addedAt: Date.now(),
                            };
                            addTrackToPlaylist(musicTrack);
                          }}
                          className={`p-1 ${colors.hoverBg} rounded flex-shrink-0`}
                          title="Add to playlist"
                        >
                          <Plus className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                        </button>
                      )}
                    </div>
                  ))}
                  {youtubeSearch.error && (
                    <p className="text-center text-red-400 text-sm">
                      {youtubeSearch.error}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Browse Overlay */}
        {showBrowse && (
          <div
            className={`absolute inset-0 ${colors.surfaceBg} backdrop-blur-xl z-40 p-4 pt-12 flex flex-col rounded-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {browseSpotifyPlaylistName && musicSource === "spotify" && (
                  <button
                    onClick={() => {
                      setBrowseSpotifyTracks([]);
                      setBrowseSpotifyPlaylistName(null);
                    }}
                    className={`p-1 ${colors.hoverBg} rounded-lg`}
                  >
                    <ChevronDown className={`w-4 h-4 ${colors.textMuted} rotate-90`} />
                  </button>
                )}
                <h3 className={`text-sm font-bold ${colors.textPrimary}`}>
                  {musicSource === "spotify"
                    ? browseSpotifyPlaylistName || "Your Spotify Playlists"
                    : "Suggested for You"}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {musicSource === "youtube" && (
                  <button
                    onClick={() => fetchBrowseVideos(true)}
                    disabled={isBrowseLoading}
                    className={`p-1 ${colors.hoverBg} rounded-lg`}
                  >
                    <RefreshCw className={`w-4 h-4 ${colors.textMuted} ${isBrowseLoading ? "animate-spin" : ""}`} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowBrowse(false);
                    setBrowseSpotifyTracks([]);
                    setBrowseSpotifyPlaylistName(null);
                  }}
                  className={`p-1 ${colors.hoverBg} rounded-lg`}
                >
                  <X className={`w-4 h-4 ${colors.textMuted}`} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
              {musicSource === "youtube" ? (
                <>
                  {isBrowseLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className={`w-6 h-6 animate-spin ${colors.accent}`} />
                    </div>
                  ) : browseVideos.length === 0 ? (
                    <p className={`text-center text-sm ${colors.textMuted} py-8`}>
                      No suggestions available
                    </p>
                  ) : (
                    browseVideos.map((video, idx) => (
                      <div
                        key={`${video.id}-${idx}`}
                        className={`w-full flex items-center gap-3 p-2 ${colors.hoverBg} rounded-lg transition-colors`}
                      >
                        <button
                          onClick={() => handlePlayBrowseVideo(video)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded ${colors.accentBg} flex items-center justify-center flex-shrink-0`}>
                              <Music2 className={`w-5 h-5 ${colors.textMuted}`} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${colors.textPrimary} truncate`}>
                              {video.title}
                            </p>
                            <p className={`text-xs ${colors.textMuted} truncate`}>
                              {video.channel}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleAddBrowseVideoToPlaylist(video)}
                          className={`p-1.5 ${colors.hoverBg} rounded flex-shrink-0`}
                          title="Add to playlist"
                        >
                          <Plus className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                        </button>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <>
                  {/* Spotify Browse: playlist list or track list */}
                  {browseSpotifyPlaylistName ? (
                    // Showing tracks from a Spotify playlist
                    <>
                      {isBrowseSpotifyTracksLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className={`w-6 h-6 animate-spin ${colors.accent}`} />
                        </div>
                      ) : browseSpotifyTracks.length === 0 ? (
                        <p className={`text-center text-sm ${colors.textMuted} py-8`}>
                          No tracks found
                        </p>
                      ) : (
                        browseSpotifyTracks.map((track, idx) => (
                          <div
                            key={`${track.id}-${idx}`}
                            className={`w-full flex items-center gap-3 p-2 ${colors.hoverBg} rounded-lg transition-colors`}
                          >
                            <button
                              onClick={() => handlePlaySpotifyBrowseTrack(track)}
                              className="flex items-center gap-3 flex-1 min-w-0 text-left"
                            >
                              {track.albumArt ? (
                                <img
                                  src={track.albumArt}
                                  alt={track.name}
                                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className={`w-12 h-12 rounded ${colors.accentBg} flex items-center justify-center flex-shrink-0`}>
                                  <Music2 className={`w-5 h-5 ${colors.textMuted}`} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${colors.textPrimary} truncate`}>
                                  {track.name}
                                </p>
                                <p className={`text-xs ${colors.textMuted} truncate`}>
                                  {track.artist}
                                </p>
                              </div>
                            </button>
                            <span className={`text-xs ${colors.textMuted} flex-shrink-0`}>
                              {formatTime(track.duration_ms / 1000)}
                            </span>
                            <button
                              onClick={() => handleAddSpotifyBrowseTrackToPlaylist(track)}
                              className={`p-1.5 ${colors.hoverBg} rounded flex-shrink-0`}
                              title="Add to playlist"
                            >
                              <Plus className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    // Showing user's Spotify playlists
                    <>
                      {!spotifyAuth.isConnected ? (
                        <p className={`text-center text-sm ${colors.textMuted} py-8`}>
                          Connect Spotify to browse your playlists
                        </p>
                      ) : isSpotifyBrowseLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className={`w-6 h-6 animate-spin ${colors.accent}`} />
                        </div>
                      ) : spotifyUserPlaylists.length === 0 ? (
                        <p className={`text-center text-sm ${colors.textMuted} py-8`}>
                          No playlists found
                        </p>
                      ) : (
                        spotifyUserPlaylists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => fetchSpotifyPlaylistTracks(playlist.id, playlist.name)}
                            className={`w-full flex items-center gap-3 p-2 ${colors.hoverBg} rounded-lg transition-colors text-left`}
                          >
                            {playlist.images?.[0]?.url ? (
                              <img
                                src={playlist.images[0].url}
                                alt={playlist.name}
                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded ${colors.accentBg} flex items-center justify-center flex-shrink-0`}>
                                <ListMusic className={`w-5 h-5 ${colors.textMuted}`} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${colors.textPrimary} truncate`}>
                                {playlist.name}
                              </p>
                              <p className={`text-xs ${colors.textMuted}`}>
                                {playlist.tracks.total} tracks
                              </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 ${colors.textMuted} -rotate-90 flex-shrink-0`} />
                          </button>
                        ))
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`p-1.5 rounded-lg ${colors.accentBg} flex-shrink-0`}>
                    <Music2 className={`w-4 h-4 ${colors.iconColor}`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Music Player</p>
                </TooltipContent>
              </Tooltip>
              <div className="min-w-0 flex-1">
                {/* Playlist Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                    className={`flex items-center gap-1 max-w-full`}
                  >
                    <h2 className={`text-sm font-bold ${colors.textPrimary} truncate`}>
                      {activePlaylist
                        ? activePlaylist.name
                        : musicSource === "spotify"
                          ? "Spotify"
                          : theme === "lofi"
                            ? "Lofi"
                            : theme === "coffeeshop"
                              ? "Coffee Shop"
                              : "Ghibli"}{" "}
                      {!activePlaylist && (musicSource === "spotify" ? "Connect" : "Beats")}
                    </h2>
                    <ChevronDown className={`w-3 h-3 ${colors.textMuted} flex-shrink-0 transition-transform ${showPlaylistDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showPlaylistDropdown && (
                    <div
                      className={`absolute left-0 top-full mt-2 p-2 ${colors.surfaceBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl z-[9999] min-w-[200px] max-w-[260px]`}
                    >
                      <div className={`text-[10px] ${colors.textMuted} uppercase tracking-wider px-2 pb-1 mb-1 border-b ${colors.border}`}>
                        Playlists
                      </div>

                      {/* Presets option */}
                      <button
                        onClick={() => switchPlaylist(null)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${
                          !activePlaylistId
                            ? `bg-gradient-to-r ${colors.primary} text-white`
                            : `${colors.hoverBg} ${colors.textSecondary}`
                        }`}
                      >
                        <Music2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {musicSource === "spotify" ? "Spotify Connect" : "Presets"}
                        </span>
                      </button>

                      {/* Custom playlists */}
                      {sourcePlaylists.map((pl) => (
                        <div key={pl.id} className="flex items-center gap-1 mt-0.5">
                          {editingPlaylistId === pl.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (editingName.trim()) {
                                  renamePlaylist(pl.id, editingName.trim());
                                }
                                setEditingPlaylistId(null);
                              }}
                              className="flex-1 flex items-center gap-1"
                            >
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className={`flex-1 ${colors.accentBg} border ${colors.border} rounded px-2 py-1 text-xs ${colors.textPrimary} focus:outline-none`}
                                autoFocus
                              />
                              <button type="submit" className={`p-1 ${colors.hoverBg} rounded`}>
                                <Check className={`w-3 h-3 ${colors.accent}`} />
                              </button>
                            </form>
                          ) : (
                            <>
                              <button
                                onClick={() => switchPlaylist(pl.id)}
                                className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${
                                  activePlaylistId === pl.id
                                    ? `bg-gradient-to-r ${colors.primary} text-white`
                                    : `${colors.hoverBg} ${colors.textSecondary}`
                                }`}
                              >
                                <ListMusic className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-xs truncate">{pl.name}</span>
                                <span className={`text-[10px] ml-auto flex-shrink-0 ${activePlaylistId === pl.id ? "text-white/70" : colors.textMuted}`}>
                                  {pl.tracks.length}
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPlaylistId(pl.id);
                                  setEditingName(pl.name);
                                }}
                                className={`p-1 ${colors.hoverBg} rounded flex-shrink-0`}
                              >
                                <Pencil className={`w-3 h-3 ${colors.textMuted}`} />
                              </button>
                              <button
                                onClick={() => deletePlaylist(pl.id)}
                                className="p-1 hover:bg-red-500/10 rounded flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}

                      {/* Create new playlist */}
                      {isCreatingPlaylist ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (newPlaylistName.trim()) {
                              createPlaylist(newPlaylistName.trim(), musicSource);
                              setNewPlaylistName("");
                              setIsCreatingPlaylist(false);
                            }
                          }}
                          className="flex items-center gap-1 mt-1 pt-1 border-t border-dashed"
                          style={{ borderColor: "currentColor" }}
                        >
                          <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Playlist name..."
                            className={`flex-1 ${colors.accentBg} border ${colors.border} rounded px-2 py-1 text-xs ${colors.textPrimary} placeholder:${colors.textMuted} focus:outline-none`}
                            autoFocus
                          />
                          <button type="submit" className={`p-1 ${colors.hoverBg} rounded`}>
                            <Check className={`w-3 h-3 ${colors.accent}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsCreatingPlaylist(false); setNewPlaylistName(""); }}
                            className={`p-1 ${colors.hoverBg} rounded`}
                          >
                            <X className={`w-3 h-3 ${colors.textMuted}`} />
                          </button>
                        </form>
                      ) : (
                        playlistsState.playlists.length < 10 && (
                          <button
                            onClick={() => setIsCreatingPlaylist(true)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mt-1 pt-1 border-t border-dashed ${colors.hoverBg} ${colors.textMuted}`}
                            style={{ borderColor: "currentColor" }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-xs">New Playlist</span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <p className={`text-[10px] ${colors.textMuted}`}>
                  {musicSource === "spotify" &&
                  spotifyAuth.isConnected &&
                  !spotifyPlayback.isSDKReady ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Connecting to Spotify...
                    </span>
                  ) : effectiveIsLoading ? (
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
                  ) : activePlaylist ? (
                    <>{activePlaylist.tracks.length} tracks · {effectiveIsPlaying ? "Playing" : "Paused"}</>
                  ) : (
                    <>{effectiveIsPlaying ? "Now Playing" : "Paused"}</>
                  )}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Dashboard Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (showDashboard) {
                        setShowDashboard(false);
                      } else {
                        setShowDashboard(true);
                        if (musicSource === "youtube" && dashboardVideos.length === 0) {
                          fetchDashboardVideos();
                        } else if (musicSource === "spotify" && dashboardSpotifyPlaylists.length === 0) {
                          fetchDashboardSpotify();
                        }
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      showDashboard
                        ? `${colors.accentBg} ${colors.accent}`
                        : `${colors.hoverBg} ${colors.accent}`
                    }`}
                    aria-label={showDashboard ? "Back to player" : "Dashboard"}
                  >
                    {showDashboard ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <LayoutGrid className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showDashboard ? "Back to player" : "Dashboard"}</p>
                </TooltipContent>
              </Tooltip>

              {/* Browse */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setShowBrowse(true);
                      if (musicSource === "youtube") {
                        fetchBrowseVideos();
                      } else {
                        fetchSpotifyBrowse();
                      }
                    }}
                    className={`p-2 rounded-lg ${colors.hoverBg} transition-colors ${colors.accent}`}
                    aria-label="Browse"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Browse</p>
                </TooltipContent>
              </Tooltip>

              {/* Search */}
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
                  <p>Search {musicSource === "spotify" ? "Spotify" : "YouTube"}</p>
                </TooltipContent>
              </Tooltip>

              {/* Source Toggle */}
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowSourceMenu(!showSourceMenu)}
                      className={`p-2 rounded-lg ${colors.hoverBg} transition-colors ${
                        musicSource === "spotify"
                          ? "text-green-500"
                          : colors.accent
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
                  <div
                    className={`absolute right-0 top-full mt-2 p-2 ${colors.surfaceBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl z-[9999] min-w-[180px]`}
                  >
                    <div
                      className={`text-[10px] ${colors.textMuted} uppercase tracking-wider px-2 pb-1 mb-1 border-b ${colors.border}`}
                    >
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
                        onClick={async () => {
                          await spotifyPlayback.pause();
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
                    <div
                      className={`p-3 ${colors.surfaceBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl min-w-[140px]`}
                    >
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
                        className={`w-full h-1.5 ${isLightMode ? "bg-black/10" : "bg-white/20"} rounded-full appearance-none cursor-pointer`}
                        style={{
                          background: `linear-gradient(to right, ${colors.progressBg} ${volume}%, ${isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)"} ${volume}%)`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TooltipProvider>

        {/* Dashboard / Player Body */}
        {showDashboard ? (
          /* Dashboard Grid */
          <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-semibold ${colors.textMuted} uppercase tracking-wider`}>
                {musicSource === "spotify" ? "Your Playlists" : "Suggested for You"}
              </h3>
              <button
                onClick={() => {
                  if (musicSource === "youtube") {
                    fetchDashboardVideos(true);
                  } else {
                    fetchDashboardSpotify();
                  }
                }}
                disabled={isDashboardLoading || isDashboardSpotifyLoading}
                className={`p-1 ${colors.hoverBg} rounded-lg`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${colors.textMuted} ${(isDashboardLoading || isDashboardSpotifyLoading) ? "animate-spin" : ""}`} />
              </button>
            </div>

            {musicSource === "youtube" ? (
              isDashboardLoading && dashboardVideos.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={`w-6 h-6 animate-spin ${colors.accent}`} />
                </div>
              ) : dashboardVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Music2 className={`w-8 h-8 ${colors.textMuted}`} />
                  <p className={`text-sm ${colors.textMuted}`}>No suggestions yet</p>
                  <button
                    onClick={() => fetchDashboardVideos(true)}
                    className={`text-xs px-3 py-1.5 bg-gradient-to-r ${colors.primary} text-white rounded-lg`}
                  >
                    Load Suggestions
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {dashboardVideos.map((video, idx) => (
                    <button
                      key={`dash-${video.id}-${idx}`}
                      onClick={() => handleDashboardPlayVideo(video)}
                      className={`flex flex-col ${colors.accentBg} ${colors.hoverBg} rounded-xl overflow-hidden transition-all hover:scale-[1.02] text-left`}
                    >
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className={`w-full aspect-video ${colors.accentBg} flex items-center justify-center`}>
                          <Music2 className={`w-6 h-6 ${colors.textMuted}`} />
                        </div>
                      )}
                      <div className="p-2 flex-1 min-w-0">
                        <p className={`text-xs font-medium ${colors.textPrimary} line-clamp-2 leading-tight`}>
                          {video.title}
                        </p>
                        <p className={`text-[10px] ${colors.textMuted} truncate mt-0.5`}>
                          {video.channel}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              /* Spotify Dashboard */
              !spotifyAuth.isConnected ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <SpotifyIcon className={`w-8 h-8 ${colors.textMuted}`} />
                  <p className={`text-sm ${colors.textMuted}`}>Connect Spotify to browse</p>
                  <button
                    onClick={() => handleSourceChange("spotify")}
                    className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg"
                  >
                    Connect
                  </button>
                </div>
              ) : isDashboardSpotifyLoading && dashboardSpotifyPlaylists.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={`w-6 h-6 animate-spin ${colors.accent}`} />
                </div>
              ) : dashboardSpotifyPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <ListMusic className={`w-8 h-8 ${colors.textMuted}`} />
                  <p className={`text-sm ${colors.textMuted}`}>No playlists found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {dashboardSpotifyPlaylists.map((playlist, idx) => (
                    <button
                      key={`dash-sp-${playlist.id}-${idx}`}
                      onClick={() => handleDashboardPlaySpotifyPlaylist(playlist)}
                      className={`flex flex-col ${colors.accentBg} ${colors.hoverBg} rounded-xl overflow-hidden transition-all hover:scale-[1.02] text-left`}
                    >
                      {playlist.images?.[0]?.url ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className={`w-full aspect-square ${colors.accentBg} flex items-center justify-center`}>
                          <ListMusic className={`w-6 h-6 ${colors.textMuted}`} />
                        </div>
                      )}
                      <div className="p-2 flex-1 min-w-0">
                        <p className={`text-xs font-medium ${colors.textPrimary} line-clamp-2 leading-tight`}>
                          {playlist.name}
                        </p>
                        <p className={`text-[10px] ${colors.textMuted} mt-0.5`}>
                          {playlist.tracks.total} tracks
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}

            {/* Presets quick-play section */}
            {musicSource === "youtube" && (
              <div className="mt-4">
                <h4 className={`text-[10px] font-semibold ${colors.textMuted} uppercase tracking-wider mb-2`}>
                  Presets
                </h4>
                <div className="space-y-1">
                  {VIDEO_LIST.map((video, idx) => (
                    <button
                      key={`preset-${video.id}`}
                      onClick={() => {
                        setYoutubeSearchQueue(null);
                        setCurrentTrack(idx);
                        youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
                        setShowDashboard(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2 ${colors.hoverBg} rounded-lg transition-colors text-left`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.primary} flex items-center justify-center flex-shrink-0`}>
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${colors.textPrimary} truncate`}>{video.name}</p>
                        <p className={`text-[10px] ${colors.textMuted} truncate`}>{video.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Normal Player Body */
          <>
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
                  className={`absolute inset-2 rounded-full ${isLightMode ? "bg-white/80" : "bg-gradient-to-br from-slate-800 to-slate-900"} border-2 ${colors.border} flex items-center justify-center overflow-hidden ${
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

            {/* Track Info + Heart */}
            <div className="text-center mb-2 flex-shrink-0 px-2 relative">
              <div className="flex items-center justify-center gap-2">
                <h3
                  className={`text-base sm:text-lg font-bold ${colors.textPrimary} truncate`}
                >
                  {musicSource === "spotify"
                    ? spotifyPlayback.currentTrack?.name ||
                      (spotifyPlayback.isSDKReady ? "Ready to Play" : "Connecting...")
                    : (currentTrackInfo && (currentTrackInfo as any)?.title) ||
                      VIDEO_LIST[currentTrack]?.name ||
                      "Loading..."}
                </h3>
                {/* Heart/Save Icon */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={handleHeartClick}
                    className={`p-1 rounded transition-colors ${
                      isCurrentTrackInPlaylist()
                        ? colors.heartActive
                        : `${colors.textMuted} ${colors.hoverBg}`
                    }`}
                    title={isCurrentTrackInPlaylist() ? "In playlist" : "Save to playlist"}
                  >
                    <Heart
                      className={`w-4 h-4 ${isCurrentTrackInPlaylist() ? "fill-current" : ""}`}
                    />
                  </button>

                  {/* Playlist Picker Popup */}
                  {showPlaylistPicker && (
                    <div
                      className={`absolute right-0 top-full mt-1 p-2 ${colors.surfaceBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl z-[9999] min-w-[160px]`}
                    >
                      <div className={`text-[10px] ${colors.textMuted} uppercase tracking-wider px-2 pb-1 mb-1 border-b ${colors.border}`}>
                        Save to...
                      </div>
                      {sourcePlaylists.map((pl) => {
                        const inPl = isCurrentTrackInPlaylist(pl.id);
                        return (
                          <button
                            key={pl.id}
                            onClick={() => {
                              const track = getCurrentMusicTrack();
                              if (!track) return;
                              if (inPl) {
                                removeTrackFromPlaylist(track.id, pl.id);
                              } else {
                                addTrackToPlaylist(track, pl.id);
                              }
                              setShowPlaylistPicker(false);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${colors.hoverBg}`}
                          >
                            <Heart
                              className={`w-3 h-3 flex-shrink-0 ${inPl ? `fill-current ${colors.heartActive}` : colors.textMuted}`}
                            />
                            <span className={`text-xs truncate ${colors.textSecondary}`}>
                              {pl.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <p className={`text-xs sm:text-sm ${colors.accent} truncate`}>
                {musicSource === "spotify"
                  ? spotifyPlayback.currentTrack?.artist ||
                    (spotifyPlayback.isSDKReady ? "Spotify" : "")
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
              className={`w-full h-1 ${isLightMode ? "bg-black/10" : "bg-white/20"} rounded-full appearance-none cursor-pointer`}
              style={{
                background: `linear-gradient(to right, ${colors.progressBg} ${
                  (currentProgress / totalDuration) * 100
                }%, ${isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)"} ${(currentProgress / totalDuration) * 100}%)`,
              }}
            />
            <div
              className={`flex justify-between mt-1 text-[10px] ${colors.textMuted}`}
            >
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
                  onClick={async () => {
                    const newState = !isShuffleOn;
                    setIsShuffleOn(newState);
                    setPlayHistory([]);
                    if (musicSource === "spotify") {
                      await spotifyPlayback.setShuffle(newState);
                    }
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isShuffleOn
                      ? `bg-gradient-to-br ${colors.primary} text-white shadow-lg ${colors.glow}`
                      : `${colors.hoverBg} ${colors.textMuted} ${isLightMode ? "hover:text-gray-900" : "hover:text-white"}`
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
                  className={`p-2 ${colors.hoverBg} rounded-lg transition-colors ${colors.textSecondary} ${isLightMode ? "hover:text-gray-900" : "hover:text-white"} disabled:opacity-50`}
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
                    (musicSource === "spotify" &&
                      !spotifyPlayback.hasActiveDevice)
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
                  className={`p-2 ${colors.hoverBg} rounded-lg transition-colors ${colors.textSecondary} ${isLightMode ? "hover:text-gray-900" : "hover:text-white"} disabled:opacity-50`}
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
                  onClick={async () => {
                    const newState = !isRepeatOn;
                    setIsRepeatOn(newState);
                    if (musicSource === "spotify") {
                      await spotifyPlayback.setRepeat(newState ? "track" : "off");
                    }
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isRepeatOn
                      ? `bg-gradient-to-br ${colors.primary} text-white shadow-lg ${colors.glow}`
                      : `${colors.hoverBg} ${colors.textMuted} ${isLightMode ? "hover:text-gray-900" : "hover:text-white"}`
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
            activePlaylist && activePlaylist.tracks.length > 0 ? (
              // Custom playlist dots
              activePlaylist.tracks.slice(0, 10).map((_, idx) => (
                <button
                  key={idx}
                  disabled={effectiveIsLoading}
                  onClick={() => {
                    const queue = activePlaylist.tracks.map((t) => ({
                      id: t.id,
                      name: t.name,
                      artist: t.artist,
                    }));
                    setYoutubeSearchQueue(queue);
                    setYoutubeQueueIndex(idx);
                    const video = queue[idx];
                    youtubePlayer.loadVideo(video.id, { title: video.name, artist: video.artist });
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all disabled:cursor-not-allowed ${
                    youtubeQueueIndex === idx && youtubeSearchQueue
                      ? `bg-gradient-to-r ${colors.primary} w-4`
                      : `${isLightMode ? "bg-black/20 hover:bg-black/40" : "bg-white/20 hover:bg-white/40"}`
                  }`}
                />
              ))
            ) : (
              // Preset dots
              VIDEO_LIST.map((_, idx) => (
                <button
                  key={idx}
                  disabled={effectiveIsLoading}
                  onClick={() => {
                    setYoutubeSearchQueue(null); // Clear search queue, back to preset list
                    setCurrentTrack(idx);
                    const video = VIDEO_LIST[idx];
                    youtubePlayer.loadVideo(video.id, {
                      title: video.name,
                      artist: video.artist,
                    });
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all disabled:cursor-not-allowed ${
                    currentTrack === idx && !youtubeSearchQueue
                      ? `bg-gradient-to-r ${colors.primary} w-4`
                      : `${isLightMode ? "bg-black/20 hover:bg-black/40" : "bg-white/20 hover:bg-white/40"}`
                  }`}
                />
              ))
            )
          ) : (
            <div
              className={`flex items-center gap-2 text-[10px] ${colors.textMuted}`}
            >
              <Smartphone className="w-3 h-3" />
              <span>
                {spotifyPlayback.hasActiveDevice
                  ? `Playing on ${spotifyPlayback.activeDevice?.name}`
                  : "Open Spotify on a device"}
              </span>
            </div>
          )}
        </div>
          </>
        )}

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

      {/* Click-away overlays */}
      {showSourceMenu && (
        <div
          className="fixed inset-0 -z-1"
          onClick={() => setShowSourceMenu(false)}
        />
      )}
      {showPlaylistDropdown && (
        <div
          className="fixed inset-0 -z-1"
          onClick={() => { setShowPlaylistDropdown(false); setIsCreatingPlaylist(false); setEditingPlaylistId(null); }}
        />
      )}
      {showPlaylistPicker && (
        <div
          className="fixed inset-0 -z-1"
          onClick={() => setShowPlaylistPicker(false)}
        />
      )}
    </div>
  );
}
