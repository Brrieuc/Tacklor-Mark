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
  complianceStatus: 'pending' | 'compliant' | 'to_declare' | 'legal_declaration_required';
  location?: string;
  aiAdvice?: string; // Conseil du Tacklor Guide AI
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  NEW_CATCH = 'NEW_CATCH',
}

export type Language = 'fr' | 'en';
export type Theme = 'light' | 'dark';
