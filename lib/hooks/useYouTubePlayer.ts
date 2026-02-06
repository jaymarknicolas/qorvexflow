"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// YouTube Player States
export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export interface YouTubeTrack {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // in seconds
}

interface UseYouTubePlayerOptions {
  onEnded?: () => void;
}

interface UseYouTubePlayerReturn {
  // State
  isReady: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack: YouTubeTrack | null;
  error: string | null;

  // Controls
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (percent: number) => void;
  loadVideo: (videoId: string, track?: Partial<YouTubeTrack>) => void;

  // Player element ref
  playerContainerId: string;
}

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: typeof PlayerState;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVideoData: () => { video_id: string; title: string; author: string };
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  destroy: () => void;
}

let apiLoaded = false;
let apiLoading = false;
const apiReadyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded) {
      resolve();
      return;
    }

    apiReadyCallbacks.push(resolve);

    if (apiLoading) {
      return;
    }

    apiLoading = true;

    // Set up the callback
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiLoading = false;
      apiReadyCallbacks.forEach((cb) => cb());
      apiReadyCallbacks.length = 0;
    };

    // Load the script
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
}

export function useYouTubePlayer(containerId: string, options?: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<YTPlayer | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingVideoRef = useRef<{ videoId: string; track?: Partial<YouTubeTrack> } | null>(null);
  const playRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onEndedRef = useRef(options?.onEnded);

  // Keep onEnded callback reference up to date
  useEffect(() => {
    onEndedRef.current = options?.onEnded;
  }, [options?.onEnded]);

  // Initialize YouTube API and player
  useEffect(() => {
    let mounted = true;

    const initPlayer = async () => {
      await loadYouTubeAPI();

      if (!mounted) return;

      // Check if container exists
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`YouTube player container #${containerId} not found`);
        return;
      }

      // Get origin for YouTube player
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      // Create player
      playerRef.current = new window.YT.Player(containerId, {
        height: "144",
        width: "256",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: origin,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            if (!mounted) return;
            setIsReady(true);
            setIsLoading(false);
            event.target.setVolume(volume);

            // Load pending video if any
            if (pendingVideoRef.current) {
              const { videoId, track } = pendingVideoRef.current;
              event.target.loadVideoById(videoId);
              if (track) {
                setCurrentTrack({
                  videoId,
                  title: track.title || "Unknown",
                  artist: track.artist || "Unknown",
                  thumbnail: track.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                  duration: track.duration || 0,
                });
              }
              pendingVideoRef.current = null;
            }
          },
          onStateChange: (event) => {
            if (!mounted) return;

            const state = event.data;

            switch (state) {
              case PlayerState.UNSTARTED:
                setIsPlaying(false);
                setIsLoading(false);
                break;
              case PlayerState.PLAYING:
                setIsPlaying(true);
                setIsLoading(false);
                // Update duration when playing starts
                try {
                  const dur = event.target.getDuration();
                  if (dur > 0) setDuration(dur);
                  // Get video data
                  const videoData = event.target.getVideoData();
                  if (videoData && videoData.video_id) {
                    setCurrentTrack((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: prev.title === "Loading..." ? videoData.title : prev.title,
                            artist: prev.artist === "YouTube" ? videoData.author : prev.artist,
                          }
                        : null
                    );
                  }
                } catch (e) {
                  // Ignore errors getting video data
                }
                break;
              case PlayerState.PAUSED:
                setIsPlaying(false);
                setIsLoading(false);
                break;
              case PlayerState.BUFFERING:
                setIsLoading(true);
                break;
              case PlayerState.ENDED:
                setIsPlaying(false);
                setIsLoading(false);
                // Call onEnded callback when video ends
                if (onEndedRef.current) {
                  onEndedRef.current();
                }
                break;
              case PlayerState.CUED:
                setIsPlaying(false);
                setIsLoading(false);
                break;
            }
          },
          onError: (event) => {
            if (!mounted) return;
            const errorCodes: Record<number, string> = {
              2: "Invalid video ID",
              5: "HTML5 player error",
              100: "Video not found",
              101: "Playback not allowed",
              150: "Playback not allowed",
            };
            setError(errorCodes[event.data] || "Unknown error");
            setIsLoading(false);
          },
        },
      });
    };

    initPlayer();

    return () => {
      mounted = false;
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (playRetryTimeoutRef.current) {
        clearTimeout(playRetryTimeoutRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Player might already be destroyed
        }
        playerRef.current = null;
      }
    };
  }, [containerId]);

  // State and time update interval - polls player state as backup for onStateChange
  useEffect(() => {
    if (!isReady || !playerRef.current) return;

    // Poll player state and time regardless of isPlaying
    // This ensures we detect state changes even if onStateChange doesn't fire
    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const playerState = playerRef.current.getPlayerState();
          const time = playerRef.current.getCurrentTime();

          // Update playing state based on actual player state
          const actuallyPlaying = playerState === PlayerState.PLAYING;
          setIsPlaying(actuallyPlaying);

          // Update loading state
          if (playerState === PlayerState.BUFFERING) {
            setIsLoading(true);
          } else if (playerState === PlayerState.PLAYING || playerState === PlayerState.PAUSED) {
            setIsLoading(false);
          }

          // Update time
          if (actuallyPlaying) {
            setCurrentTime(time);
          }

          // Update duration if needed
          const dur = playerRef.current.getDuration();
          if (dur > 0) {
            setDuration(dur);
          }
        } catch (e) {
          // Player might not be ready
        }
      }
    }, 250);

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [isReady]);


  const play = useCallback((retryCount = 0) => {
    if (playerRef.current && isReady) {
      try {
        // Clear any pending retry
        if (playRetryTimeoutRef.current) {
          clearTimeout(playRetryTimeoutRef.current);
          playRetryTimeoutRef.current = null;
        }

        playerRef.current.playVideo();
      } catch (e) {
        // Handle AbortError - retry after a short delay
        if (e instanceof Error && e.name === "AbortError" && retryCount < 3) {
          console.log("Play interrupted, retrying...", retryCount + 1);
          playRetryTimeoutRef.current = setTimeout(() => {
            play(retryCount + 1);
          }, 500);
        } else {
          console.error("Play error:", e);
        }
      }
    }
  }, [isReady]);

  const pause = useCallback(() => {
    if (playerRef.current && isReady) {
      playerRef.current.pauseVideo();
    }
  }, [isReady]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (playerRef.current && isReady) {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      }
    },
    [isReady]
  );

  const setVolume = useCallback(
    (percent: number) => {
      const vol = Math.max(0, Math.min(100, percent));
      setVolumeState(vol);
      if (playerRef.current && isReady) {
        playerRef.current.setVolume(vol);
      }
    },
    [isReady]
  );

  const loadVideo = useCallback(
    (videoId: string, track?: Partial<YouTubeTrack>) => {
      setError(null);
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);

      const trackInfo: YouTubeTrack = {
        videoId,
        title: track?.title || "Loading...",
        artist: track?.artist || "YouTube",
        thumbnail: track?.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        duration: track?.duration || 0,
      };

      setCurrentTrack(trackInfo);

      if (playerRef.current && isReady) {
        playerRef.current.loadVideoById(videoId);
      } else {
        // Store for when player is ready
        pendingVideoRef.current = { videoId, track };
      }
    },
    [isReady]
  );

  return {
    isReady,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    currentTrack,
    error,
    play,
    pause,
    togglePlay,
    seekTo,
    setVolume,
    loadVideo,
    playerContainerId: containerId,
  };
}
