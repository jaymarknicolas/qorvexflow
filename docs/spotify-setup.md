# Spotify Integration Setup Guide

This guide will walk you through setting up Spotify integration for QorvexFlow's Music Player.

## Prerequisites

- A Spotify account (Free or Premium)
- Node.js and npm installed
- QorvexFlow project running locally

## Step 1: Create a Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Accept the Terms of Service if prompted

## Step 2: Create a Spotify App

1. Click **"Create an App"**
2. Fill in the app details:
   - **App Name**: `QorvexFlow` (or any name you prefer)
   - **App Description**: `Personal productivity workspace with music integration`
   - **Website**: `http://localhost:3000` (for development)
3. Check the box to agree to Spotify's Terms of Service
4. Click **"Create"**

## Step 3: Configure Redirect URIs

1. In your app's dashboard, click **"Edit Settings"**
2. Scroll down to **"Redirect URIs"**
3. Add the following redirect URI:
   ```
   http://localhost:3000/api/spotify/callback
   ```
4. For production, add your production URL:
   ```
   https://yourdomain.com/api/spotify/callback
   ```
5. Click **"Add"**
6. Click **"Save"** at the bottom

## Step 4: Get Your Client ID

1. From your app's dashboard, find the **"Client ID"**
2. Copy this value - you'll need it for the next step

## Step 5: Configure Environment Variables

1. In your QorvexFlow project root, open or create `.env.local`
2. Add the following environment variables:

```bash
# Spotify Configuration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

3. Replace `your_client_id_here` with the Client ID from Step 4
4. For production, update the redirect URI to your production URL

## Step 6: Restart Your Development Server

```bash
# Stop your current server (Ctrl+C)
# Start it again
npm run dev
```

## Step 7: Connect Spotify in QorvexFlow

1. Open QorvexFlow in your browser: `http://localhost:3000`
2. Add a **Music Player** widget to your workspace
3. Click the widget title to open the source selector
4. Click **"Spotify"**
5. You'll be redirected to Spotify's authorization page
6. Click **"Agree"** to grant permissions
7. You'll be redirected back to QorvexFlow with Spotify connected!

## Required Spotify Permissions

QorvexFlow requests the following permissions (scopes):

- `user-read-playback-state` - Read your currently playing track
- `user-modify-playback-state` - Control playback (play, pause, skip)
- `user-read-currently-playing` - Read the currently playing track
- `playlist-read-private` - Access your private playlists
- `playlist-read-collaborative` - Access collaborative playlists

## Features Available with Spotify Integration

### Playback Control
- Play/Pause current track
- Skip to next/previous track
- Adjust volume
- Seek to position

### Playlist Access
- View your Spotify playlists
- Play tracks from playlists
- Browse playlist details

### Currently Playing
- See what's currently playing
- View album art
- Track progress
- Artist and album information

## Troubleshooting

### "Invalid Client" Error

**Problem**: You see an error saying "Invalid client" when connecting.

**Solution**:
1. Double-check your `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` in `.env.local`
2. Make sure there are no extra spaces or quotes
3. Verify the Client ID matches exactly what's in your Spotify Dashboard
4. Restart your development server

### "Invalid Redirect URI" Error

**Problem**: Spotify shows "INVALID_CLIENT: Invalid redirect URI"

**Solution**:
1. Go to your Spotify App Settings
2. Verify the Redirect URI is exactly:
   ```
   http://localhost:3000/api/spotify/callback
   ```
3. Make sure you clicked "Save" after adding it
4. The URI must match exactly (including http/https, port, path)

### "No Active Device" Error

**Problem**: You see "No active device" when trying to play.

**Solution**:
1. Open Spotify on any device (desktop app, mobile, web player)
2. Start playing any track (even if you pause it immediately)
3. The device will now be active and available
4. Try again in QorvexFlow

### Token Expired Error

**Problem**: Music stops working after an hour.

**Solution**:
- Spotify access tokens expire after 1 hour
- Simply reconnect Spotify in QorvexFlow
- Future versions will implement automatic token refresh

### "CORS Error" in Console

**Problem**: You see CORS errors in the browser console.

**Solution**:
- This is expected for Spotify's implicit grant flow
- As long as the connection works, you can ignore these
- They won't affect functionality

## Production Deployment

When deploying to production:

1. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
   NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://yourdomain.com/api/spotify/callback
   ```

2. **Update Spotify App Settings**:
   - Add production redirect URI to your Spotify app
   - Update website URL to your production domain

3. **Verify SSL/HTTPS**:
   - Spotify requires HTTPS for production redirect URIs
   - Make sure your domain has a valid SSL certificate

## Security Notes

- **Never commit your `.env.local` file** - it contains sensitive credentials
- The Client ID is safe to expose (it's in your frontend code)
- This integration uses OAuth 2.0 Implicit Grant Flow
- Tokens are stored in localStorage (client-side only)
- Tokens expire after 1 hour for security

## API Rate Limits

Spotify has rate limits on their API:

- **Standard Rate Limiting**: 180 requests per minute
- **Web Playback SDK**: 60 requests per minute

QorvexFlow is designed to stay well within these limits, but if you experience issues:
- Avoid rapid button clicking
- Wait a few seconds between actions
- The rate limit resets every minute

## Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)

## Need Help?

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure your Spotify app settings match this guide
4. Try disconnecting and reconnecting Spotify
5. Open an issue on GitHub with details about your problem

---

**Last Updated**: 2025-01-13
**QorvexFlow Version**: 1.0.0
