import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

interface SpoilerLog {
  [key: string]: any;
}

interface SpoilerResponse {
  data: SpoilerLog;
  uploadedAt: string;
}

const spoilerLogs = new Map<string, SpoilerResponse>();

// Store revealed hints per channel
const revealedHints = new Map<string, string[]>();

// POST - Upload spoiler log
app.post('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  const spoilerData: SpoilerLog = req.body;
  
  const response: SpoilerResponse = {
    data: spoilerData,
    uploadedAt: new Date().toISOString()
  };
  
  spoilerLogs.set(channelId, response);
  res.json(response);
});

// GET - Retrieve spoiler log
app.get('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  const spoilerLog = spoilerLogs.get(channelId);
  
  if (!spoilerLog) {
    return res.status(404).json({ error: 'No spoiler log found for this channel' });
  }
  
  res.json(spoilerLog);
});

// DELETE - Clear spoiler log
app.delete('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  
  if (spoilerLogs.has(channelId)) {
    spoilerLogs.delete(channelId);
    res.json({ success: true, message: 'Spoiler log deleted' });
  } else {
    res.status(404).json({ error: 'No spoiler log found for this channel' });
  }
});

// POST - Update revealed hints
app.post('/api/hints/reveal', (req, res) => {
  const { channelId, revealedHints: hints } = req.body;
  if (!channelId || !Array.isArray(hints)) {
    return res.status(400).json({ error: 'channelId and revealedHints are required' });
  }
  revealedHints.set(channelId, hints);
  res.json({ success: true });
});

// GET - Retrieve revealed hints
app.get('/api/hints/:channelId', (req, res) => {
  const { channelId } = req.params;
  const hints = revealedHints.get(channelId) || [];
  res.json({ revealedHints: hints });
});

// DELETE - Clear revealed hints for a channel
app.delete('/api/hints/:channelId', (req, res) => {
  const { channelId } = req.params;
  revealedHints.delete(channelId);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
