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
        confirmDelete: "Are you sure you want to delete this catch? This action cannot be undone.",
        viewAllBadges: "View All Badges"
      }
    },
    leaderboard: {
      title: "Community Leaderboard",
      subtitle: "Top 10 Anglers",
      rank: "Rank",
      angler: "Angler",
      totalLength: "Total Length",
      totalWeight: "Total Weight",
      catches: "Catches",
      empty: "No ranked anglers yet.",
      join: "Add a catch to join the ranking!",
      categories: {
        length: "Length",
        weight: "Weight",
        count: "Catches"
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
    trophies: {
      title: "Trophy Road",
      galleryTitle: "Trophy Gallery",
      progress: "Progress",
      locked: "Mystery Badge",
      lockedDesc: "Keep fishing to reveal this milestone!",
      categories: {
        weight: "Weight Class",
        length: "Length Class",
        count: "Experience",
        species: "Biodiversity",
        night: "Night Fishing"
      },
      badges: {
        // Count
        first_catch: "Sunday Angler",
        first_catchDesc: "Your very first catch! Welcome to the club.",
        amateur: "Amateur Angler",
        amateurDesc: "10 catches recorded.",
        pro: "Pro Angler",
        proDesc: "50 catches. You know your spots.",
        legend: "Living Legend",
        legendDesc: "100 catches. A true master.",
        
        // Species
        curious: "Curious",
        curiousDesc: "3 different species caught.",
        globetrotter: "Globetrotter",
        globetrotterDesc: "10 different species! Great variety.",
        darwin: "Darwin's Heir",
        darwinDesc: "20 different species. An encyclopedia.",

        // Night
        lateshift: "Late Shift",
        lateshiftDesc: "First catch after dark.",
        nightowl: "Night Owl",
        nightowlDesc: "10 catches at night. You own the dark.",

        // Length
        ruler: "School Ruler",
        rulerDesc: "You've started measuring (30cm)!",
        guitar: "Electric Guitar",
        guitarDesc: "Rock'n'roll! You reached 1 meter.",
        rod: "Surfcasting Rod",
        rodDesc: "A standard long cast rod (4.5m).",
        car: "Family Car",
        carDesc: "As long as a station wagon (5m).",
        bus: "School Bus",
        busDesc: "That's a long line of fish (12m)!",
        bowling: "Bowling Lane",
        bowlingDesc: "Strike! A full lane length (18m).",
        whale: "Blue Whale",
        whaleDesc: "The giant of the seas (30m).",
        pool: "Olympic Pool",
        poolDesc: "50 meters of pure scale.",
        football: "Football Field",
        footballDesc: "100m! Touchdown!",
        eiffel: "Eiffel Tower",
        eiffelDesc: "A monumental pile of fish (300m).",
        // Weight
        laptop: "Laptop",
        laptopDesc: "Lightweight start (2kg).",
        bag: "Groceries Bag",
        bagDesc: "Dinner is served (5kg).",
        bike: "Mountain Bike",
        bikeDesc: "Rolling heavy (15kg).",
        dog: "Golden Retriever",
        dogDesc: "Man's best fishing buddy (30kg).",
        washer: "Washing Machine",
        washerDesc: "Heavy duty load (75kg).",
        person: "Sumo Wrestler",
        personDesc: "A heavyweight champion (150kg).",
        moto: "Motorcycle",
        motoDesc: "Full throttle weight (250kg).",
        piano: "Grand Piano",
        pianoDesc: "Music to my ears (400kg).",
        horse: "Race Horse",
        horseDesc: "Pure horsepower (600kg).",
        f1: "Formula 1 Car",
        f1Desc: "800kg of speed and scales!",
        shark: "Great White",
        sharkDesc: "The apex predator weight (1T)."
      }
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
        confirmDelete: "Êtes-vous sûr de vouloir supprimer cette prise ? Cette action est irréversible.",
        viewAllBadges: "Voir tous mes badges"
      }
    },
    leaderboard: {
      title: "Classement Communauté",
      subtitle: "Top 10 Pêcheurs",
      rank: "Rang",
      angler: "Pêcheur",
      totalLength: "Longueur Totale",
      totalWeight: "Poids Total",
      catches: "Prises",
      empty: "Le classement est encore vide.",
      join: "Ajoutez une prise pour entrer dans le classement !",
      categories: {
        length: "Longueur",
        weight: "Poids",
        count: "Prises"
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
    trophies: {
      title: "Voie des Trophées",
      galleryTitle: "Galerie des Trophées",
      progress: "Progression",
      locked: "Badge Mystère",
      lockedDesc: "Continuez à pêcher pour révéler ce palier !",
      categories: {
        weight: "Catégorie Poids",
        length: "Catégorie Longueur",
        count: "Expérience",
        species: "Biodiversité",
        night: "Pêche Nocturne"
      },
      badges: {
        // Count
        first_catch: "Pêcheur du dimanche",
        first_catchDesc: "Votre toute première prise ! Bienvenue au club.",
        amateur: "Pêcheur Amateur",
        amateurDesc: "10 prises enregistrées.",
        pro: "Pêcheur Pro",
        proDesc: "50 prises. Vous connaissez les coins.",
        legend: "Légende Vivante",
        legendDesc: "100 prises. Un véritable maître.",
        
        // Species
        curious: "Curieux",
        curiousDesc: "3 espèces différentes capturées.",
        globetrotter: "Grand Voyageur",
        globetrotterDesc: "10 espèces différentes ! Quelle variété.",
        darwin: "Héritier de Darwin",
        darwinDesc: "20 espèces différentes. Une encyclopédie.",

        // Night
        lateshift: "Tardif",
        lateshiftDesc: "Première prise une fois la nuit tombée.",
        nightowl: "Oiseau de Nuit",
        nightowlDesc: "10 prises nocturnes. La nuit vous appartient.",

        // Length
        ruler: "Double Décimètre",
        rulerDesc: "Vous commencez à mesurer (30cm) !",
        guitar: "Guitare Électrique",
        guitarDesc: "Rock'n'roll ! Vous atteignez 1 mètre.",
        rod: "Canne de Surf",
        rodDesc: "Une canne longue distance standard (4.50m).",
        car: "Berline",
        carDesc: "La longueur d'une voiture familiale (5m).",
        bus: "Bus Scolaire",
        busDesc: "Une sacrée ligne de poissons (12m) !",
        bowling: "Piste de Bowling",
        bowlingDesc: "Strike ! Une piste complète (18m).",
        whale: "Baleine Bleue",
        whaleDesc: "Le géant des mers (30m).",
        pool: "Piscine Olympique",
        poolDesc: "50 mètres d'écailles.",
        football: "Terrain de Foot",
        footballDesc: "100m ! Touchdown !",
        eiffel: "Tour Eiffel",
        eiffelDesc: "Une pile monumentale de prises (300m).",
        // Weight
        laptop: "Ordinateur Portable",
        laptopDesc: "Un début léger (2kg).",
        bag: "Sac de Courses",
        bagDesc: "Assez lourd pour un bon dîner (5kg).",
        bike: "VTT",
        bikeDesc: "Ça commence à peser (15kg).",
        dog: "Golden Retriever",
        dogDesc: "Le meilleur ami du pêcheur (30kg).",
        washer: "Machine à Laver",
        washerDesc: "C'est du lourd (75kg).",
        person: "Sumo",
        personDesc: "Un champion poids lourd (150kg).",
        moto: "Moto Sportive",
        motoDesc: "Plein gaz sur la balance (250kg).",
        piano: "Piano à Queue",
        pianoDesc: "De la musique pour mes oreilles (400kg).",
        horse: "Cheval de Course",
        horseDesc: "Une puissance pure (600kg).",
        f1: "Formule 1",
        f1Desc: "800kg de vitesse et d'écailles !",
        shark: "Grand Requin Blanc",
        sharkDesc: "Le poids du prédateur ultime (1T)."
      }
    },
    aiActive: "IA Gemini Active"
  }
};