import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Admin from './Admin';

// Secret admin URL. Change this slug (and the backend ADMIN_PASSWORD) to keep it private.
const ADMIN_PATH = '/admin-tramonto-7k9x';

const root = ReactDOM.createRoot(document.getElementById('root'));
const isAdmin = window.location.pathname === ADMIN_PATH;

root.render(
  <React.StrictMode>
    {isAdmin ? <Admin /> : <App />}
  </React.StrictMode>
);
