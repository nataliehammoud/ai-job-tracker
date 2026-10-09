import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#18181b',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
        },
      }}
    />
  </StrictMode>
)