import { CatchRecord, UserProfile } from "../types";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore";

const LOGBOOK_KEY = 'tacklor_logbook';
const USER_KEY = 'tacklor_user_profile';

// --- Image Compression Logic ---
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with reduced quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Hybrid Logbook Persistence (Async) ---

/**
 * Récupère le carnet de pêche.
 * Si userId est présent, fetch depuis Firebase (Collection 'captures'). Sinon, LocalStorage.
 */
export const getLogbook = async (userId?: string | null): Promise<CatchRecord[]> => {
  // 1. Mode Firebase (Connecté)
  if (userId && db) {
      try {
          const catchesRef = collection(db, "captures");
          // Requête sécurisée : On ne récupère que les captures où userId correspond
          const q = query(
              catchesRef, 
              where("userId", "==", userId),
              orderBy("date", "desc")
          );
          
          const querySnapshot = await getDocs(q);
          
          const records: CatchRecord[] = [];
          querySnapshot.forEach((doc) => {
              // On fusionne l'ID du doc Firestore avec les données
              const data = doc.data();
              // On cast en CatchRecord (le userId est filtré mais non affiché dans l'UI)
              records.push({ ...data, id: doc.id } as CatchRecord);
          });
          return records;
      } catch (e) {
          console.error("Erreur lecture Firestore:", e);
          // Si l'erreur est liée aux indexes manquants (fréquent avec where + orderBy),
          // cela s'affichera dans la console avec un lien pour créer l'index.
          return [];
      }
  }

  // 2. Mode Invité (LocalStorage)
  return new Promise((resolve) => {
      try {
        const stored = localStorage.getItem(LOGBOOK_KEY);
        resolve(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error("Failed to load local logbook", e);
        resolve([]);
      }
  });
};

/**
 * Sauvegarde une prise.
 * Si userId est présent, addDoc vers Firebase (Collection 'captures'). Sinon, LocalStorage.
 * Retourne la liste mise à jour.
 */
export const saveToLogbook = async (newCatch: CatchRecord, userId?: string | null): Promise<CatchRecord[]> => {
  // 1. Mode Firebase (Connecté)
  if (userId && db) {
      try {
          const catchesRef = collection(db, "captures");
          
          // On ajoute le userId au document pour la sécurité
          const docData = {
              ...newCatch,
              userId: userId // Champ essentiel pour les Security Rules
          };

          await addDoc(catchesRef, docData);
          
          // On re-fetch pour avoir la liste à jour et synchronisée
          return await getLogbook(userId);
      } catch (e) {
          console.error("Erreur écriture Firestore:", e);
          throw e;
      }
  }

  // 2. Mode Invité (LocalStorage)
  return new Promise((resolve) => {
      try {
        const currentStored = localStorage.getItem(LOGBOOK_KEY);
        const current = currentStored ? JSON.parse(currentStored) : [];
        const updated = [newCatch, ...current];
        localStorage.setItem(LOGBOOK_KEY, JSON.stringify(updated));
        resolve(updated);
      } catch (e) {
        console.error("LocalStorage error", e);
        // En cas d'erreur (quota), on renvoie ce qu'on a
        const stored = localStorage.getItem(LOGBOOK_KEY);
        resolve(stored ? JSON.parse(stored) : []);
      }
  });
};

// --- User Profile Persistence ---
export const getLocalUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : { name: "Invité", avatarUrl: "" };
  } catch (e) {
    return { name: "Invité", avatarUrl: "" };
  }
};