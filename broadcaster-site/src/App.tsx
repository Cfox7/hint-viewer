import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TwitchLogin from './components/TwitchLogin';
import Upload from './components/Upload';
import Header from './components/Header';
import Home from './components/Home';
import { LevelNav } from './components/LevelNav';
import { NavProvider, useNav } from './contexts/NavContext';
import { levelDisplayNames } from '@hint-viewer/shared/level_utils';
import './App.css';

function AppBody() {
  const { slides, activeIndex, setActiveIndex } = useNav();
  const location = useLocation();
  const showSidebar = location.pathname === '/upload' && slides.length > 0;

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
                levelDisplayNames={levelDisplayNames}
                mode={mode}
              />
            )}
            <main className="main-content">
              <div className="content-card">
                <div className="container">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/upload"
                      element={user ? <Upload channelId={user.id} /> : <Navigate to="/" replace />}
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
    <NavProvider>
      <BrowserRouter>
        <AppBody />
      </BrowserRouter>
    </NavProvider>
  );
}

export default App;
