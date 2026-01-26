"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { spotifyAPI, SpotifyPlaybackState } from "@/lib/services/spotify-api";

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number;
}

export interface SpotifyTrackInfo {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration_ms: number;
  uri: string;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTrack: SpotifyTrackInfo | null;
  progress_ms: number;
  devices: SpotifyDevice[];
  activeDevice: SpotifyDevice | null;
  hasActiveDevice: boolean;
}

interface UseSpotifyPlaybackReturn extends PlaybackState {
  play: () => Promise<boolean>;
  pause: () => Promise<boolean>;
  skipNext: () => Promise<boolean>;
  skipPrevious: () => Promise<boolean>;
  setVolume: (percent: number) => Promise<boolean>;
  seek: (ms: number) => Promise<boolean>;
  refreshPlayback: () => Promise<void>;
  transferPlayback: (deviceId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_STATE: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  progress_ms: 0,
  devices: [],
  activeDevice: null,
  hasActiveDevice: false,
};

export function useSpotifyPlayback(
  accessToken: string | null,
  isActive: boolean = true
): UseSpotifyPlaybackReturn {
  const [state, setState] = useState<PlaybackState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollRef = useRef<number>(0);

  // Update spotifyAPI token when it changes
  useEffect(() => {
    if (accessToken) {
      spotifyAPI.setAccessToken(accessToken);
    }
  }, [accessToken]);

  // Fetch current playback state
  const refreshPlayback = useCallback(async () => {
    if (!accessToken) return;

    // Debounce: don't poll more than once per second
    const now = Date.now();
    if (now - lastPollRef.current < 1000) return;
    lastPollRef.current = now;

    try {
      const [playbackState, devices] = await Promise.all([
        spotifyAPI.getCurrentPlayback(),
        spotifyAPI.getDevices(),
      ]);

      const activeDevice =
        devices.find((d: SpotifyDevice) => d.is_active) || null;

      setState({
        isPlaying: playbackState?.is_playing ?? false,
        currentTrack: playbackState?.item
          ? {
              id: playbackState.item.id,
              name: playbackState.item.name,
              artist: playbackState.item.artist,
              album: playbackState.item.album,
              albumArt: playbackState.item.albumArt,
              duration_ms: playbackState.item.duration_ms,
              uri: playbackState.item.uri,
            }
          : null,
        progress_ms: playbackState?.progress_ms ?? 0,
        devices: devices as SpotifyDevice[],
        activeDevice,
        hasActiveDevice: Boolean(activeDevice),
      });

      setError(null);
    } catch (err) {
      console.error("Failed to fetch playback state:", err);
      setError("Failed to fetch playback state");
    }
  }, [accessToken]);

  // Poll for playback state when active
  useEffect(() => {
    if (!accessToken || !isActive) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    refreshPlayback();

    // Poll every 2 seconds when playing, every 5 seconds when paused
    const startPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      const interval = state.isPlaying ? 2000 : 5000;
      pollIntervalRef.current = setInterval(refreshPlayback, interval);
    };

    startPolling();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [accessToken, isActive, state.isPlaying, refreshPlayback]);

  // Control functions
  const play = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false;

    setIsLoading(true);
    try {
      const success = await spotifyAPI.play();
      if (success) {
        setState((prev) => ({ ...prev, isPlaying: true }));
        setTimeout(refreshPlayback, 300);
      }
      return success;
    } catch (err) {
      setError("Failed to play");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, refreshPlayback]);

  const pause = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false;

    setIsLoading(true);
    try {
      const success = await spotifyAPI.pause();
      if (success) {
        setState((prev) => ({ ...prev, isPlaying: false }));
      }
      return success;
    } catch (err) {
      setError("Failed to pause");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const skipNext = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false;

    setIsLoading(true);
    try {
      const success = await spotifyAPI.skipToNext();
      if (success) {
        setTimeout(refreshPlayback, 300);
      }
      return success;
    } catch (err) {
      setError("Failed to skip to next");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, refreshPlayback]);

  const skipPrevious = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false;

    setIsLoading(true);
    try {
      const success = await spotifyAPI.skipToPrevious();
      if (success) {
        setTimeout(refreshPlayback, 300);
      }
      return success;
    } catch (err) {
      setError("Failed to skip to previous");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, refreshPlayback]);

  const setVolume = useCallback(
    async (percent: number): Promise<boolean> => {
      if (!accessToken) return false;

      try {
        return await spotifyAPI.setVolume(Math.round(percent));
      } catch (err) {
        setError("Failed to set volume");
        return false;
      }
    },
    [accessToken]
  );

  const seek = useCallback(
    async (ms: number): Promise<boolean> => {
      if (!accessToken) return false;

      try {
        const success = await spotifyAPI.seek(ms);
        if (success) {
          setState((prev) => ({ ...prev, progress_ms: ms }));
        }
        return success;
      } catch (err) {
        setError("Failed to seek");
        return false;
      }
    },
    [accessToken]
  );

  const transferPlayback = useCallback(
    async (deviceId: string): Promise<boolean> => {
      if (!accessToken) return false;

      setIsLoading(true);
      try {
        const response = await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: state.isPlaying,
          }),
        });

        if (response.ok || response.status === 204) {
          setTimeout(refreshPlayback, 500);
          return true;
        }
        return false;
      } catch (err) {
        setError("Failed to transfer playback");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, state.isPlaying, refreshPlayback]
  );

  return {
    ...state,
    play,
    pause,
    skipNext,
    skipPrevious,
    setVolume,
    seek,
    refreshPlayback,
    transferPlayback,
    isLoading,
    error,
  };
}
