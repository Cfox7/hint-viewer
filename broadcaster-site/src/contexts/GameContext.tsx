import { createContext, useContext, useState } from 'react';
import type { GameConfig } from '@hint-viewer/shared/games';
import { GAMES, DEFAULT_GAME } from '@hint-viewer/shared/games';

interface GameContextValue {
  game: GameConfig;
  setGame: (game: GameConfig) => void;
  games: GameConfig[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<GameConfig>(DEFAULT_GAME);
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
