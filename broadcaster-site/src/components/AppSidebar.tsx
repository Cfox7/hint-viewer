import React, { useState } from 'react';
import { FaHome, FaUpload, FaTasks, FaSignOutAlt, FaGamepad, FaTwitch, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import GameSwitcher from './GameSwitcher';
import { ShopTrackerOffcanvas } from './shop-tracker/ShopTrackerOffcanvas';

interface AppSidebarProps {
  user?: {
    profile_image_url: string;
    display_name: string;
    id: string;
  };
  logout?: () => void;
  onLogin?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ user, logout, onLogin }) => {
  const navigate = useNavigate();
  const { game } = useGame();
  const [showShopTracker, setShowShopTracker] = useState(false);
  return (
    <>
    <nav className="app-sidebar">
      <div className="app-sidebar-top">
        {user && (
          <>
            <div className="app-sidebar-user">
              <a href={`https://twitch.tv/${user.display_name}`} target="_blank" rel="noopener noreferrer">
                <img src={user.profile_image_url} alt={user.display_name} className="app-sidebar-avatar" />
                <strong className="app-sidebar-username">{user.display_name}</strong>
              </a>
            </div>

            <div className="app-sidebar-nav">
              <button
                onClick={() => navigate('/')}
                className="app-sidebar-nav-btn"
                title="Home"
              >
                <FaHome />
                <span className="app-sidebar-nav-label">Home</span>
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="app-sidebar-nav-btn"
                title="Upload"
              >
                <FaUpload />
                <span className="app-sidebar-nav-label">Upload</span>
              </button>
              <button
                onClick={() => navigate('/create')}
                className="app-sidebar-nav-btn"
                title="Create"
              >
                <FaTasks />
                <span className="app-sidebar-nav-label">Create</span>
              </button>
              {game.id === 'dk64' && (
                <button
                  onClick={() => setShowShopTracker(true)}
                  className="app-sidebar-nav-btn"
                  title="Shops"
                >
                  <FaStore />
                  <span className="app-sidebar-nav-label">Shops</span>
                </button>
              )}
              <div className="app-sidebar-game-switcher" title="Game">
                <FaGamepad />
                <span className="app-sidebar-nav-label">Game</span>
                <GameSwitcher channelId={user?.id} />
              </div>
              {logout && (
                <button
                  onClick={logout}
                  className="app-sidebar-nav-btn"
                  title="Logout"
                >
                  <FaSignOutAlt />
                  <span className="app-sidebar-nav-label">Logout</span>
                </button>
              )}
            </div>
          </>
        )}

        {!user && onLogin && (
          <div className="app-sidebar-nav">
            <button
              onClick={onLogin}
              className="app-sidebar-nav-btn"
              title="Login with Twitch"
            >
              <FaTwitch />
              <span className="app-sidebar-nav-label">Login</span>
            </button>
          </div>
        )}
      </div>
    </nav>
    {user && game.id === 'dk64' && (
      <ShopTrackerOffcanvas
        show={showShopTracker}
        onHide={() => setShowShopTracker(false)}
        channelId={user.id}
      />
    )}
  </>
  );
};

export default AppSidebar;
