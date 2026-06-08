import { useMemo, useCallback } from 'react';

interface UseCrossLinksOptions {
  hints: Record<string, string>;
  hiddenLocations: Set<string>;
  revealedHints: Set<string>;
  completedHints: Set<string>;
  onToggleReveal: (location: string) => void;
  onToggleComplete: (location: string) => void;
}

export function useCrossLinks({
  hints,
  hiddenLocations,
  revealedHints,
  completedHints,
  onToggleReveal,
  onToggleComplete,
}: UseCrossLinksOptions) {
  const textToHiddenLocations = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const loc of hiddenLocations) {
      const cleaned = (hints[loc] || '').split('|')[0].trim();
      if (!cleaned) continue;
      const arr = map.get(cleaned) || [];
      arr.push(loc);
      map.set(cleaned, arr);
    }
    return map;
  }, [hints, hiddenLocations]);

  const revealWithSync = useCallback(
    (location: string) => {
      const isCurrentlyRevealed = revealedHints.has(location);
      onToggleReveal(location);

      const cleaned = (hints[location] || '').split('|')[0].trim();
      const hiddenDuplicates = textToHiddenLocations.get(cleaned) || [];
      for (const loc of hiddenDuplicates) {
        const locRevealed = revealedHints.has(loc);
        if (!isCurrentlyRevealed && !locRevealed) onToggleReveal(loc);
        if (isCurrentlyRevealed && locRevealed) onToggleReveal(loc);
      }
    },
    [hints, revealedHints, onToggleReveal, textToHiddenLocations],
  );

  const completeWithSync = useCallback(
    (location: string) => {
      const isCurrentlyCompleted = completedHints.has(location);
      onToggleComplete(location);

      const cleaned = (hints[location] || '').split('|')[0].trim();
      const hiddenDuplicates = textToHiddenLocations.get(cleaned) || [];
      for (const loc of hiddenDuplicates) {
        const locCompleted = completedHints.has(loc);
        if (!isCurrentlyCompleted && !locCompleted) onToggleComplete(loc);
        if (isCurrentlyCompleted && locCompleted) onToggleComplete(loc);
      }
    },
    [hints, completedHints, onToggleComplete, textToHiddenLocations],
  );

  return { revealWithSync, completeWithSync };
}
