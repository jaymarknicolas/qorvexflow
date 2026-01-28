"use client";

import { useState, useEffect, useCallback } from "react";

const SPOTIFY_TOKEN_KEY = "spotify_access_token";
const SPOTIFY_EXPIRY_KEY = "spotify_token_expiry";

interface UseSpotifyAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  accessToken: string | null;
  connect: () => void;
  disconnect: () => void;
  error: string | null;
}

// Helper to get storage - uses sessionStorage for better security
// Token is cleared when tab closes, reducing XSS attack window
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function useSpotifyAuth(): UseSpotifyAuthReturn {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const hashError = params.get("error");

      if (hashError) {
        setError(hashError);
        // Clean up URL
        window.history.replaceState(null, "", window.location.pathname);
      } else if (token && expiresIn) {
        // Store token with expiry in sessionStorage (more secure)
        const expiryTime = Date.now() + parseInt(expiresIn, 10) * 1000;
        storage.setItem(SPOTIFY_TOKEN_KEY, token);
        storage.setItem(SPOTIFY_EXPIRY_KEY, expiryTime.toString());
        setAccessToken(token);
        setError(null);

        // Clean up URL hash
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    // Check for existing valid token in sessionStorage
    const storedToken = storage.getItem(SPOTIFY_TOKEN_KEY);
    const storedExpiry = storage.getItem(SPOTIFY_EXPIRY_KEY);

    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime) {
        setAccessToken(storedToken);
      } else {
        // Token expired, clear it
        storage.removeItem(SPOTIFY_TOKEN_KEY);
        storage.removeItem(SPOTIFY_EXPIRY_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  // Connect to Spotify (initiate OAuth flow)
  const connect = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      setError("Spotify credentials not configured");
      return;
    }

    const scopes = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "streaming",
      "playlist-read-private",
      "playlist-read-collaborative",
    ];

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "token");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("show_dialog", "false");

    window.location.href = authUrl.toString();
  }, []);

  // Disconnect from Spotify
  const disconnect = useCallback(() => {
    const storage = getStorage();
    if (!storage) return;

    storage.removeItem(SPOTIFY_TOKEN_KEY);
    storage.removeItem(SPOTIFY_EXPIRY_KEY);
    setAccessToken(null);
    setError(null);
  }, []);

  // Check token validity periodically
  useEffect(() => {
    if (!accessToken) return;

    const checkValidity = () => {
      const storage = getStorage();
      if (!storage) return;

      const storedExpiry = storage.getItem(SPOTIFY_EXPIRY_KEY);
      if (storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        if (Date.now() >= expiryTime) {
          // Token expired
          disconnect();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkValidity, 60000);
    return () => clearInterval(interval);
  }, [accessToken, disconnect]);

  return {
    isConnected: Boolean(accessToken),
    isLoading,
    accessToken,
    connect,
    disconnect,
    error,
  };
}
