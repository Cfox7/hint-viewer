import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Config from './pages/Config'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Config />
  </StrictMode>,
)
