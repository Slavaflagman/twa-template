import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifest="https://twa-template-tan.vercel.app/tonconnect-manifest.json"
      uiPreferences={{ theme: 'DARK' }}
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);
