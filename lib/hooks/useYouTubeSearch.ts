"use client";

import { useState, useCallback } from "react";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  duration?: number;
}

interface UseYouTubeSearchReturn {
  results: YouTubeSearchResult[];
  isSearching: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export function useYouTubeSearch(): UseYouTubeSearchReturn {
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      setError("YouTube API key not configured");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Search for videos
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("q", `${query} music`);
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("videoCategoryId", "10"); // Music category
      searchUrl.searchParams.set("maxResults", "10");
      searchUrl.searchParams.set("key", apiKey);

      const searchResponse = await fetch(searchUrl.toString());

      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        setResults([]);
        return;
      }

      // Get video IDs for duration lookup
      const videoIds = searchData.items
        .map((item: { id: { videoId: string } }) => item.id.videoId)
        .join(",");

      // Get video details including duration
      const detailsUrl = new URL(
        "https://www.googleapis.com/youtube/v3/videos",
      );
      detailsUrl.searchParams.set("part", "contentDetails");
      detailsUrl.searchParams.set("id", videoIds);
      detailsUrl.searchParams.set("key", apiKey);

      const detailsResponse = await fetch(detailsUrl.toString());
      const detailsData = await detailsResponse.json();

      // Create a map of video ID to duration
      const durationMap: Record<string, number> = {};
      if (detailsData.items) {
        detailsData.items.forEach(
          (item: { id: string; contentDetails: { duration: string } }) => {
            durationMap[item.id] = parseDuration(item.contentDetails.duration);
          },
        );
      }

      // Map results
      const mappedResults: YouTubeSearchResult[] = searchData.items.map(
        (item: {
          id: { videoId: string };
          snippet: {
            title: string;
            channelTitle: string;
            thumbnails: { medium?: { url: string }; default?: { url: string } };
            publishedAt: string;
          };
        }) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail:
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url ||
            "",
          publishedAt: item.snippet.publishedAt,
          duration: durationMap[item.id.videoId] || 0,
        }),
      );

      setResults(mappedResults);
    } catch (err) {
      console.error("YouTube search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearResults,
  };
}
