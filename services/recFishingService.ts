import { CatchRecord, Language } from "../types";
import { translations } from "../i18n";

export interface ProcessingResult {
  status: CatchRecord['complianceStatus'];
  message: string;
  advice: string;
}

type Zone = 'MED' | 'ATL' | 'UNKNOWN';

/**
 * Détermine la zone de pêche basée sur les coordonnées GPS.
 * Approximation simplifiée pour le MVP :
 * Méditerranée : Lat < 43.5 ET Lon > 2.0 (Approximation grossière Sud-Est France)
 * Atlantique/Manche/Mer du Nord (ICES 7 & 8) : Le reste.
 */
const determineFishingZone = (lat?: number, lon?: number): Zone => {
  if (!lat || !lon) return 'UNKNOWN'; // Par défaut, on appliquera le principe de précaution
  
  if (lat < 43.5 && lon > 2.0) {
    return 'MED';
  }
  return 'ATL';
};

/**
 * Logic Controller: Processes fishing data to determine compliance and generate advice.
 * Updates based on 2026 Regulations from mer.gouv.fr
 */
export const processFishingData = async (catchData: Partial<CatchRecord>, lang: Language = 'fr'): Promise<ProcessingResult> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const t = translations[lang].form.messages;
  let status: CatchRecord['complianceStatus'] = 'compliant';
  let message = t.compliant;
  
  const speciesLower = catchData.species?.toLowerCase() || "";
  
  // Récupération des données Géo via le weatherSnapshot inclus dans catchData
  const lat = catchData.weatherSnapshot?.lat;
  const lon = catchData.weatherSnapshot?.lon;
  const zone = determineFishingZone(lat, lon);

  // --- MATRICE DE RÉGLEMENTATION 2026 ---
  // Déclaration obligatoire RecFishing (CERFA) uniquement pour ces cas précis.
  let declarationRequired = false;

  // 1. Thon Rouge (Toutes zones)
  if (speciesLower.includes('thon rouge') || speciesLower.includes('bluefin')) {
    declarationRequired = true;
  }
  
  // 2. Bar / Loup (Atlantique/Manche uniquement - Zones CIEM 7&8)
  else if ((speciesLower.includes('bar') || speciesLower.includes('loup') || speciesLower.includes('bass')) && zone !== 'MED') {
    declarationRequired = true;
  }

  // 3. Lieu Jaune (Atlantique/Manche uniquement - Zones CIEM 7&8)
  else if ((speciesLower.includes('lieu jaune') || speciesLower.includes('pollock')) && zone !== 'MED') {
    declarationRequired = true;
  }

  // 4. Dorade Rose (Zones 7, 8 & Méditerranée -> Partout en France)
  else if (speciesLower.includes('dorade rose') || speciesLower.includes('red seabream') || speciesLower.includes('pagellus')) {
    declarationRequired = true;
  }

  // 5. Dorade Coryphène (Méditerranée uniquement)
  else if ((speciesLower.includes('coryphène') || speciesLower.includes('mahi')) && zone === 'MED') {
    declarationRequired = true;
  }

  // --- APPLICATION DU STATUT ---

  if (declarationRequired) {
    status = 'legal_declaration_required';
    message = t.legal_required;
  } 
  // Règle générale taille (sauf si déjà flaggué "legal")
  else if ((catchData.length_cm || 0) < 20) {
     status = 'to_declare';
     message = t.undersize;
  }
  // Espèce sensible générique (si cochée manuellement par l'utilisateur)
  else if (catchData.is_sensitive_species) {
    status = 'to_declare';
    message = t.sensitive;
  }

  // --- TACKLOR GUIDE AI ADVICE (Simulation) ---
  let advice = "";
  if (lang === 'fr') {
    if (speciesLower.includes('bar') || speciesLower.includes('bass')) {
      advice = "Superbe Bar ! La marée descendante est idéale en ce moment. Essayez un leurre de surface 'Walk the Dog' près des rochers pour déclencher plus d'attaques.";
    } else if (speciesLower.includes('brochet') || speciesLower.includes('pike')) {
      advice = "Beau Brochet ! Il semble chasser en bordure. Insistez sur les zones d'herbiers avec un Spinnerbait.";
    } else {
      advice = "Belle prise ! Vu les conditions météo, continuez à pêcher lentement, les poissons sont peut-être méfiants aujourd'hui.";
    }
  } else {
    if (speciesLower.includes('bar') || speciesLower.includes('bass')) {
      advice = "Great Bass! The falling tide is perfect right now. Try a 'Walk the Dog' topwater lure near the rocks to trigger more strikes.";
    } else if (speciesLower.includes('brochet') || speciesLower.includes('pike')) {
      advice = "Nice Pike! Seems to be hunting the edges. Focus on weed beds with a Spinnerbait.";
    } else {
      advice = "Nice catch! Given the weather, keep retrieving slowly, fish might be wary today.";
    }
  }

  return {
    status,
    message,
    advice
  };
};