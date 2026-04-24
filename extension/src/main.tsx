import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import Panel from './pages/Panel'
import { GameProvider } from './contexts/GameContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <Panel />
    </GameProvider>
  </StrictMode>,
)
