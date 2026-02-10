import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement basées sur le mode actuel
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    server: {
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      // On définit NODE_ENV explicitement pour React
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Injecte la clé API spécifiquement pour le SDK @google/genai qui attend process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_GOOGLE_GENAI_API_KEY)
    }
  };
});