export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('twitch_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const uploadSpoiler = async (channelId: string, json: unknown) => {
  const res = await fetch(`${API_URL}/api/spoiler/${channelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
  fetch(`${API_URL}/api/spoiler/${channelId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

export const deleteHints = (channelId: string) =>
  fetch(`${API_URL}/api/hints/${channelId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

export const getRevealedHints = (channelId: string) =>
  fetch(`${API_URL}/api/hints/${channelId}`).then((r) => (r.ok ? r.json() : { revealed: [] }));

export const postRevealedHints = (channelId: string, revealedHints: string[]) =>
  fetch(`${API_URL}/api/hints/reveal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ channelId, revealedHints }),
  });