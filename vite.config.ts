import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement basées sur le mode actuel
  const env = loadEnv(mode, process.cwd(), '');

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
      // Évite "process is not defined" dans le navigateur
      'process.env': {},
      // Injecte la clé API spécifiquement pour le SDK @google/genai qui attend process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_GOOGLE_GENAI_API_KEY)
    }
  };
});