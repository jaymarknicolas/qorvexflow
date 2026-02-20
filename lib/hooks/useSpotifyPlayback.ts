"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { spotifyAPI } from "@/lib/services/spotify-api";

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
  setShuffle: (state: boolean) => Promise<boolean>;
  setRepeat: (state: "off" | "track" | "context") => Promise<boolean>;
  refreshPlayback: () => Promise<void>;
  transferPlayback: (deviceId: string) => Promise<boolean>;
  isLoading: boolean;
  isSDKReady: boolean;
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
  isActive: boolean = true,
): UseSpotifyPlaybackReturn {
  const [state, setState] = useState<PlaybackState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSDKReady, setIsSDKReady] = useState(false);

  // Use ref for the SDK player so cleanup and callbacks always access the latest instance
  const playerRef = useRef<any>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sdkScriptLoadedRef = useRef(false);

  // Update spotifyAPI token when it changes
  useEffect(() => {
    if (accessToken) {
      spotifyAPI.setAccessToken(accessToken);
    }
  }, [accessToken]);

  // Progress timer - increment progress_ms locally while playing for smooth progress bar
  useEffect(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    if (state.isPlaying) {
      progressTimerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress_ms: prev.progress_ms + 500,
        }));
      }, 500);
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [state.isPlaying]);

  // Initialize Spotify Web Playback SDK - depends only on accessToken
  // We don't destroy/recreate when isActive changes, just pause instead
  useEffect(() => {
    if (!accessToken) {
      // No token - clean up any existing player
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setIsSDKReady(false);
        setState(DEFAULT_STATE);
      }
      return;
    }

    // Don't re-initialize if already have a player
    if (playerRef.current) return;

    // Load SDK script if not already loaded
    if (!sdkScriptLoadedRef.current) {
      const existingScript = document.querySelector(
        'script[src="https://sdk.scdn.co/spotify-player.js"]',
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
      sdkScriptLoadedRef.current = true;
    }

    const initPlayer = () => {
      if (!window.Spotify) return;

      const newPlayer = new window.Spotify.Player({
        name: "Qorvex Flow Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      newPlayer.addListener(
        "ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Spotify SDK Ready with Device ID", device_id);
          setIsSDKReady(true);
          setIsLoading(false);

          // Transfer playback to this device (don't auto-play)
          fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              device_ids: [device_id],
              play: false,
            }),
          }).then(() => {
            // Refresh to get device list
            spotifyAPI.getDevices().then((devices) => {
              const activeDevice =
                devices.find((d: SpotifyDevice) => d.is_active) || null;
              setState((prev) => ({
                ...prev,
                devices: devices as SpotifyDevice[],
                activeDevice:
                  activeDevice ||
                  ({
                    id: device_id,
                    name: "Qorvex Flow Player",
                    type: "Computer",
                    is_active: true,
                    volume_percent: 50,
                  } as SpotifyDevice),
                hasActiveDevice: true,
              }));
            });
          });
        },
      );

      newPlayer.addListener("player_state_changed", (sdkState: any) => {
        if (!sdkState) return;

        setState((prev) => ({
          ...prev,
          isPlaying: !sdkState.paused,
          progress_ms: sdkState.position,
          currentTrack: sdkState.track_window?.current_track
            ? {
                id: sdkState.track_window.current_track.id,
                name: sdkState.track_window.current_track.name,
                artist:
                  sdkState.track_window.current_track.artists?.[0]?.name ||
                  "Unknown",
                album:
                  sdkState.track_window.current_track.album?.name || "Unknown",
                albumArt:
                  sdkState.track_window.current_track.album?.images?.[0]?.url ||
                  "",
                duration_ms: sdkState.duration,
                uri: sdkState.track_window.current_track.uri,
              }
            : null,
          hasActiveDevice: true,
        }));
        setIsLoading(false);
      });

      newPlayer.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Spotify device has gone offline", device_id);
          setIsSDKReady(false);
        },
      );

      newPlayer.addListener(
        "initialization_error",
        ({ message }: { message: string }) => {
          console.error("Spotify initialization error:", message);
          setError("Failed to initialize Spotify player");
          setIsLoading(false);
        },
      );

      newPlayer.addListener(
        "authentication_error",
        ({ message }: { message: string }) => {
          console.error("Spotify authentication error:", message);
          setError("Spotify authentication failed");
          setIsLoading(false);
          setIsSDKReady(false);
          // Immediately disconnect to stop the SDK retry loop before React state propagates
          const player = playerRef.current;
          playerRef.current = null;
          if (player) {
            try { player.disconnect(); } catch {}
          }
        },
      );

      newPlayer.addListener(
        "account_error",
        ({ message }: { message: string }) => {
          console.error("Spotify account error:", message);
          setError("Spotify Premium required");
          setIsLoading(false);
        },
      );

      newPlayer.connect();
      playerRef.current = newPlayer;
      setIsLoading(true);
    };

    // Check if SDK is already loaded
    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setIsSDKReady(false);
      }
    };
  }, [accessToken]);

  // Pause playback when switching away from Spotify (isActive becomes false)
  // Don't gate on state.isPlaying — our local state can be out of sync with Spotify
  useEffect(() => {
    if (!isActive) {
      // Use SDK if available, otherwise fall back to REST API (not both — REST causes 404 with SDK device)
      if (playerRef.current) {
        playerRef.current.pause().catch(() => {});
      } else if (accessToken) {
        spotifyAPI.pause().catch(() => {});
      }
    }
  }, [isActive, accessToken]);

  // Control functions - use SDK player methods (more reliable than REST API,
  // works even when token approaches expiry since SDK handles refresh internally)
  const play = useCallback(async (): Promise<boolean> => {
    if (playerRef.current) {
      try {
        await playerRef.current.resume();
        return true;
      } catch (err) {
        console.error("Failed to resume:", err);
        return false;
      }
    }
    return false;
  }, []);

  const pause = useCallback(async (): Promise<boolean> => {
    // Use SDK if available — REST API causes 404 when no external device is active
    if (playerRef.current) {
      try {
        await playerRef.current.pause();
        return true;
      } catch (err) {
        console.error("Failed to pause via SDK:", err);
        return false;
      }
    }
    // Fallback: REST API (only when no SDK player)
    if (accessToken) {
      try {
        return await spotifyAPI.pause();
      } catch (err) {
        console.error("Failed to pause via API:", err);
        return false;
      }
    }
    return false;
  }, [accessToken]);

  const skipNext = useCallback(async (): Promise<boolean> => {
    if (playerRef.current) {
      try {
        await playerRef.current.nextTrack();
        return true;
      } catch (err) {
        console.error("Failed to skip to next via SDK:", err);
        // Fallback to REST API
        if (accessToken) {
          try {
            return await spotifyAPI.skipToNext();
          } catch {
            return false;
          }
        }
        return false;
      }
    }
    // No SDK player - try REST API
    if (accessToken) {
      try {
        return await spotifyAPI.skipToNext();
      } catch {
        return false;
      }
    }
    return false;
  }, [accessToken]);

  const skipPrevious = useCallback(async (): Promise<boolean> => {
    if (playerRef.current) {
      try {
        await playerRef.current.previousTrack();
        return true;
      } catch (err) {
        console.error("Failed to skip to previous via SDK:", err);
        // Fallback to REST API
        if (accessToken) {
          try {
            return await spotifyAPI.skipToPrevious();
          } catch {
            return false;
          }
        }
        return false;
      }
    }
    // No SDK player - try REST API
    if (accessToken) {
      try {
        return await spotifyAPI.skipToPrevious();
      } catch {
        return false;
      }
    }
    return false;
  }, [accessToken]);

  const setVolume = useCallback(async (percent: number): Promise<boolean> => {
    if (playerRef.current) {
      try {
        // SDK setVolume takes 0-1 range
        await playerRef.current.setVolume(Math.max(0, Math.min(1, percent / 100)));
        return true;
      } catch (err) {
        console.error("Failed to set volume:", err);
        return false;
      }
    }
    return false;
  }, []);

  const seek = useCallback(async (ms: number): Promise<boolean> => {
    if (playerRef.current) {
      try {
        await playerRef.current.seek(ms);
        setState((prev) => ({ ...prev, progress_ms: ms }));
        return true;
      } catch (err) {
        console.error("Failed to seek:", err);
        return false;
      }
    }
    return false;
  }, []);

  const setShuffle = useCallback(
    async (shuffleState: boolean): Promise<boolean> => {
      if (!accessToken) return false;
      try {
        return await spotifyAPI.setShuffle(shuffleState);
      } catch (err) {
        setError("Failed to set shuffle");
        return false;
      }
    },
    [accessToken],
  );

  const setRepeat = useCallback(
    async (repeatState: "off" | "track" | "context"): Promise<boolean> => {
      if (!accessToken) return false;
      try {
        return await spotifyAPI.setRepeat(repeatState);
      } catch (err) {
        setError("Failed to set repeat");
        return false;
      }
    },
    [accessToken],
  );

  const refreshPlayback = useCallback(async () => {
    if (!accessToken) return;

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
    [accessToken, state.isPlaying, refreshPlayback],
  );

  return {
    ...state,
    play,
    pause,
    skipNext,
    skipPrevious,
    setVolume,
    seek,
    setShuffle,
    setRepeat,
    refreshPlayback,
    transferPlayback,
    isLoading,
    isSDKReady,
    error,
  };
}
