"use client";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  uri: string;
  duration_ms: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: { total: number };
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
}

export class SpotifyAPIService {
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null;
  }

  /**
   * Set access token
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Check if token is valid
   */
  isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  /**
   * Get current user's playback state
   */
  async getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.status === 204) {
        return null; // No active device
      }

      if (!response.ok) {
        throw new Error("Failed to get playback state");
      }

      const data = await response.json();

      return {
        is_playing: data.is_playing,
        progress_ms: data.progress_ms,
        item: data.item
          ? {
              id: data.item.id,
              name: data.item.name,
              artist: data.item.artists[0]?.name || "Unknown",
              album: data.item.album.name,
              albumArt: data.item.album.images[0]?.url || "",
              uri: data.item.uri,
              duration_ms: data.item.duration_ms,
            }
          : null,
      };
    } catch (error) {
      console.error("Failed to get playback state:", error);
      return null;
    }
  }

  /**
   * Play/resume playback
   */
  async play(trackUri?: string, allUris?: string[], offset?: { position: number }): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      let body: string | undefined;
      if (allUris && allUris.length > 0) {
        body = JSON.stringify({ uris: allUris, offset });
      } else if (trackUri) {
        body = JSON.stringify({ uris: [trackUri] });
      }

      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body,
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to play:", error);
      return false;
    }
  }

  /**
   * Pause playback
   */
  async pause(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/pause`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to pause:", error);
      return false;
    }
  }

  /**
   * Skip to next track
   */
  async skipToNext(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/next`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to skip to next:", error);
      return false;
    }
  }

  /**
   * Skip to previous track
   */
  async skipToPrevious(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/previous`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to skip to previous:", error);
      return false;
    }
  }

  /**
   * Set volume (0-100)
   */
  async setVolume(volumePercent: number): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/player/volume?volume_percent=${volumePercent}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to set volume:", error);
      return false;
    }
  }

  /**
   * Seek to position (milliseconds)
   */
  async seek(positionMs: number): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/player/seek?position_ms=${positionMs}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to seek:", error);
      return false;
    }
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(limit: number = 20): Promise<SpotifyPlaylist[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/playlists?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get playlists");
      }

      const data = await response.json();

      return data.items
        .filter((item: any) => item && item.id)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          images: item.images || [],
          tracks: { total: item.tracks?.total ?? 0 },
        }));
    } catch (error) {
      console.error("Failed to get playlists:", error);
      return [];
    }
  }

  /**
   * Get playlist tracks
   */
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get playlist tracks");
      }

      const data = await response.json();

      return data.items
        .filter((item: any) => item.track)
        .map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name || "Unknown",
          album: item.track.album.name,
          albumArt: item.track.album.images[0]?.url || "",
          uri: item.track.uri,
          duration_ms: item.track.duration_ms,
        }));
    } catch (error) {
      console.error("Failed to get playlist tracks:", error);
      return [];
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search tracks");
      }

      const data = await response.json();

      return data.tracks.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists[0]?.name || "Unknown",
        album: item.album.name,
        albumArt: item.album.images[0]?.url || "",
        uri: item.uri,
        duration_ms: item.duration_ms,
      }));
    } catch (error) {
      console.error("Failed to search tracks:", error);
      return [];
    }
  }

  /**
   * Get suggested tracks based on a search query (theme-based)
   */
  async getSuggestedTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();

      return data.tracks.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists[0]?.name || "Unknown",
        album: item.album.name,
        albumArt: item.album.images[0]?.url || "",
        uri: item.uri,
        duration_ms: item.duration_ms,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Set shuffle mode
   */
  async setShuffle(state: boolean): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/player/shuffle?state=${state}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.ok || response.status === 204;
    } catch (error) {
      console.error("Failed to set shuffle:", error);
      return false;
    }
  }

  /**
   * Set repeat mode
   */
  async setRepeat(state: "off" | "track" | "context"): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/player/repeat?state=${state}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.ok || response.status === 204;
    } catch (error) {
      console.error("Failed to set repeat:", error);
      return false;
    }
  }

  /**
   * Get recently played tracks
   */
  async getRecentlyPlayed(limit: number = 20): Promise<SpotifyTrack[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();

      // Deduplicate by track id (same track may appear multiple times)
      const seen = new Set<string>();
      return data.items
        .filter((item: any) => {
          if (!item.track || seen.has(item.track.id)) return false;
          seen.add(item.track.id);
          return true;
        })
        .map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name || "Unknown",
          album: item.track.album.name,
          albumArt: item.track.album.images[0]?.url || "",
          uri: item.track.uri,
          duration_ms: item.track.duration_ms,
        }));
    } catch {
      return [];
    }
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(limit: number = 20, timeRange: "short_term" | "medium_term" | "long_term" = "short_term"): Promise<SpotifyTrack[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/top/tracks?limit=${limit}&time_range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();

      return data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists[0]?.name || "Unknown",
        album: item.album.name,
        albumArt: item.album.images[0]?.url || "",
        uri: item.uri,
        duration_ms: item.duration_ms,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Get available devices
   */
  async getDevices(): Promise<any[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/devices`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get devices");
      }

      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error("Failed to get devices:", error);
      return [];
    }
  }
}

// Singleton instance
export const spotifyAPI = new SpotifyAPIService();
