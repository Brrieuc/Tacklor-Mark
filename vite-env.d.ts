// Manually define ImportMetaEnv to avoid "Cannot find type definition file for 'vite/client'" error
interface ImportMetaEnv {
  readonly VITE_GOOGLE_GENAI_API_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment NodeJS namespace to include API_KEY in ProcessEnv.
// This prevents shadowing the global 'process' variable which causes errors in vite.config.ts,
// while still providing type safety for process.env.API_KEY in the application code.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
