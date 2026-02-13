import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Default fallback queries
const DEFAULT_QUERIES = [
  "lofi hip hop beats",
  "study music playlist",
  "ambient focus music",
  "chill beats to study",
  "relaxing piano music",
  "nature sounds study",
];

// Theme-specific queries
const THEME_QUERIES: Record<string, string[]> = {
  default: [
    "lofi hip hop beats",
    "synthwave retrowave mix",
    "chill electronic music",
    "lo-fi study beats",
    "vaporwave aesthetic music",
    "chillhop essentials",
  ],
  ghibli: [
    "studio ghibli music playlist",
    "ghibli jazz relaxing",
    "ghibli piano collection",
    "spirited away soundtrack",
    "totoro relaxing music",
    "howl's moving castle music",
  ],
  coffeeshop: [
    "coffee shop ambience music",
    "rainy jazz cafe",
    "cozy cafe playlist",
    "bossa nova coffee shop",
    "acoustic cafe music",
    "jazz coffee morning",
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest) {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key not configured", videos: [] },
      { status: 503 },
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const theme = searchParams.get("theme") || "default";
    const interests = searchParams.get("interests"); // comma-separated search history

    // Build query pool: theme queries + user interests + defaults
    const themePool = THEME_QUERIES[theme] || THEME_QUERIES.default;
    const userInterests = interests
      ? interests
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, 10) // cap at 10 recent interests
      : [];

    // Pick queries: 1 from theme, 1 from user interests (if any), 1 from defaults
    const queries: string[] = [];

    // Always include a theme-based query
    queries.push(shuffle(themePool)[0]);

    // Include a user interest query if available
    if (userInterests.length > 0) {
      const interestQuery = shuffle(userInterests)[0];
      // Append "music" if the query is very short/generic to get better results
      queries.push(
        interestQuery.length < 8
          ? `${interestQuery} music`
          : interestQuery,
      );
    }

    // Fill remaining with defaults (up to 3 total queries)
    const remaining = shuffle(DEFAULT_QUERIES).filter(
      (q) => !queries.includes(q),
    );
    while (queries.length < 3 && remaining.length > 0) {
      queries.push(remaining.shift()!);
    }

    // Fetch from YouTube API (4 results per query to stay within quota)
    const resultsPerQuery = Math.ceil(12 / queries.length);
    const results = await Promise.all(
      queries.map(async (query) => {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${resultsPerQuery}&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`,
          { cache: "no-store" },
        );

        if (!response.ok) return [];

        const data = await response.json();
        return (
          data.items?.map(
            (item: {
              id: { videoId: string };
              snippet: {
                title: string;
                channelTitle: string;
                thumbnails: {
                  medium?: { url: string };
                  default?: { url: string };
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
          ) || []
        );
      }),
    );

    // Flatten, deduplicate by id, shuffle
    const seen = new Set<string>();
    const allVideos = results
      .flat()
      .filter((v: { id: string }) => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });

    const shuffled = shuffle(allVideos).slice(0, 12);

    return NextResponse.json(
      { videos: shuffled },
      {
        headers: {
          "Cache-Control": "public, max-age=1800",
        },
      },
    );
  } catch (error) {
    console.error("YouTube suggested error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggested videos", videos: [] },
      { status: 500 },
    );
  }
}
