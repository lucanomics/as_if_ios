import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// PWA 서비스 워커 등록은 vite-plugin-pwa(injectRegister: 'auto')가 처리한다.
