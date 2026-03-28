import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from '../popup/PopupApp';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
);
