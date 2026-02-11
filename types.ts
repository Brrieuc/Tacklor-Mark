
export interface CatchAnalysis {
  species: string;
  length_cm: number;
  weight_kg: number;
  is_sensitive_species: boolean;
  technique?: string;
  spot_type?: string;
}

export interface CatchRecord extends CatchAnalysis {
  id: string;
  date: string;
  imageUrl: string; // Stockera désormais une chaîne Base64 compressée
  complianceStatus: 'pending' | 'compliant' | 'to_declare'; // Statuts simplifiés
  location?: string;
  aiAdvice?: string; // Conseil du Tacklor Guide AI
  weatherSnapshot?: WeatherData; // Données météo Open-Meteo au moment de la prise
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  isPublic: boolean; // Determine si l'utilisateur apparaît dans le leaderboard
  email?: string;
  birthDate?: string; // Format YYYY-MM-DD, stocké uniquement dans users_profiles (privé)
  showAge?: boolean; // Préférence d'affichage
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  total_length_cm: number;
  total_weight_kg: number;
  catch_count: number;
  level: string; // Ex: "Pêcheur Amateur", "Légende", etc.
  last_updated: any; // Firestore Timestamp
  age?: number; // Âge calculé (public), seulement si showAge est true
}

export interface WeatherData {
  temp: number;
  wind: number;
  pressure: number;
  code: number;
  desc: string;
  lat: number;
  lon: number;
  locationName?: string; // Nom de la ville/lieu
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  NEW_CATCH = 'NEW_CATCH',
  LEADERBOARD = 'LEADERBOARD',
}

export type Language = 'fr' | 'en';
export type Theme = 'light' | 'dark';