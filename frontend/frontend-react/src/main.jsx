import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

// ponto de entrada principal da aplicacao react
createRoot(document.getElementById('root')).render(<App />);
