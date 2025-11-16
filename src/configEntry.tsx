import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Config from './pages/Config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Config />
  </StrictMode>,
)
