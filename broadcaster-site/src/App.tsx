import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TwitchLogin from './components/TwitchLogin';
import Upload from './components/Upload';
import Header from './components/Header';
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <TwitchLogin>
          {(user, logout, loginButton) => (
            <>
              <Header
                user={user ?? undefined}
                logout={logout}
                loginButton={!user ? loginButton : undefined}
              />
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
            </>
          )}
        </TwitchLogin>
      </div>
    </BrowserRouter>
  );
}

export default App;
