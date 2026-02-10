import { CatchRecord } from "../types";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

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

// --- Firestore Persistence ---

/**
 * Récupère uniquement les captures de l'utilisateur connecté depuis la collection "captures".
 * Correction: Tri côté client pour éviter l'erreur "Missing Index" de Firestore sur les requêtes composées.
 */
export const fetchUserCaptures = async (userId?: string | null): Promise<CatchRecord[]> => {
  // Sécurité côté client : Si pas d'ID, on retourne vide immédiatement.
  if (!userId || !db) {
      return [];
  }

  try {
      const catchesRef = collection(db, "captures");
      
      // Requête simple : Filtrer par userId uniquement.
      // Note: On ne met pas orderBy("date") ici pour éviter de devoir créer un index composite manuellement dans Firebase Console.
      const q = query(
          catchesRef, 
          where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const records: CatchRecord[] = [];
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          // On cast les données Firestore vers notre type CatchRecord
          records.push({ ...data, id: doc.id } as CatchRecord);
      });

      // Tri côté client : Du plus récent au plus ancien
      return records.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
      });

  } catch (e) {
      console.error("Erreur lors de la récupération des captures:", e);
      // En cas d'erreur (ex: quota, network), on retourne un tableau vide pour ne pas crasher l'UI
      return [];
  }
};

/**
 * Sauvegarde une prise dans la collection "captures" de Firebase.
 * Utilise serverTimestamp pour un horodatage fiable.
 */
export const saveCapture = async (newCatch: CatchRecord, userId?: string | null): Promise<CatchRecord[]> => {
  if (!userId || !db) {
      throw new Error("Utilisateur non authentifié.");
  }

  try {
      const catchesRef = collection(db, "captures");
      
      // On sépare l'ID temporaire généré localement (qui sera inutile) des autres données
      const { id, ...dataToSave } = newCatch;

      // Construction du document à sauvegarder
      const docData = {
          ...dataToSave,
          userId: userId, 
          createdAt: serverTimestamp() // Horodatage serveur automatique
      };

      await addDoc(catchesRef, docData);
      
      // On recharge la liste mise à jour pour l'affichage
      return await fetchUserCaptures(userId);
  } catch (e) {
      console.error("Erreur lors de la sauvegarde de la capture:", e);
      throw e;
  }
};

/**
 * Supprime une prise de la collection "captures" de Firebase.
 */
export const deleteCapture = async (catchId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    await deleteDoc(doc(db, "captures", catchId));
  } catch (e) {
    console.error("Erreur lors de la suppression du document:", e);
    throw e;
  }
};