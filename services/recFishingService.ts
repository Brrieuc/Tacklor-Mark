import { CatchRecord, Language } from "../types";
import { translations } from "../i18n";

export interface ProcessingResult {
  status: CatchRecord['complianceStatus'];
  message: string;
  advice: string;
}

/**
 * Logic Controller: Processes fishing data to determine compliance and generate advice.
 * SIMPLIFIED VERSION: Checks only basic size limits and sensitive flag.
 */
export const processFishingData = async (catchData: Partial<CatchRecord>, lang: Language = 'fr'): Promise<ProcessingResult> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const t = translations[lang].form.messages;
  let status: CatchRecord['complianceStatus'] = 'compliant';
  let message = t.compliant;
  
  const speciesLower = catchData.species?.toLowerCase() || "";

  // --- REGLES SIMPLIFIÉES ---
  
  // 1. Espèce sensible (cochée manuellement ou détectée via logique métier future)
  if (catchData.is_sensitive_species) {
    status = 'to_declare';
    message = t.sensitive;
  }
  // 2. Vérification générique de taille minimale (Règle simple < 20cm pour l'exemple global)
  // Dans une version complète, cela utiliserait SPECIES_DB
  else if ((catchData.length_cm || 0) < 20) {
     status = 'to_declare';
     message = t.undersize;
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