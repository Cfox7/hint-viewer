import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Config from './pages/Config'
import './index.css'
import './themes/dk64.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Config />
  </StrictMode>,
)
