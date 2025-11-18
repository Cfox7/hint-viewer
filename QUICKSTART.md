# Quick Start Guide

## Installation

```bash
npm install
```

## Development

### 1. Deploy Backend to Railway

The backend needs to be publicly accessible for the Twitch extension to work.

```bash
cd backend
railway up
```

After deployment, get your Railway URL:
```bash
railway domain
```

You'll get a URL like `https://your-app.up.railway.app`

### 2. Update API URLs

Update the API URL in both apps with your Railway URL:

**extension/src/components/Upload.tsx:**
```typescript
const API_URL = 'https://your-app.up.railway.app';
```

**broadcaster-site/src/App.tsx:**
```typescript
const API_URL = 'https://your-app.up.railway.app';
```

### 3. Start the Broadcaster Site (Terminal 1)

```bash
npm run dev:broadcaster
```

Broadcaster site will run on `http://localhost:3000`

### 4. Start the Extension with Python Server (Terminal 2)

```bash
cd extension
python3 server.py
```

Extension will be served via the Python server and accessible through Twitch's testing tools.

## Testing the Flow

1. **Broadcaster uploads spoiler log:**
   - Go to `http://localhost:3000`
   - Enter your Twitch Channel ID (get it from [streamweasels.com](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/))
   - Upload a DK64 Randomizer spoiler log JSON file
   - You should see a success message

2. **Viewer sees hints:**
   - Open the extension panel in Twitch
   - The extension will automatically poll the Railway API every 30 seconds
   - Hints from the uploaded spoiler log will be displayed

## Architecture

```
┌─────────────────────┐
│  Broadcaster Site   │
│  (localhost:3000)   │
└──────────┬──────────┘
           │ POST /api/spoiler/:channelId
           ▼
┌─────────────────────┐
│   Backend API       │
│   (Railway.app)     │◄──────────┐
└─────────────────────┘            │
                                   │ GET /api/spoiler/:channelId
                                   │ (polls every 30s)
                        ┌──────────┴──────────┐
                        │  Extension Panel    │
                        │   (Twitch.tv)       │
                        └─────────────────────┘
```

## Production Deployment

### Backend (Railway)
Already deployed! Just run:
```bash
cd backend
railway up
```

### Broadcaster Site
Deploy to Vercel, Netlify, or any static hosting:
```bash
npm run build:broadcaster
```

### Extension
1. Build the extension:
   ```bash
   npm run build:extension
   ```

2. Upload the `dist` folder to Twitch Developer Console

3. Make sure the API_URL points to your Railway backend
