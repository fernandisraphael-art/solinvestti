
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { SystemProvider } from './contexts/SystemContext';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <SystemProvider>
        <App />
      </SystemProvider>
    </AuthProvider>
  </React.StrictMode>
);
