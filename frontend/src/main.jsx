import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/variables.css';
import './styles/index.css';
import './styles/App.css';
import './styles/responsive.css';
import './styles/components/buttons.css';
import './styles/components/forms.css';
import './styles/components/tables.css';
import './styles/components/cards.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
