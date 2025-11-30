export const API_URL = 'https://hint-viewer-production.up.railway.app';

export const uploadSpoiler = async (channelId: string, json: unknown) => {
  const res = await fetch(`${API_URL}/api/spoiler/${channelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json),
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

export const getSpoiler = async (channelId: string) => {
  const res = await fetch(`${API_URL}/api/spoiler/${channelId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return null;
  return res.json(); // { spoilerData, uploadedAt, revealed }
};

export const deleteSpoiler = (channelId: string) =>
  fetch(`${API_URL}/api/spoiler/${channelId}`, { method: 'DELETE' });

export const deleteHints = (channelId: string) =>
  fetch(`${API_URL}/api/hints/${channelId}`, { method: 'DELETE' });

export const getRevealedHints = (channelId: string) =>
  fetch(`${API_URL}/api/hints/${channelId}`).then((r) => (r.ok ? r.json() : { revealed: [] }));

export const postRevealedHints = (channelId: string, revealedHints: string[]) =>
  fetch(`${API_URL}/api/hints/reveal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId, revealedHints }),
  });