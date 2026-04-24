import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

interface HeaderProps {
  user?: {
    profile_image_url: string;
    display_name: string;
    id: string;
  };
  logout?: () => void;
  loginButton?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ user, logout, loginButton }) => {
  const navigate = useNavigate();
  const { game } = useGame();
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="nav-link" style={{ marginRight: '0.5rem' }}>
          <div className="header-title">
            <img src="/hintViewer.png" alt="Hint Viewer Icon" style={{ height: 48, width: 48 }} />
            <div>
              <h1>{game.displayName}</h1>
              <h2>Hint Viewer</h2>
            </div>
          </div>
        </Link>

        {user && (
          <div className="user-info-header">
            <img src={user.profile_image_url} alt={user.display_name} />
            <div>
              <strong>{user.display_name}</strong>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="twitch-btn"
              aria-label="Go to upload"
              style={{ marginRight: '0.5rem' }}
            >
              Upload
            </button>
            {logout && (
              <button onClick={logout} className="twitch-btn">
                Logout
              </button>
            )}
          </div>
        )}

        {!user && loginButton && (
          <div className="user-info-header">
            {loginButton}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;