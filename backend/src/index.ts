import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // allow all origins; tighten if needed
app.options('*', cors());
app.use(express.json());

type SpoilerLog = { [k: string]: any };

interface StoredSpoiler {
  spoilerData: SpoilerLog;
  uploadedAt: string;
}

// In-memory stores (will be lost if server restarts)
const spoilerStore: Record<string, StoredSpoiler> = {};
const revealedStore: Record<string, string[]> = {};

// Get spoiler for channel
app.get('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  const stored = spoilerStore[channelId];
  if (!stored) {
    // no spoiler stored -> 404 so clients can treat this as "not found"
    return res.status(404).json({ error: 'Not found' });
  }
  const revealed = revealedStore[channelId] ?? [];
  return res.json({
    spoilerData: stored.spoilerData,
    uploadedAt: stored.uploadedAt ?? null,
    revealed,
  });
});

// Upload or replace spoiler
app.post('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  const spoilerData = req.body;
  if (!spoilerData) {
    return res.status(400).json({ error: 'Missing spoiler data' });
  }
  const uploadedAt = new Date().toISOString();
  spoilerStore[channelId] = { spoilerData, uploadedAt };
  // reset revealed hints on new upload
  revealedStore[channelId] = [];
  return res.json({ ok: true, uploadedAt });
});

// Delete spoiler
app.delete('/api/spoiler/:channelId', (req, res) => {
  const { channelId } = req.params;
  delete spoilerStore[channelId];
  delete revealedStore[channelId];
  // return 204 No Content; subsequent GET will return 404
  return res.status(204).end();
});

// Get revealed hints for channel
app.get('/api/hints/:channelId', (req, res) => {
  const { channelId } = req.params;
  return res.json({ revealed: revealedStore[channelId] ?? [] });
});

// Delete revealed hints for channel
app.delete('/api/hints/:channelId', (req, res) => {
  const { channelId } = req.params;
  revealedStore[channelId] = [];
  return res.json({ ok: true });
});

// Set revealed hints (replace)
app.post('/api/hints/reveal', (req, res) => {
  const { channelId, revealedHints } = req.body as {
    channelId?: string;
    revealedHints?: string[];
  };
  if (!channelId || !Array.isArray(revealedHints)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  revealedStore[channelId] = revealedHints;
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${PORT}`);
});
