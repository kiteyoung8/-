
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Use a named import for App as the project follows a named export convention and App.tsx likely lacks a default export.
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
