import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Erreur fatale lors du rendu de l'application :", error);
  // Affiche un message d'erreur visible si le rendu React échoue
  rootElement.innerHTML = '<div style="color: white; padding: 20px; text-align: center; font-family: sans-serif;"><h1>Une erreur est survenue au démarrage.</h1><p>Veuillez vérifier la console pour plus de détails.</p></div>';
}