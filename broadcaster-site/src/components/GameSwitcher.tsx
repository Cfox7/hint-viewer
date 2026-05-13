import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useNav } from '../contexts/NavContext';
import { deleteSpoiler, getState } from '../api/spoilerApi';
import { ConfirmModal } from './ConfirmModal';
import type { GameConfig } from '@hint-viewer/shared/games';

interface GameSwitcherProps {
  channelId?: string;
}

const GameSwitcher: React.FC<GameSwitcherProps> = ({ channelId }) => {
  const { game, setGame, games } = useGame();
  const { setSlides, setActiveIndex } = useNav();
  const navigate = useNavigate();
  const [pendingGame, setPendingGame] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!channelId) return;
    getState(channelId).then((data) => {
      if (data?.game) {
        const stored = games.find((g) => g.id === data.game);
        if (stored && stored.id !== game.id) setGame(stored);
      }
    });
  }, [channelId]);

  const handleConfirm = async () => {
    if (!pendingGame) return;
    setLoading(true);
    try {
      if (channelId) {
        await deleteSpoiler(channelId, pendingGame.id);
      }
      setGame(pendingGame);
      setSlides([]);
      setActiveIndex(0);
      setPendingGame(null);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="game-switcher">
        <label className="game-switcher-label" htmlFor="game-switcher">Game</label>
        <select
          id="game-switcher"
        className="game-switcher-select"
        value={game.id}
        onChange={(e) => {
          const selected = games.find((g) => g.id === e.target.value);
          if (selected && selected.id !== game.id) {
            setPendingGame(selected);
          }
        }}
      >
        {games.map((g) => (
          <option key={g.id} value={g.id}>
            {g.displayName}
          </option>
        ))}
        </select>
      </div>
      <ConfirmModal
        show={pendingGame !== null}
        loading={loading}
        message="Changing games will clear any existing spoiler logs and hints. Are you sure you want to continue?"
        confirmLabel="Switch Game"
        loadingText="Switching..."
        onCancel={() => setPendingGame(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default GameSwitcher;
