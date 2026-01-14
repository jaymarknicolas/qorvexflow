"use client";

import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

export type MusicSource = "lofi" | "spotify" | "none";

interface LofiStream {
  id: string;
  title: string;
  videoId: string;
  thumbnail: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  uri: string;
}

interface MusicState {
  activeSource: MusicSource;
  isPlaying: boolean;
  volume: number;
  isShuffle: boolean;

  // Lofi state
  currentLofiStream: LofiStream | null;
  lofiStreams: LofiStream[];

  // Spotify state
  currentSpotifyTrack: SpotifyTrack | null;
  isSpotifyConnected: boolean;
  spotifyAccessToken: string | null;
}

interface UseMusicReturn extends MusicState {
  // Playback controls
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;

  // Source selection
  setActiveSource: (source: MusicSource) => void;

  // Lofi controls
  shuffleLofiStream: () => void;
  selectLofiStream: (stream: LofiStream) => void;

  // Spotify controls
  connectSpotify: () => void;
  disconnectSpotify: () => void;
  setSpotifyAccessToken: (token: string) => void;
  playSpotifyTrack: (trackUri: string) => void;
  skipSpotifyNext: () => void;
  skipSpotifyPrevious: () => void;
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

export function useMusic(): UseMusicReturn {
  const [state, setState] = useState<MusicState>({
    activeSource: "none",
    isPlaying: false,
    volume: 50,
    isShuffle: false,
    currentLofiStream: null,
    lofiStreams: DEFAULT_LOFI_STREAMS,
    currentSpotifyTrack: null,
    isSpotifyConnected: false,
    spotifyAccessToken: null,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedState = localStorage.getItem(STORAGE_KEYS.MUSIC_PLAYER);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState((prev) => ({
          ...prev,
          volume: parsed.volume ?? 50,
          isShuffle: parsed.isShuffle ?? false,
          currentLofiStream: parsed.currentLofiStream || DEFAULT_LOFI_STREAMS[0],
          lofiStreams: parsed.lofiStreams || DEFAULT_LOFI_STREAMS,
        }));
      } catch (error) {
        console.error("Failed to load music state:", error);
      }
    } else {
      // Set default lofi stream
      setState((prev) => ({
        ...prev,
        currentLofiStream: DEFAULT_LOFI_STREAMS[0],
      }));
    }

    // Check for Spotify token in localStorage
    const spotifyToken = localStorage.getItem("spotify_access_token");
    if (spotifyToken) {
      setState((prev) => ({
        ...prev,
        spotifyAccessToken: spotifyToken,
        isSpotifyConnected: true,
      }));
    }
  }, []);

  // Save state to localStorage
  const saveState = useCallback((updatedState: Partial<MusicState>) => {
    if (typeof window === "undefined") return;

    const toSave = {
      volume: updatedState.volume,
      isShuffle: updatedState.isShuffle,
      currentLofiStream: updatedState.currentLofiStream,
      lofiStreams: updatedState.lofiStreams,
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.MUSIC_PLAYER, JSON.stringify(toSave));
  }, []);

  // Playback controls
  const play = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const setVolume = useCallback(
    (volume: number) => {
      setState((prev) => {
        const newState = { ...prev, volume };
        saveState(newState);
        return newState;
      });
    },
    [saveState]
  );

  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const newState = { ...prev, isShuffle: !prev.isShuffle };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Source selection
  const setActiveSource = useCallback((source: MusicSource) => {
    setState((prev) => ({
      ...prev,
      activeSource: source,
      isPlaying: source !== "none",
    }));
  }, []);

  // Lofi controls
  const shuffleLofiStream = useCallback(() => {
    setState((prev) => {
      const availableStreams = prev.lofiStreams.filter(
        (s) => s.id !== prev.currentLofiStream?.id
      );
      const randomStream =
        availableStreams[Math.floor(Math.random() * availableStreams.length)];
      const newState = { ...prev, currentLofiStream: randomStream };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const selectLofiStream = useCallback(
    (stream: LofiStream) => {
      setState((prev) => {
        const newState = { ...prev, currentLofiStream: stream };
        saveState(newState);
        return newState;
      });
    },
    [saveState]
  );

  // Spotify controls
  const connectSpotify = useCallback(() => {
    // Redirect to Spotify OAuth
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    const scopes = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "playlist-read-private",
      "playlist-read-collaborative",
    ];

    if (!clientId || !redirectUri) {
      console.error("Spotify credentials not configured");
      return;
    }

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes.join(" "))}`;

    window.location.href = authUrl;
  }, []);

  const disconnectSpotify = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_token_expiry");
    }
    setState((prev) => ({
      ...prev,
      isSpotifyConnected: false,
      spotifyAccessToken: null,
      currentSpotifyTrack: null,
      activeSource: prev.activeSource === "spotify" ? "none" : prev.activeSource,
    }));
  }, []);

  const setSpotifyAccessToken = useCallback((token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("spotify_access_token", token);
      localStorage.setItem(
        "spotify_token_expiry",
        (Date.now() + 3600000).toString()
      );
    }
    setState((prev) => ({
      ...prev,
      spotifyAccessToken: token,
      isSpotifyConnected: true,
    }));
  }, []);

  const playSpotifyTrack = useCallback(
    async (trackUri: string) => {
      if (!state.spotifyAccessToken) return;

      try {
        const response = await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${state.spotifyAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [trackUri] }),
        });

        if (response.ok) {
          setState((prev) => ({ ...prev, activeSource: "spotify", isPlaying: true }));
        }
      } catch (error) {
        console.error("Failed to play Spotify track:", error);
      }
    },
    [state.spotifyAccessToken]
  );

  const skipSpotifyNext = useCallback(async () => {
    if (!state.spotifyAccessToken) return;

    try {
      await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.spotifyAccessToken}`,
        },
      });
    } catch (error) {
      console.error("Failed to skip to next track:", error);
    }
  }, [state.spotifyAccessToken]);

  const skipSpotifyPrevious = useCallback(async () => {
    if (!state.spotifyAccessToken) return;

    try {
      await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.spotifyAccessToken}`,
        },
      });
    } catch (error) {
      console.error("Failed to skip to previous track:", error);
    }
  }, [state.spotifyAccessToken]);

  return {
    ...state,
    play,
    pause,
    setVolume,
    toggleShuffle,
    setActiveSource,
    shuffleLofiStream,
    selectLofiStream,
    connectSpotify,
    disconnectSpotify,
    setSpotifyAccessToken,
    playSpotifyTrack,
    skipSpotifyNext,
    skipSpotifyPrevious,
  };
}
