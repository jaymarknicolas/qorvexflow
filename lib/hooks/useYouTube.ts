"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import YouTubePlayer from "youtube-player";
import type { YouTubePlayer as YouTubePlayerType } from "youtube-player/dist/types";
import { youtubeAPI } from "@/lib/services/youtube-api";
import type {
  YouTubeVideo,
  YouTubePlaylist,
  YouTubePlayerState,
} from "@/types/youtube";
import { STORAGE_KEYS } from "@/lib/constants";

interface UseYouTubeReturn {
  // Player state
  playerState: YouTubePlayerState;
  currentVideo: YouTubeVideo | null;
  currentTime: number;
  duration: number;
  volume: number;

  // Search
  searchResults: YouTubeVideo[];
  isSearching: boolean;
  searchError: string | null;
  searchVideos: (query: string) => Promise<void>;

  // Playback controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  loadVideo: (video: YouTubeVideo) => void;

  // Playlist management
  playlists: YouTubePlaylist[];
  currentPlaylist: YouTubePlaylist | null;
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, video: YouTubeVideo) => void;
  removeFromPlaylist: (playlistId: string, videoId: string) => void;
  loadPlaylist: (playlistId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  isShuffleEnabled: boolean;
  isLoopEnabled: boolean;

  // Player ref
  playerRef: React.RefObject<HTMLDivElement | null>;
}

