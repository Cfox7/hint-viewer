import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Panel from './pages/Panel'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Panel />
  </StrictMode>,
)
