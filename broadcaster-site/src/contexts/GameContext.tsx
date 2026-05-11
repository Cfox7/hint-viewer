import { createContext, useContext, useState, useCallback } from 'react';
import type { GameConfig } from '@hint-viewer/shared/games';
import { GAMES, DEFAULT_GAME } from '@hint-viewer/shared/games';

const GAME_STORAGE_KEY = 'hint-viewer-game';

function getInitialGame(): GameConfig {
  const stored = localStorage.getItem(GAME_STORAGE_KEY);
  if (stored) {
    const found = GAMES.find(g => g.id === stored);
    if (found) return found;
  }
  return DEFAULT_GAME;
}

interface GameContextValue {
  game: GameConfig;
  setGame: (game: GameConfig) => void;
  games: GameConfig[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGameState] = useState<GameConfig>(getInitialGame);

  const setGame = useCallback((g: GameConfig) => {
    setGameState(g);
    localStorage.setItem(GAME_STORAGE_KEY, g.id);
  }, []);

  return (
    <GameContext.Provider value={{ game, setGame, games: GAMES }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