export function useYouTube(): UseYouTubeReturn {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YouTubePlayerType | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [playerState, setPlayerState] = useState<YouTubePlayerState>("unstarted");
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50);

  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<YouTubePlaylist | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);

  // Load playlists from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPlaylists = localStorage.getItem(STORAGE_KEYS.YOUTUBE);
    if (savedPlaylists) {
      try {
        const parsed = JSON.parse(savedPlaylists);
        setPlaylists(parsed.playlists || []);
        setIsShuffleEnabled(parsed.isShuffleEnabled || false);
        setIsLoopEnabled(parsed.isLoopEnabled || false);
      } catch (error) {
        console.error("Failed to load YouTube playlists:", error);
      }
    }
  }, []);

  // Save playlists to localStorage
  const savePlaylists = useCallback(
    (updatedPlaylists: YouTubePlaylist[]) => {
      if (typeof window === "undefined") return;

      const data = {
        playlists: updatedPlaylists,
        isShuffleEnabled,
        isLoopEnabled,
        updatedAt: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.YOUTUBE, JSON.stringify(data));
      setPlaylists(updatedPlaylists);
    },
    [isShuffleEnabled, isLoopEnabled]
  );

  // Initialize YouTube player
  useEffect(() => {
    if (!playerRef.current || playerInstanceRef.current) return;

    const player = YouTubePlayer(playerRef.current, {
      width: 640,
      height: 360,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
    });

    playerInstanceRef.current = player;

    // Listen to state changes
    player.on("stateChange", (event) => {
      const stateMap: Record<number, YouTubePlayerState> = {
        [-1]: "unstarted",
        [0]: "ended",
        [1]: "playing",
        [2]: "paused",
        [3]: "buffering",
        [5]: "cued",
      };
      setPlayerState(stateMap[event.data] || "unstarted");

      // Auto-play next video when current ends
      if (event.data === 0 && currentPlaylist) {
        playNext();
      }
    });

    // Update current time
    const updateTime = async () => {
      if (playerInstanceRef.current) {
        try {
          const time = await playerInstanceRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          // Ignore errors
        }
      }
    };

    intervalRef.current = setInterval(updateTime, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, []);

  // Search videos
  const searchVideos = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const result = await youtubeAPI.searchVideos(query, 5);

    if (result.error) {
      setSearchError(result.error.message);
      setSearchResults([]);
    } else {
      setSearchResults(result.videos);
    }

    setIsSearching(false);
  }, []);

  // Load video
  const loadVideo = useCallback(async (video: YouTubeVideo) => {
    if (!playerInstanceRef.current) return;

    setCurrentVideo(video);

    await playerInstanceRef.current.loadVideoById(video.id);
    const dur = await playerInstanceRef.current.getDuration();
    setDuration(dur);
  }, []);

  // Playback controls
  const play = useCallback(async () => {
    if (playerInstanceRef.current) {
      await playerInstanceRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(async () => {
    if (playerInstanceRef.current) {
      await playerInstanceRef.current.pauseVideo();
    }
  }, []);

  const stop = useCallback(async () => {
    if (playerInstanceRef.current) {
      await playerInstanceRef.current.stopVideo();
      setCurrentTime(0);
    }
  }, []);

  const seek = useCallback(async (seconds: number) => {
    if (playerInstanceRef.current) {
      await playerInstanceRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback(async (vol: number) => {
    if (playerInstanceRef.current) {
      await playerInstanceRef.current.setVolume(vol);
      setVolumeState(vol);
    }
  }, []);

  // Playlist management
  const createPlaylist = useCallback(
    (name: string) => {
      const newPlaylist: YouTubePlaylist = {
        id: crypto.randomUUID(),
        name,
        videos: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      savePlaylists([...playlists, newPlaylist]);
    },
    [playlists, savePlaylists]
  );

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      const updated = playlists.filter((p) => p.id !== playlistId);
      savePlaylists(updated);

      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
      }
    },
    [playlists, currentPlaylist, savePlaylists]
  );

  const addToPlaylist = useCallback(
    (playlistId: string, video: YouTubeVideo) => {
      const updated = playlists.map((p) => {
        if (p.id === playlistId) {
          // Check if video already exists
          if (p.videos.some((v) => v.id === video.id)) {
            return p;
          }
          return {
            ...p,
            videos: [...p.videos, video],
            updatedAt: Date.now(),
          };
        }
        return p;
      });
      savePlaylists(updated);
    },
    [playlists, savePlaylists]
  );

  const removeFromPlaylist = useCallback(
    (playlistId: string, videoId: string) => {
      const updated = playlists.map((p) => {
        if (p.id === playlistId) {
          return {
            ...p,
            videos: p.videos.filter((v) => v.id !== videoId),
            updatedAt: Date.now(),
          };
        }
        return p;
      });
      savePlaylists(updated);
    },
    [playlists, savePlaylists]
  );

  const loadPlaylist = useCallback(
    (playlistId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist && playlist.videos.length > 0) {
        setCurrentPlaylist(playlist);
        setCurrentVideoIndex(0);
        loadVideo(playlist.videos[0]);
      }
    },
    [playlists, loadVideo]
  );

  const playNext = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.videos.length === 0) return;

    let nextIndex = currentVideoIndex + 1;

    if (nextIndex >= currentPlaylist.videos.length) {
      if (isLoopEnabled) {
        nextIndex = 0;
      } else {
        return; // End of playlist
      }
    }

    setCurrentVideoIndex(nextIndex);
    loadVideo(currentPlaylist.videos[nextIndex]);
  }, [currentPlaylist, currentVideoIndex, isLoopEnabled, loadVideo]);

  const playPrevious = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.videos.length === 0) return;

    let prevIndex = currentVideoIndex - 1;

    if (prevIndex < 0) {
      prevIndex = currentPlaylist.videos.length - 1;
    }

    setCurrentVideoIndex(prevIndex);
    loadVideo(currentPlaylist.videos[prevIndex]);
  }, [currentPlaylist, currentVideoIndex, loadVideo]);

  const toggleShuffle = useCallback(() => {
    setIsShuffleEnabled((prev) => !prev);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLoopEnabled((prev) => !prev);
  }, []);

  return {
    playerState,
    currentVideo,
    currentTime,
    duration,
    volume,
    searchResults,
    isSearching,
    searchError,
    searchVideos,
    play,
    pause,
    stop,
    seek,
    setVolume,
    loadVideo,
    playlists,
    currentPlaylist,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    loadPlaylist,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleLoop,
    isShuffleEnabled,
    isLoopEnabled,
    playerRef,
  };
}
