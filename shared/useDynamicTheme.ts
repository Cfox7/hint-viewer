import { useEffect } from 'react';

/**
 * Dynamically loads a CSS file for the given theme (gameId).
 * Removes the previous theme CSS when the game changes.
 *
 * @param gameId The id of the game/theme (e.g., 'dk64', 'oot').
 * @param cssPath Optional: override the path to the CSS file. Defaults to `/themes/{gameId}.css`.
 */
export function useDynamicTheme(gameId: string | null, cssPath?: (gameId: string) => string) {
  useEffect(() => {
    if (!gameId) return;
    const id = 'dynamic-theme-link';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (link) link.remove();
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = cssPath ? cssPath(gameId) : `/themes/${gameId}.css`;
    document.head.appendChild(link);
    return () => { link?.remove(); };
  }, [gameId, cssPath]);
}
