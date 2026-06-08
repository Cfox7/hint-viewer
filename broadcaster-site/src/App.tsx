import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import TwitchLogin from './components/TwitchLogin';
import Upload from './components/Upload';
import Create from './components/Create';
import Header from './components/Header';
import { Footer } from './components/Footer';
import { GameProvider, useGame } from './contexts/GameContext';
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
      {(user, logout, loginButton) => (
        <div className="app-layout">
          <Header
            user={user ?? undefined}
            logout={logout}
            loginButton={!user ? loginButton : undefined}
          />
          <div className="app-body">
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
