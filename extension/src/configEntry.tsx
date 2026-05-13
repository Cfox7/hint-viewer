import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Config from './pages/Config'
import './themes/base.css'
import './themes/dk64.css'
import './themes/oot.css'

document.documentElement.dataset.theme = 'dk64';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Config />
  </StrictMode>,
)
