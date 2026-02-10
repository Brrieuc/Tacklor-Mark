import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Helper pour accéder aux env vars de manière sécurisée
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

// Utilisation des variables d'environnement Vite
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Vérification stricte de la présence de la clé API
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined" && !firebaseConfig.apiKey.includes("your_api_key");

if (isConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
    } catch (e) {
        console.warn("Erreur d'initialisation Firebase:", e);
    }
} else {
    console.log("Mode Invité : Firebase non configuré (Variables d'environnement manquantes).");
}

export { auth, db, googleProvider };

// Helpers d'Authentification
export const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        throw new Error("Firebase Auth non initialisé (Mode Invité actif). Configurez le fichier .env.");
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Erreur Connexion Google:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erreur Déconnexion:", error);
    }
};