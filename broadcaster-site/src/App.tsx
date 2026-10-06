import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import TwitchLogin from './components/TwitchLogin';
import Upload from './components/Upload';
import Create from './components/Create';
import AppSidebar from './components/AppSidebar';
import { Footer } from './components/Footer';
import { GameProvider, useGame } from './contexts/GameContext';
import { Link } from 'react-router-dom';
import './themes/base.css';
import './themes/dk64.css';
import './themes/oot.css';

function AppBody() {
  const { game } = useGame();
  useEffect(() => {
    document.documentElement.dataset.theme = game.id;
  }, [game.id]);
  const HomeComponent = game.homeComponent;

  return (
    <TwitchLogin>
      {(user, logout, login) => (
        <div className="app-layout">
          <AppSidebar
            user={user ?? undefined}
            logout={logout}
            onLogin={!user ? login : undefined}
          />
          <div className="app-body">
            <main className="main-content">
              <div className="content-card">
                <Link to="/" className="hint-viewer-header">
                  <img src="/hintViewer.png" alt="Hint Viewer" className="hint-viewer-header-icon" />
                  <div className="hint-viewer-header-text">
                    <h1>{game.displayName}</h1>
                    <h2>Hint Viewer</h2>
                  </div>
                </Link>
                <div className="container">
                  <Routes>
                    <Route path="/" element={<HomeComponent />} />
                    <Route
                      path="/upload"
                      element={user ? <Upload channelId={user.id} /> : <Navigate to="/" replace />}
                    />
                    <Route
                      path="/create"
                      element={user ? <Create channelId={user.id} /> : <Navigate to="/" replace />}
                    />
                  </Routes>
                </div>
              </div>
            </main>
          </div>
          <Footer />
        </div>
      )}
    </TwitchLogin>
  );
}

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <AppBody />
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
