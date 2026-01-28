import { NextRequest, NextResponse } from "next/server";

const NEXT_PUBLIC_YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  if (!NEXT_PUBLIC_YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
        query,
      )}&key=${NEXT_PUBLIC_YOUTUBE_API_KEY}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("YouTube API error:", error);
      return NextResponse.json(
        { error: "Failed to search YouTube" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const videos = data.items.map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          thumbnails: {
            medium: { url: string };
            default: { url: string };
          };
        };
      }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url,
      }),
    );

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube" },
      { status: 500 },
    );
  }
}
