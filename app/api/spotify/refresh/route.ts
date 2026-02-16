import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "refresh_token is required" },
        { status: 400 },
      );
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to refresh token" },
        { status: tokenResponse.status },
      );
    }

    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      // Spotify may return a new refresh token
      refresh_token: data.refresh_token || refresh_token,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 },
    );
  }
}
