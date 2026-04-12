import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App }        from './app'
import './app/styles/tokens.scss'
import './app/styles/globals.scss'

const root = document.getElementById('root')
if (!root) throw new Error('#root не найден')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
