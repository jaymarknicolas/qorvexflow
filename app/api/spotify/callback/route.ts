import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get access token from URL hash (client-side OAuth flow)
  // This endpoint is mainly for documentation and handling errors

  const error = searchParams.get("error");

  if (error) {
    // Redirect to home with error message
    return NextResponse.redirect(
      new URL(`/?spotify_error=${error}`, request.url)
    );
  }

  // For implicit grant flow (token in hash), redirect to home
  // The token will be extracted client-side from the URL hash
  return NextResponse.redirect(new URL("/", request.url));
}
