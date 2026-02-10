import { CatchRecord, LeaderboardEntry } from "../types";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, deleteDoc, doc, updateDoc, setDoc, limit } from "firebase/firestore";
import { User } from "firebase/auth";

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

// --- Leaderboard Logic (Cloud Architect Requirement) ---

/**
 * Calcule le "Niveau" affiché dans le leaderboard basé sur le nombre de prises.
 * C'est une logique simplifiée pour l'affichage.
 */
const calculateUserLevel = (catchCount: number): string => {
    if (catchCount >= 100) return "Légende";
    if (catchCount >= 50) return "Pro";
    if (catchCount >= 10) return "Amateur";
    return "Débutant";
};

/**
 * Met à jour le document de l'utilisateur dans la collection publique 'leaderboard'.
 * Cette fonction est appelée après chaque opération d'écriture sur 'captures'.
 * SECURITY: On ne copie JAMAIS la localisation précise.
 */
const updateUserLeaderboardStats = async (user: User) => {
    try {
        // 1. Récupérer toutes les captures de l'utilisateur pour recalculer les totaux
        // Note: Dans une vraie Cloud Function, on utiliserait un trigger Firestore increment/decrement.
        // Ici, en client-side, on recalcule pour garantir la consistance.
        const captures = await fetchUserCaptures(user.uid);
        
        const totalLength = captures.reduce((acc, curr) => acc + (curr.length_cm || 0), 0);
        const totalWeight = captures.reduce((acc, curr) => acc + (curr.weight_kg || 0), 0);
        const catchCount = captures.length;

        // 2. Préparer les données publiques
        const leaderboardData: LeaderboardEntry = {
            userId: user.uid,
            displayName: user.displayName || "Pêcheur Anonyme",
            photoURL: user.photoURL || "",
            total_length_cm: totalLength,
            total_weight_kg: totalWeight, // Ajout du poids
            catch_count: catchCount,
            level: calculateUserLevel(catchCount),
            last_updated: serverTimestamp()
        };

        // 3. Écrire dans la collection 'leaderboard' (ID du doc = ID de l'user)
        const leaderboardRef = doc(db, "leaderboard", user.uid);
        await setDoc(leaderboardRef, leaderboardData, { merge: true });

    } catch (e) {
        console.error("Erreur lors de la mise à jour du leaderboard:", e);
        // On ne throw pas ici pour ne pas bloquer l'UX principale si le leaderboard échoue
    }
};

/**
 * Récupère le Top 10 du classement global selon un critère de tri.
 * @param sortBy Champ de tri : 'total_length_cm', 'total_weight_kg', 'catch_count'
 */
export const fetchLeaderboard = async (sortBy: 'total_length_cm' | 'total_weight_kg' | 'catch_count' = 'total_length_cm'): Promise<LeaderboardEntry[]> => {
    if (!db) return [];

    try {
        const leaderboardRef = collection(db, "leaderboard");
        // Query: Trie par le champ demandé décroissant, limite à 10
        const q = query(leaderboardRef, orderBy(sortBy, "desc"), limit(10));
        
        const querySnapshot = await getDocs(q);
        const entries: LeaderboardEntry[] = [];
        
        querySnapshot.forEach((doc) => {
            entries.push(doc.data() as LeaderboardEntry);
        });

        return entries;
    } catch (e) {
        console.error("Erreur lors du chargement du classement:", e);
        return [];
    }
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
 * Met à jour le leaderboard ensuite.
 */
export const saveCapture = async (newCatch: CatchRecord, user: User): Promise<CatchRecord[]> => {
  if (!user || !db) {
      throw new Error("Utilisateur non authentifié.");
  }

  try {
      const catchesRef = collection(db, "captures");
      
      // On sépare l'ID temporaire généré localement (qui sera inutile) des autres données
      const { id, ...dataToSave } = newCatch;

      // Construction du document à sauvegarder
      const docData = {
          ...dataToSave,
          userId: user.uid, 
          createdAt: serverTimestamp() // Horodatage serveur automatique
      };

      await addDoc(catchesRef, docData);
      
      // Sync Leaderboard
      await updateUserLeaderboardStats(user);

      // On recharge la liste mise à jour pour l'affichage
      return await fetchUserCaptures(user.uid);
  } catch (e) {
      console.error("Erreur lors de la sauvegarde de la capture:", e);
      throw e;
  }
};

/**
 * Met à jour une prise existante dans Firebase.
 * Met à jour le leaderboard ensuite.
 */
export const updateCapture = async (updatedCatch: CatchRecord, user: User): Promise<CatchRecord[]> => {
    if (!user || !db) {
        throw new Error("Utilisateur non authentifié.");
    }

    try {
        const catchRef = doc(db, "captures", updatedCatch.id);
        
        // On ne met pas à jour userId ni createdAt, mais on peut mettre à jour updatedAt si on veut
        // On extrait les champs modifiables
        const { id, ...dataToUpdate } = updatedCatch;

        await updateDoc(catchRef, {
            ...dataToUpdate,
            updatedAt: serverTimestamp()
        });
        
        // Sync Leaderboard
        await updateUserLeaderboardStats(user);

        // On recharge la liste mise à jour
        return await fetchUserCaptures(user.uid);
    } catch (e) {
        console.error("Erreur lors de la mise à jour de la capture:", e);
        throw e;
    }
};

/**
 * Supprime une prise de la collection "captures" de Firebase.
 * Met à jour le leaderboard ensuite.
 */
export const deleteCapture = async (catchId: string, user: User): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    await deleteDoc(doc(db, "captures", catchId));
    
    // Sync Leaderboard
    await updateUserLeaderboardStats(user);

  } catch (e) {
    console.error("Erreur lors de la suppression du document:", e);
    throw e;
  }
};
