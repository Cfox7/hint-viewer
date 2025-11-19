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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
