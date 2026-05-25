export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('twitch_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const uploadSpoiler = async (channelId: string, game: string, json: Record<string, unknown>) => {
  const res = await fetch(`${API_URL}/api/spoiler/${channelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ game, ...json }),
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

export const deleteSpoiler = (channelId: string, game: string) =>
  fetch(`${API_URL}/api/spoiler/${channelId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ game }),
  });

export const getState = async (channelId: string) => {
  const res = await fetch(`${API_URL}/api/state/${channelId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ game: string | null; spoilerData: unknown; uploadedAt: string | null; revealed: string[]; completed: string[]; hinted: Record<string, string>; shopTracker: Record<string, unknown>; seedSettings: Record<string, unknown> }>;
};

export const postState = (channelId: string, revealedHints: string[], completedHints: string[], hintedItems: Record<string, string>) =>
  fetch(`${API_URL}/api/state/${channelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ channelId, revealedHints, completedHints, hintedItems }),
  });

export const postShopTracker = (channelId: string, shopTracker: Record<string, unknown>) =>
  fetch(`${API_URL}/api/state/${channelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ channelId, shopTracker }),
  });

export const postSeedSettings = (channelId: string, seedSettings: Record<string, unknown>) =>
  fetch(`${API_URL}/api/state/${channelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ channelId, seedSettings }),
  });