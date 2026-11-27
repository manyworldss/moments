import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '../index.css'
import './design.css'
import { Design } from './Design'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Design />
  </StrictMode>,
)
