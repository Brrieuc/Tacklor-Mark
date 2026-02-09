import { Language } from './types';

export const translations = {
  en: {
    appTitle: "Tacklor Mark",
    weather: {
      temp: "Temp",
      wind: "Wind"
    },
    dashboard: {
      title: "My Logbook",
      subtitle: "Track your journey, analyze with AI.",
      newCatch: "New Catch",
      totalCatches: "Total Catches",
      totalWeight: "Total Weight",
      verifiedCompliant: "Verified Compliant",
      emptyState: "No catches recorded yet. Start your adventure!",
      status: {
        pending: "Pending Check",
        compliant: "Compliant",
        to_declare: "Action Required",
        legal_declaration_required: "Legal Declaration Needed"
      },
      labels: {
        length: "Length",
        weight: "Weight",
        sensitive: "Sensitive Species",
        technique: "Technique",
        spot: "Spot"
      },
      actions: {
        declare: "Send Legal Declaration"
      }
    },
    form: {
      back: "Back to Dashboard",
      title: "New Entry",
      upload: {
        title: "Click to upload photo",
        subtitle: "or drag and drop"
      },
      analyze: "Analyze Catch",
      analyzing: "Analyzing with Gemini...",
      fields: {
        species: "Species",
        length: "Length (cm)",
        weight: "Weight (kg)",
        technique: "Technique Used",
        spot: "Spot Type"
      },
      compliance: {
        title: "RecFishing Compliance",
        subtitle: "Verify against local regulations",
        check: "Check Compliance",
        checking: "Verifying...",
        compliant: "Compliant",
        actionRequired: "Action Required"
      },
      messages: {
        compliant: "Catch is compliant with current regulations.",
        sensitive: "Sensitive species detected. Declaration required.",
        undersize: "Undersize catch. Please verify local regulations.",
        legal_required: "Target species (Bass/Pollock) requires specific declaration."
      },
      adviceTitle: "Tacklor Guide AI Advice",
      save: "Save to Logbook"
    },
    aiActive: "Gemini AI Active"
  },
  fr: {
    appTitle: "Tacklor Mark",
    weather: {
      temp: "Temp",
      wind: "Vent"
    },
    dashboard: {
      title: "Mon Carnet",
      subtitle: "Suivez votre parcours, analysez avec l'IA.",
      newCatch: "Nouvelle Prise",
      totalCatches: "Total Prises",
      totalWeight: "Poids Total",
      verifiedCompliant: "Conformité Vérifiée",
      emptyState: "Aucune prise enregistrée. Commencez l'aventure !",
      status: {
        pending: "En attente",
        compliant: "Conforme",
        to_declare: "À déclarer",
        legal_declaration_required: "Déclaration Légale Requise"
      },
      labels: {
        length: "Taille",
        weight: "Poids",
        sensitive: "Espèce Sensible",
        technique: "Technique",
        spot: "Poste"
      },
      actions: {
        declare: "Envoyer la déclaration légale"
      }
    },
    form: {
      back: "Retour au tableau de bord",
      title: "Nouvelle Entrée",
      upload: {
        title: "Cliquez pour ajouter une photo",
        subtitle: "ou glissez-déposez"
      },
      analyze: "Analyser la prise",
      analyzing: "Analyse avec Gemini...",
      fields: {
        species: "Espèce",
        length: "Taille (cm)",
        weight: "Poids (kg)",
        technique: "Technique utilisée",
        spot: "Type de poste"
      },
      compliance: {
        title: "Conformité RecFishing",
        subtitle: "Vérifier la réglementation locale",
        check: "Vérifier conformité",
        checking: "Vérification...",
        compliant: "Conforme",
        actionRequired: "À déclarer"
      },
      messages: {
        compliant: "La prise est conforme aux réglementations actuelles.",
        sensitive: "Espèce sensible détectée. Déclaration requise.",
        undersize: "Taille insuffisante. Veuillez vérifier les réglementations locales.",
        legal_required: "Espèce cible (Bar/Lieu) nécessitant une déclaration spécifique."
      },
      adviceTitle: "Conseil Tacklor Guide AI",
      save: "Enregistrer"
    },
    aiActive: "IA Gemini Active"
  }
};
