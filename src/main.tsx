import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';

// Вшиваем манифест прямо в код, чтобы приложение не зависело от внешних файлов и серверов
const manifestObj = {
  url: "https://twa-template-tan.vercel.app",
  name: "TonVia",
  iconUrl: "https://ton.org/download/ton_symbol.png"
};

const manifestUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(manifestObj))}`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);
