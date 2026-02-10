import { CatchRecord, LeaderboardEntry, UserProfile } from "../types";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, deleteDoc, doc, updateDoc, setDoc, limit, getDoc } from "firebase/firestore";
import { User, updateProfile } from "firebase/auth";

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

// --- Profile & Privacy Management ---

/**
 * Récupère le profil utilisateur étendu depuis la collection 'users_profiles'.
 * Si non existant, retourne des valeurs par défaut basées sur l'objet User Auth.
 */
export const fetchUserProfile = async (user: User): Promise<UserProfile> => {
    if (!db) throw new Error("Database not initialized");
    
    const profileRef = doc(db, "users_profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        return profileSnap.data() as UserProfile;
    } else {
        // Default profile if not yet created in Firestore
        return {
            uid: user.uid,
            displayName: user.displayName || "Pêcheur Anonyme",
            photoURL: user.photoURL || "",
            isPublic: true, // Par défaut public
            email: user.email || ""
        };
    }
};

/**
 * Sauvegarde les modifications de profil.
 * 1. Met à jour le profil Firebase Auth (Display Name, PhotoURL)
 * 2. Enregistre dans 'users_profiles'
 * 3. Gère la visibilité dans 'leaderboard' (Supprime si privé, Update si public)
 */
export const saveUserProfile = async (user: User, newProfileData: Partial<UserProfile>): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
        // 1. Update Firebase Auth Profile (Standard)
        if (newProfileData.displayName || newProfileData.photoURL) {
            await updateProfile(user, {
                displayName: newProfileData.displayName || user.displayName,
                photoURL: newProfileData.photoURL || user.photoURL
            });
        }

        // 2. Save to 'users_profiles' collection
        const profileRef = doc(db, "users_profiles", user.uid);
        const fullProfileData: UserProfile = {
            uid: user.uid,
            displayName: newProfileData.displayName || user.displayName || "Anonyme",
            photoURL: newProfileData.photoURL || user.photoURL || "",
            isPublic: newProfileData.isPublic !== undefined ? newProfileData.isPublic : true,
            email: user.email || ""
        };
        
        await setDoc(profileRef, fullProfileData, { merge: true });

        // 3. Handle Leaderboard Privacy Logic
        const leaderboardRef = doc(db, "leaderboard", user.uid);
        
        if (fullProfileData.isPublic === false) {
            // Si l'utilisateur passe en PRIVE -> On le supprime du leaderboard
            await deleteDoc(leaderboardRef);
        } else {
            // Si l'utilisateur passe en PUBLIC -> On force la mise à jour des stats
            await updateUserLeaderboardStats(user, true); // Force update
        }

    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};


// --- Leaderboard Logic ---

/**
 * Calcule le "Niveau" affiché dans le leaderboard basé sur le nombre de prises.
 */
const calculateUserLevel = (catchCount: number): string => {
    if (catchCount >= 100) return "Légende";
    if (catchCount >= 50) return "Pro";
    if (catchCount >= 10) return "Amateur";
    return "Débutant";
};

/**
 * Met à jour le document de l'utilisateur dans la collection publique 'leaderboard'.
 * IMPORTANT : Vérifie d'abord si l'utilisateur est 'isPublic'.
 * @param forceUpdate Si true, ignore la vérification de profil (utilisé quand on vient de passer en public)
 */
const updateUserLeaderboardStats = async (user: User, forceUpdate = false) => {
    try {
        // 0. Privacy Check
        if (!forceUpdate) {
            const profile = await fetchUserProfile(user);
            if (!profile.isPublic) {
                // Si l'utilisateur est privé, on ne met PAS à jour le leaderboard.
                // On s'assure même qu'il n'y est pas (sécurité doublon)
                await deleteDoc(doc(db, "leaderboard", user.uid));
                return;
            }
        }

        // 1. Récupérer toutes les captures
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
            total_weight_kg: totalWeight,
            catch_count: catchCount,
            level: calculateUserLevel(catchCount),
            last_updated: serverTimestamp()
        };

        // 3. Écrire
        const leaderboardRef = doc(db, "leaderboard", user.uid);
        await setDoc(leaderboardRef, leaderboardData, { merge: true });

    } catch (e) {
        console.error("Erreur lors de la mise à jour du leaderboard:", e);
    }
};

/**
 * Récupère le Top 10 du classement global selon un critère de tri.
 */
export const fetchLeaderboard = async (sortBy: 'total_length_cm' | 'total_weight_kg' | 'catch_count' = 'total_length_cm'): Promise<LeaderboardEntry[]> => {
    if (!db) return [];

    try {
        const leaderboardRef = collection(db, "leaderboard");
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

export const fetchUserCaptures = async (userId?: string | null): Promise<CatchRecord[]> => {
  if (!userId || !db) {
      return [];
  }

  try {
      const catchesRef = collection(db, "captures");
      const q = query(catchesRef, where("userId", "==", userId));
      
      const querySnapshot = await getDocs(q);
      
      const records: CatchRecord[] = [];
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          records.push({ ...data, id: doc.id } as CatchRecord);
      });

      return records.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
      });

  } catch (e) {
      console.error("Erreur lors de la récupération des captures:", e);
      return [];
  }
};

export const saveCapture = async (newCatch: CatchRecord, user: User): Promise<CatchRecord[]> => {
  if (!user || !db) {
      throw new Error("Utilisateur non authentifié.");
  }

  try {
      const catchesRef = collection(db, "captures");
      const { id, ...dataToSave } = newCatch;

      const docData = {
          ...dataToSave,
          userId: user.uid, 
          createdAt: serverTimestamp()
      };

      await addDoc(catchesRef, docData);
      
      // Sync Leaderboard (Will check privacy internally)
      await updateUserLeaderboardStats(user);

      return await fetchUserCaptures(user.uid);
  } catch (e) {
      console.error("Erreur lors de la sauvegarde de la capture:", e);
      throw e;
  }
};

export const updateCapture = async (updatedCatch: CatchRecord, user: User): Promise<CatchRecord[]> => {
    if (!user || !db) {
        throw new Error("Utilisateur non authentifié.");
    }

    try {
        const catchRef = doc(db, "captures", updatedCatch.id);
        const { id, ...dataToUpdate } = updatedCatch;

        await updateDoc(catchRef, {
            ...dataToUpdate,
            updatedAt: serverTimestamp()
        });
        
        await updateUserLeaderboardStats(user);

        return await fetchUserCaptures(user.uid);
    } catch (e) {
        console.error("Erreur lors de la mise à jour de la capture:", e);
        throw e;
    }
};

export const deleteCapture = async (catchId: string, user: User): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    await deleteDoc(doc(db, "captures", catchId));
    await updateUserLeaderboardStats(user);
  } catch (e) {
    console.error("Erreur lors de la suppression du document:", e);
    throw e;
  }
};