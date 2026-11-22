import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoot from './AppRoot';
import './tailwind.css';
import './styles.css';
import './reference.css';
import './motion.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><AppRoot /></React.StrictMode>
);
