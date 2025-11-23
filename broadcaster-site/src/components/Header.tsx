import React from 'react';

interface HeaderProps {
  user?: {
    profile_image_url: string;
    display_name: string;
    id: string;
  };
  logout?: () => void;
  loginButton?: React.ReactNode; // Add this prop
}

const Header: React.FC<HeaderProps> = ({ user, logout, loginButton }) => (
  <header className="app-header">
    <div className="header-content">
      <div className="header-title">
        <h1>🍌 DK64 Randomizer</h1>
        <h2>Broadcaster Upload</h2>
      </div>
      {user && logout && (
        <div className="user-info-header">
          <img src={user.profile_image_url} alt={user.display_name} />
          <div>
            <strong>{user.display_name}</strong>
            <small>Channel ID: {user.id}</small>
          </div>
          <button onClick={logout} className="twitch-btn">
            Logout
          </button>
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

export default Header;