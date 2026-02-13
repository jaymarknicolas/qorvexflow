/**
 * Music player playlist types
 */

export interface MusicTrack {
  id: string; // YouTube videoId or Spotify trackId
  name: string;
  artist: string;
  thumbnail?: string;
  uri?: string; // Spotify URI (spotify:track:xxx), undefined for YouTube
  source: "youtube" | "spotify";
  addedAt: number;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  source: "youtube" | "spotify";
  tracks: MusicTrack[];
  createdAt: number;
  updatedAt: number;
}

export interface MusicPlaylistsState {
  activeYoutubePlaylistId: string | null;
  activeSpotifyPlaylistId: string | null;
  playlists: MusicPlaylist[];
  version: number;
}
