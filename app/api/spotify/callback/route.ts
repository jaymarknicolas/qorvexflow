import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  // Exchange the code for an Access Token
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri!,
    }),
  });

  const data = await tokenResponse.json();

  if (data.access_token) {
    // Send tokens back to the frontend in the HASH (#)
    const responseUrl = new URL("/", request.url);
    const hashParts = [`access_token=${data.access_token}`, `expires_in=${data.expires_in}`];
    if (data.refresh_token) {
      hashParts.push(`refresh_token=${data.refresh_token}`);
    }
    responseUrl.hash = hashParts.join("&");
    return NextResponse.redirect(responseUrl);
  }

  return NextResponse.redirect(
    new URL("/?error=token_exchange_failed", request.url),
  );
}
