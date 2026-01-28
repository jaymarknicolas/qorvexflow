"use client";

import type {
  YouTubeVideo,
  YouTubeSearchResult,
  YouTubeAPIError,
} from "@/types/youtube";

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";

export class YouTubeAPIService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
  }

  /**
   * Search for videos by query
   */
  async searchVideos(
    query: string,
    maxResults: number = 5,
  ): Promise<YouTubeSearchResult> {
    if (!this.apiKey) {
      return {
        videos: [],
        error: {
          code: "API_KEY_MISSING",
          message:
            "YouTube API key is not configured. Please add NEXT_PUBLIC_YOUTUBE_API_KEY to your .env.local file.",
        },
      };
    }

    try {
      const searchUrl = `${API_BASE_URL}/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(
        query,
      )}&key=${this.apiKey}`;

      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error?.message || "Failed to search videos");
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return { videos: [] };
      }

      // Get video IDs
      const videoIds = searchData.items
        .map((item: any) => item.id.videoId)
        .join(",");

      // Fetch additional video details (duration, statistics)
      const detailsUrl = `${API_BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      // Combine search results with details
      const videos: YouTubeVideo[] = searchData.items.map((item: any) => {
        const details = detailsData.items?.find(
          (d: any) => d.id === item.id.videoId,
        );

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          duration: details?.contentDetails?.duration || "PT0S",
          viewCount: details?.statistics?.viewCount || "0",
          publishedAt: item.snippet.publishedAt,
        };
      });

      return { videos };
    } catch (error) {
      console.error("YouTube API Error:", error);

      const apiError: YouTubeAPIError = {
        code: "SEARCH_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to search YouTube videos",
      };

      return { videos: [], error: apiError };
    }
  }

  /**
   * Get video details by ID
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      console.error("YouTube API key is missing");
      return null;
    }

    try {
      const url = `${API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch video details");
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];

      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: item.contentDetails.duration,
        viewCount: item.statistics.viewCount,
        publishedAt: item.snippet.publishedAt,
      };
    } catch (error) {
      console.error("Failed to get video details:", error);
      return null;
    }
  }

  /**
   * Parse ISO 8601 duration to readable format
   * Example: PT1H2M10S -> "1:02:10"
   */
  parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    if (!match) return "0:00";

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Format view count to human-readable format
   * Example: 1500000 -> "1.5M"
   */
  formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);

    if (count >= 1000000000) {
      return `${(count / 1000000000).toFixed(1)}B`;
    }

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }

    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }

    return count.toString();
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}

// Singleton instance
export const youtubeAPI = new YouTubeAPIService();
