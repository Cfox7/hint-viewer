# DK64 Randomizer Hint Viewer

A monorepo containing the Twitch extension and broadcaster website for DK64 Randomizer hint viewing.

## Structure

- **extension/** - Twitch extension for viewers to see hints
- **broadcaster-site/** - Web app for broadcasters to upload spoiler logs
- **backend/** - Express API server that stores and serves spoiler logs
- **shared/** - Shared TypeScript types used across all apps

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces.

### 2. Start the Backend API

```bash
npm run dev:backend
```

The API will run on `http://localhost:3001`

### 3. Start the Broadcaster Site

```bash
npm run dev:broadcaster
```

The broadcaster site will run on `http://localhost:3000`

### 4. Start the Extension (for development)

```bash
npm run dev:extension
```

The extension will run on `http://localhost:5173` (or configured port)

## Usage

### For Broadcasters

1. Go to the broadcaster website
2. Enter your Twitch Channel ID
3. Upload your DK64 Randomizer spoiler log JSON file
4. The hints will be pushed to all viewers watching your stream

### For Viewers

The Twitch extension will automatically poll the API and display hints when available.

## Building for Production

```bash
npm run build:all
```

This builds all workspaces.

