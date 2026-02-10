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
      connectToStart: "Login / Sign up",
      totalCatches: "Total Catches",
      totalWeight: "Total Weight",
      totalLength: "Total Length",
      verifiedCompliant: "Verified Compliant",
      emptyState: "No catches recorded yet. Start your adventure!",
      guestState: "Please log in to create your fishing logbook and save your catches to the cloud.",
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
        spot: "Spot",
        location: "Location",
        date: "Date"
      },
      actions: {
        declare: "Send Legal Declaration",
        delete: "Delete",
        edit: "Edit Catch",
        close: "Close",
        confirmDelete: "Are you sure you want to delete this catch? This action cannot be undone."
      }
    },
    form: {
      back: "Back",
      title: "New Entry",
      editTitle: "Edit Entry",
      upload: {
        title: "Click to upload photo",
        subtitle: "or drag and drop"
      },
      analyze: "Analyze Catch",
      analyzing: "Analyzing with Gemini...",
      fields: {
        date: "Date & Time",
        species: "Species",
        length: "Length (cm)",
        weight: "Weight (kg)",
        technique: "Technique Used",
        spot: "Spot Type",
        location: "Location / Address"
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
      save: "Save to Logbook",
      update: "Update Entry"
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
      connectToStart: "Connexion / Inscription",
      totalCatches: "Total Prises",
      totalWeight: "Poids Total",
      totalLength: "Longueur Totale",
      verifiedCompliant: "Conformité Vérifiée",
      emptyState: "Aucune prise enregistrée. Commencez l'aventure !",
      guestState: "Veuillez vous connecter pour créer votre carnet de pêche et sauvegarder vos prises dans le cloud.",
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
        spot: "Poste",
        location: "Lieu",
        date: "Date"
      },
      actions: {
        declare: "Envoyer la déclaration légale",
        delete: "Supprimer",
        edit: "Modifier la prise",
        close: "Fermer",
        confirmDelete: "Êtes-vous sûr de vouloir supprimer cette prise ? Cette action est irréversible."
      }
    },
    form: {
      back: "Retour",
      title: "Nouvelle Entrée",
      editTitle: "Modifier l'entrée",
      upload: {
        title: "Cliquez pour changer la photo",
        subtitle: "ou glissez-déposez"
      },
      analyze: "Analyser la prise",
      analyzing: "Analyse avec Gemini...",
      fields: {
        date: "Date et Heure",
        species: "Espèce",
        length: "Taille (cm)",
        weight: "Poids (kg)",
        technique: "Technique utilisée",
        spot: "Type de poste",
        location: "Lieu / Adresse"
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
      save: "Enregistrer",
      update: "Mettre à jour"
    },
    aiActive: "IA Gemini Active"
  }
};