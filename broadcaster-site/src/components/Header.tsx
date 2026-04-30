import React from 'react';
import { FaUpload, FaTasks, FaSignOutAlt } from 'react-icons/fa';
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
            <img src="/hintViewer.png" alt="Hint Viewer Icon" className="header-icon" />
            <div>
              <h1>{game.displayName}</h1>
              <h2>Hint Viewer</h2>
            </div>
          </div>
        </Link>

        {user && (
          <div className="user-info-header">
            <a href={`https://twitch.tv/${user.display_name}`} target="_blank" rel="noopener noreferrer"><img src={user.profile_image_url} alt={user.display_name} /></a>
            <div>
              <strong>{user.display_name}</strong>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="twitch-btn"
              aria-label="Go to upload"
              style={{ marginRight: '0.5rem' }}
            >
              <FaUpload style={{ marginRight: 4, verticalAlign: 'middle' }} /> Upload
            </button>
            <button
              onClick={() => navigate('/create')}
              className="twitch-btn"
              aria-label="Go to create"
              style={{ marginRight: '0.5rem' }}
            >
              <FaTasks style={{ marginRight: 4, verticalAlign: 'middle' }} /> Create
            </button>
            {logout && (
              <button onClick={logout} className="twitch-btn">
                <FaSignOutAlt style={{ marginRight: 4, verticalAlign: 'middle' }} /> Logout
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