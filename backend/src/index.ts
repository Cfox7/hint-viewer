import express from 'express';
import cors from 'cors';
import type { SpoilerLog, SpoilerResponse } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001; // Railway will set PORT automatically

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for now (you can restrict this later)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// In-memory storage (use Redis or database for production)
const spoilerLogs = new Map<string, SpoilerResponse>();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Broadcaster uploads spoiler log
app.post('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  const spoilerData: SpoilerLog = req.body;
  
  const response: SpoilerResponse = {
    data: spoilerData,
    uploadedAt: new Date().toISOString(),
  };
  
  spoilerLogs.set(channelId, response);
  
  console.log(`Spoiler log uploaded for channel ${channelId} at ${response.uploadedAt}`);
  res.json({ success: true, uploadedAt: response.uploadedAt });
});

// Viewers fetch spoiler log
app.get('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  const spoiler = spoilerLogs.get(channelId);
  
  if (!spoiler) {
    return res.status(404).json({ error: 'No spoiler log found for this channel' });
  }
  
  res.json(spoiler);
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
