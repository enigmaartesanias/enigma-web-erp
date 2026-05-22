import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/styles.css';
import './styles/index.css';
// Importa esto para registrar el SW
import { registerSW } from 'virtual:pwa-register';

// 1. Registra el Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nueva versión disponible');
  },
  onOfflineReady() {
    console.log('App lista para modo offline');
  },
});

// 2. Bloqueamos el prompt automático
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);