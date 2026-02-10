import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Configuration Firebase spécifique (Tacklor Mark)
const firebaseConfig = {
  apiKey: "AIzaSyDVDFY2AHllINoyUMwABQp1TBonUOKaeKE",
  authDomain: "tacklor-mark.firebaseapp.com",
  projectId: "tacklor-mark",
  storageBucket: "tacklor-mark.firebasestorage.app",
  messagingSenderId: "629798377570",
  appId: "1:629798377570:web:29cd040f21b8fe5d4b593b"
};

let app;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
} catch (e) {
    console.error("Erreur d'initialisation Firebase:", e);
    throw e;
}

export { auth, db, googleProvider };

// Helpers d'Authentification
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Erreur Connexion Google:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erreur Déconnexion:", error);
    }
};