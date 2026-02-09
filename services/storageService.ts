import { CatchRecord, UserProfile } from "../types";

const LOGBOOK_KEY = 'tacklor_logbook';
const USER_KEY = 'tacklor_user_profile';

// --- Image Compression Logic ---

/**
 * Compresses and converts an image file to a Base64 string suitable for LocalStorage.
 * Max dimensions: 800x800, Quality: 0.7
 */
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

// --- Logbook Persistence ---

export const getLogbook = (): CatchRecord[] => {
  try {
    const stored = localStorage.getItem(LOGBOOK_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load logbook", e);
    return [];
  }
};

export const saveToLogbook = (newCatch: CatchRecord): CatchRecord[] => {
  try {
    const current = getLogbook();
    const updated = [newCatch, ...current];
    localStorage.setItem(LOGBOOK_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save catch - LocalStorage might be full", e);
    alert("Erreur: Espace de stockage local saturé. Essayez de supprimer d'anciennes prises.");
    return getLogbook();
  }
};

// --- User Profile Persistence ---

const DEFAULT_USER: UserProfile = {
  name: "Pêcheur",
  avatarUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ebB7GZWegRbYq-_RKqU2d8qHqK0m6asNfhQDg5nEdQnwPE9X-duj2FXOEcxa0jBMRdQqH_jWzYOdGGlxUNqv21wqVk_15n5kAAqdcqB9X6JX1B5qeKL0gzGE_hy4o1LzM4MA0_o3k0sEfk2ZawNhyz6efj9QoU4u8xcpJkljzhFQYwChLXUrp4ya9LA/s320/Logo%20Tacklor%20Mark.png" // Fallback logo
};

export const getUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_USER;
  } catch (e) {
    return DEFAULT_USER;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
};
