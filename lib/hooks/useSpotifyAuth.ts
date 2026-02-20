"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const SPOTIFY_TOKEN_KEY = "spotify_access_token";
const SPOTIFY_EXPIRY_KEY = "spotify_token_expiry";
const SPOTIFY_REFRESH_KEY = "spotify_refresh_token";

interface UseSpotifyAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  accessToken: string | null;
  connect: () => void;
  disconnect: () => void;
  error: string | null;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function useSpotifyAuth(): UseSpotifyAuthReturn {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh the access token using the refresh token
  const refreshAccessToken = useCallback(async () => {
    const storage = getStorage();
    if (!storage) return false;

    const refreshToken = storage.getItem(SPOTIFY_REFRESH_KEY);
    if (!refreshToken) return false;

    try {
      const response = await fetch("/api/spotify/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed — token is likely revoked
        return false;
      }

      const data = await response.json();

      if (data.access_token) {
        const expiryTime = Date.now() + data.expires_in * 1000;
        storage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
        storage.setItem(SPOTIFY_EXPIRY_KEY, expiryTime.toString());
        if (data.refresh_token) {
          storage.setItem(SPOTIFY_REFRESH_KEY, data.refresh_token);
        }
        setAccessToken(data.access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Schedule a refresh 5 minutes before expiry
  const scheduleRefresh = useCallback(
    (expiryTime: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Refresh 5 minutes before expiry, minimum 10 seconds from now
      const refreshIn = Math.max(expiryTime - Date.now() - 5 * 60 * 1000, 10000);

      refreshTimerRef.current = setTimeout(async () => {
        const success = await refreshAccessToken();
        if (success) {
          const storage = getStorage();
          const newExpiry = storage?.getItem(SPOTIFY_EXPIRY_KEY);
          if (newExpiry) {
            scheduleRefresh(parseInt(newExpiry, 10));
          }
        }
      }, refreshIn);
    },
    [refreshAccessToken],
  );

  // Check for existing token and extract from URL hash on mount
  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;

    // First, check URL hash for new token (OAuth callback)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      const expiresIn = params.get("expires_in");
      const refreshToken = params.get("refresh_token");
      const hashError = params.get("error");

      if (hashError) {
        setError(hashError);
        window.history.replaceState(null, "", window.location.pathname);
      } else if (token && expiresIn) {
        const expiryTime = Date.now() + parseInt(expiresIn, 10) * 1000;
        storage.setItem(SPOTIFY_TOKEN_KEY, token);
        storage.setItem(SPOTIFY_EXPIRY_KEY, expiryTime.toString());
        if (refreshToken) {
          storage.setItem(SPOTIFY_REFRESH_KEY, refreshToken);
        }
        setAccessToken(token);
        setError(null);
        scheduleRefresh(expiryTime);

        // Clean up URL hash
        window.history.replaceState(null, "", window.location.pathname);
        setIsLoading(false);
        return;
      }
    }

    // Check for existing valid token
    const storedToken = storage.getItem(SPOTIFY_TOKEN_KEY);
    const storedExpiry = storage.getItem(SPOTIFY_EXPIRY_KEY);

    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime) {
        setAccessToken(storedToken);
        scheduleRefresh(expiryTime);
      } else {
        // Token expired — try to refresh
        refreshAccessToken().then((success) => {
          if (!success) {
            // Refresh failed, clear everything
            storage.removeItem(SPOTIFY_TOKEN_KEY);
            storage.removeItem(SPOTIFY_EXPIRY_KEY);
            storage.removeItem(SPOTIFY_REFRESH_KEY);
          } else {
            const newExpiry = storage.getItem(SPOTIFY_EXPIRY_KEY);
            if (newExpiry) {
              scheduleRefresh(parseInt(newExpiry, 10));
            }
          }
          setIsLoading(false);
        });
        return;
      }
    }

    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect to Spotify (initiate OAuth flow)
  const connect = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "streaming",
      "user-read-recently-played",
      "user-top-read",
      "user-library-read",
      "playlist-read-private",
      "playlist-read-collaborative",
    ];

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("client_id", clientId!);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri!);
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("show_dialog", "false");

    window.location.href = authUrl.toString();
  }, []);

  // Disconnect from Spotify
  const disconnect = useCallback(() => {
    const storage = getStorage();
    if (!storage) return;

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    storage.removeItem(SPOTIFY_TOKEN_KEY);
    storage.removeItem(SPOTIFY_EXPIRY_KEY);
    storage.removeItem(SPOTIFY_REFRESH_KEY);
    setAccessToken(null);
    setError(null);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    isConnected: Boolean(accessToken),
    isLoading,
    accessToken,
    connect,
    disconnect,
    error,
  };
}
