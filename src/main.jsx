import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'zmp-ui/zaui.css';
import './index.css'
import App from './App.jsx'

const container = document.getElementById('app') || document.getElementById('root');
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
