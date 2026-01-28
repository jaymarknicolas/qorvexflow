import { NextRequest, NextResponse } from "next/server";

// Valid Spotify OAuth error codes
const VALID_SPOTIFY_ERRORS = [
  "access_denied",
  "invalid_scope",
  "invalid_request",
  "unauthorized_client",
  "server_error",
  "temporarily_unavailable",
] as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get access token from URL hash (client-side OAuth flow)
  // This endpoint is mainly for documentation and handling errors

  const error = searchParams.get("error");

  if (error) {
    // Validate error against known Spotify error codes to prevent open redirect
    const safeError = VALID_SPOTIFY_ERRORS.includes(
      error as (typeof VALID_SPOTIFY_ERRORS)[number]
    )
      ? error
      : "unknown_error";

    // Redirect to home with sanitized error message
    return NextResponse.redirect(
      new URL(`/?spotify_error=${encodeURIComponent(safeError)}`, request.url)
    );
  }

  // For implicit grant flow (token in hash), redirect to home
  // The token will be extracted client-side from the URL hash
  return NextResponse.redirect(new URL("/", request.url));
}
