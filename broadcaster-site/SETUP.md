# Broadcaster Site Setup

This site allows broadcasters to upload spoiler logs for the DK64 Randomizer Twitch extension.

## Twitch OAuth Setup

1. **Create a Twitch Application**
   - Go to https://dev.twitch.tv/console/apps
   - Click "Register Your Application"
   - Fill in the details:
     - **Name**: DK64 Randomizer Broadcaster Site (or any name you prefer)
     - **OAuth Redirect URLs**: 
       - For local development: `http://localhost:3000`
       - For production: Your deployed URL (e.g., `https://yourdomain.com`)
     - **Category**: Game Integration or Website Integration
   - Click "Create"

2. **Get Your Client ID**
   - After creating the app, click "Manage"
   - Copy the **Client ID**

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your Twitch Client ID:
     ```
     VITE_TWITCH_CLIENT_ID=your_client_id_here
     VITE_REDIRECT_URI=http://localhost:3000
     ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **For Production Deployment**
   - Update `VITE_REDIRECT_URI` in your `.env` file to match your production URL
   - Make sure to add the production URL to the OAuth Redirect URLs in your Twitch app settings
   - Build and deploy:
     ```bash
     npm run build
     ```

## How It Works

1. Broadcasters click "Login with Twitch"
2. They authenticate via Twitch OAuth
3. The app automatically retrieves their Twitch Channel ID
4. They can then upload their spoiler log JSON file
5. The spoiler log is stored on the backend and made available to the Twitch extension

## Security Notes

- The OAuth flow uses the implicit grant flow, which is suitable for client-side applications
- Access tokens are stored in localStorage
- The app only requests the `user:read:email` scope to get basic user information
- No sensitive data is stored on the server
