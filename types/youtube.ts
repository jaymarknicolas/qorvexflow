/**
 * YouTube widget types
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
}

export interface YouTubePlaylist {
  id: string;
  name: string;
  videos: YouTubeVideo[];
  createdAt: number;
  updatedAt: number;
}

export type YouTubePlayerState =
  | "unstarted"
  | "ended"
  | "playing"
  | "paused"
  | "buffering"
  | "cued";

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  error?: YouTubeAPIError;
}

export interface YouTubeAPIError {
  code: string;
  message: string;
}
