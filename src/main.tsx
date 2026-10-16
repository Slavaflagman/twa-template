import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';

// Создаем манифест прямо в коде через Data URI, чтобы не зависеть от файлов и 404 ошибок!
const manifestObject = {
  url: "https://twa-template-tan.vercel.app",
  name: "TonVia",
  iconUrl: "https://ton.org/download/ton_symbol.png"
};

const manifestDataUrl = `data:application/json,${encodeURIComponent(JSON.stringify(manifestObject))}`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestDataUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);

