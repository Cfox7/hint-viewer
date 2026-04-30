import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TwitchLogin from './components/TwitchLogin';
import Upload from './components/Upload';
import Create from './components/Create';
import Header from './components/Header';
import { LevelNav } from './components/LevelNav';
import { NavProvider, useNav } from './contexts/NavContext';
import { GameProvider, useGame } from './contexts/GameContext';
import '../public/themes/dk64.css';

function AppBody() {
  const { slides, activeIndex, setActiveIndex } = useNav();
  const { game } = useGame();
  const HomeComponent = game.homeComponent;
  const location = useLocation();
  const showSidebar =
    (location.pathname === '/upload' || location.pathname === '/create') &&
    slides.length > 0;

  const [mode, setMode] = useState<'sidebar' | 'offcanvas'>(
    window.innerWidth >= 1400 ? 'sidebar' : 'offcanvas'
  );
  useEffect(() => {
    const handler = () => setMode(window.innerWidth >= 1400 ? 'sidebar' : 'offcanvas');
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return (
    <TwitchLogin>
      {(user, logout, loginButton) => (
        <div className="app-layout">
          <Header
            user={user ?? undefined}
            logout={logout}
            loginButton={!user ? loginButton : undefined}
          />
          <div className="app-body">
            {showSidebar && (
              <LevelNav
                slides={slides}
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
                levelDisplayNames={game.levelDisplayNames}
                mode={mode}
              />
            )}
            <main className="main-content">
              <div className="content-card">
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
        </div>
      )}
    </TwitchLogin>
  );
}

function App() {
  return (
    <GameProvider>
      <NavProvider>
        <BrowserRouter>
          <AppBody />
        </BrowserRouter>
      </NavProvider>
    </GameProvider>
  );
}

export default App;
