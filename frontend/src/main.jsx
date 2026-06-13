import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles/variables.css';
import './styles/index.css';
import './styles/App.css';
import './styles/responsive.css';
import './styles/components/buttons.css';
import './styles/components/cards.css';
import './styles/components/forms.css';
import './styles/components/tables.css';

const isDesktopShell = typeof window !== 'undefined' && (
  window.desktopApp?.isDesktop ||
  window.location.protocol === 'app:' ||
  window.location.protocol === 'file:'
);
const Router = isDesktopShell ? HashRouter : BrowserRouter;
const routerBasename = isDesktopShell ? undefined : import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router basename={routerBasename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
