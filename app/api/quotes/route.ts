import { NextRequest, NextResponse } from "next/server";

const CATEGORY_TAGS: Record<string, string[]> = {
  inspirational: ["inspirational", "motivation"],
  wisdom: ["wisdom", "knowledge"],
  love: ["love", "relationships"],
  life: ["life", "existence"],
  happiness: ["happiness", "joy"],
  all: ["inspirational"],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "all";

  try {
    const res = await fetch("https://zenquotes.io/api/random", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Upstream API failed");
    }

    const data = await res.json();
    const quote = data[0];

    const tags = CATEGORY_TAGS[category] ?? CATEGORY_TAGS.all;

    return NextResponse.json({
      _id: crypto.randomUUID(),
      content: quote.q,
      author: quote.a,
      tags,
      authorSlug: quote.a.replace(/\s+/g, "-").toLowerCase(),
      length: quote.q.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 },
    );
  }
}
