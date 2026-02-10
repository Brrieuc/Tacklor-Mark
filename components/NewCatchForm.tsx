import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { analyzeCatchImage } from '../services/geminiService';
import { processFishingData, ProcessingResult } from '../services/recFishingService';
import { compressImage } from '../services/storageService';
import { CatchAnalysis, CatchRecord, Language, Theme, WeatherData } from '../types';
import { translations } from '../i18n';

interface NewCatchFormProps {
  onSave: (record: CatchRecord) => void;
  onCancel: () => void;
  lang: Language;
  theme: Theme;
  weather: WeatherData | null;
  initialData?: CatchRecord | null; // Props pour le mode édition
}

// Données Biologiques des espèces (Data Quality Expert)
// Max: Taille biologique max
// Limit: Plafond de l'application (blocker)
interface SpeciesData {
  id: string;
  fr: string;
  en: string;
  max: number; 
  limit: number;
  type: 'freshwater' | 'saltwater';
}

const SPECIES_DB: SpeciesData[] = [
  // Eau douce
  { id: 'pike', fr: 'Brochet', en: 'Northern Pike', max: 140, limit: 160, type: 'freshwater' },
  { id: 'zander', fr: 'Sandre', en: 'Zander', max: 100, limit: 115, type: 'freshwater' },
  { id: 'perch', fr: 'Perche', en: 'European Perch', max: 55, limit: 65, type: 'freshwater' },
  { id: 'carp', fr: 'Carpe Commune', en: 'Common Carp', max: 120, limit: 135, type: 'freshwater' },
  { id: 'catfish', fr: 'Silure', en: 'Wels Catfish', max: 270, limit: 300, type: 'freshwater' },
  { id: 'blackbass', fr: 'Black-Bass', en: 'Black Bass', max: 65, limit: 75, type: 'freshwater' },
  { id: 'trout', fr: 'Truite Fario', en: 'Brown Trout', max: 90, limit: 105, type: 'freshwater' },
  { id: 'chub', fr: 'Chevesne', en: 'European Chub', max: 65, limit: 75, type: 'freshwater' },
  { id: 'barbel', fr: 'Barbeau', en: 'Barbel', max: 90, limit: 105, type: 'freshwater' },
  { id: 'bream', fr: 'Brème', en: 'Bream', max: 70, limit: 85, type: 'freshwater' },
  { id: 'eel', fr: 'Anguille', en: 'Eel', max: 100, limit: 120, type: 'freshwater' },
  { id: 'roach', fr: 'Gardon', en: 'Roach', max: 40, limit: 50, type: 'freshwater' },
  { id: 'rudd', fr: 'Rotengle', en: 'Common Rudd', max: 40, limit: 50, type: 'freshwater' },
  { id: 'sturgeon', fr: 'Esturgeon', en: 'Sturgeon', max: 200, limit: 250, type: 'freshwater' },
  { id: 'char', fr: 'Omble Chevalier', en: 'Arctic Char', max: 70, limit: 85, type: 'freshwater' },

  // Eau de mer
  { id: 'bass', fr: 'Bar (Loup)', en: 'European Bass', max: 100, limit: 115, type: 'saltwater' },
  { id: 'gilthead', fr: 'Daurade Royale', en: 'Gilt-head Bream', max: 75, limit: 85, type: 'saltwater' },
  { id: 'mackerel', fr: 'Maquereau', en: 'Mackerel', max: 50, limit: 60, type: 'saltwater' },
  { id: 'pollock', fr: 'Lieu Jaune', en: 'Pollock', max: 100, limit: 115, type: 'saltwater' },
  { id: 'bluefin', fr: 'Thon Rouge', en: 'Bluefin Tuna', max: 300, limit: 350, type: 'saltwater' },
  { id: 'porgy', fr: 'Pagre', en: 'Red Porgy', max: 80, limit: 95, type: 'saltwater' },
  { id: 'wrasse', fr: 'Vieille', en: 'Ballan Wrasse', max: 60, limit: 70, type: 'saltwater' },
  { id: 'seabream', fr: 'Sar Commun', en: 'White Seabream', max: 45, limit: 55, type: 'saltwater' },
  { id: 'sole', fr: 'Sole', en: 'Common Sole', max: 50, limit: 60, type: 'saltwater' },
  { id: 'redmullet', fr: 'Rouget', en: 'Red Mullet', max: 40, limit: 50, type: 'saltwater' },
  { id: 'bonito', fr: 'Bonite', en: 'Bonito', max: 90, limit: 105, type: 'saltwater' },
  { id: 'whiting', fr: 'Merlan', en: 'Whiting', max: 60, limit: 75, type: 'saltwater' },
  { id: 'conger', fr: 'Congre', en: 'Conger Eel', max: 250, limit: 300, type: 'saltwater' },
  { id: 'ray', fr: 'Raie', en: 'Ray', max: 120, limit: 150, type: 'saltwater' },
  { id: 'mullet', fr: 'Mulet', en: 'Mullet', max: 80, limit: 95, type: 'saltwater' },
];

// Image par défaut si aucune photo n'est fournie (Pattern subtil ou logo)
const DEFAULT_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ebB7GZWegRbYq-_RKqU2d8qHqK0m6asNfhQDg5nEdQnwPE9X-duj2FXOEcxa0jBMRdQqH_jWzYOdGGlxUNqv21wqVk_15n5kAAqdcqB9X6JX1B5qeKL0gzGE_hy4o1LzM4MA0_o3k0sEfk2ZawNhyz6efj9QoU4u8xcpJkljzhFQYwChLXUrp4ya9LA/s320/Logo%20Tacklor%20Mark.png";

// Clé de stockage pour le brouillon
const DRAFT_STORAGE_KEY = 'tacklor_catch_draft';

export const NewCatchForm: React.FC<NewCatchFormProps> = ({ onSave, onCancel, lang, theme, weather, initialData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const isEditMode = !!initialData;
  
  // Validation State
  const [validationStatus, setValidationStatus] = useState<'valid' | 'record' | 'error'>('valid');
  const [currentSpeciesData, setCurrentSpeciesData] = useState<SpeciesData | null>(null);

  // Initialisation de la date
  const [catchDate, setCatchDate] = useState(() => {
    if (initialData?.date) {
        // Convert ISO string to datetime-local input format (YYYY-MM-DDTHH:mm)
        const d = new Date(initialData.date);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });

  // Nouveau champ pour l'adresse / lieu géographique manuel
  const [location, setLocation] = useState(initialData?.location || '');

  // Initialisation du formulaire
  const [formData, setFormData] = useState<CatchAnalysis>({
    species: initialData?.species || '',
    length_cm: initialData?.length_cm || 0,
    weight_kg: initialData?.weight_kg || 0,
    is_sensitive_species: initialData?.is_sensitive_species || false,
    technique: initialData?.technique || '',
    spot_type: initialData?.spot_type || ''
  });

  const [complianceStatus, setComplianceStatus] = useState<CatchRecord['complianceStatus']>(initialData?.complianceStatus || 'pending');
  const [complianceMessage, setComplianceMessage] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>(initialData?.aiAdvice || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang].form;

  // --- DRAFT RESTORATION LOGIC ---
  useEffect(() => {
    // Si on n'est PAS en mode édition (création pure), on vérifie s'il y a un brouillon
    if (!isEditMode) {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // On restaure les données
          setFormData(parsed.formData);
          setComplianceStatus(parsed.complianceStatus);
          setLocation(parsed.location);
          setAiAdvice(parsed.aiAdvice);
          setCatchDate(parsed.catchDate);
          
          // Note: On ne peut pas restaurer l'image File object facilement, 
          // mais on garde les données texte, ce qui est le plus important après un retour de lien externe.
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isEditMode]);

  // Sauvegarde manuelle du brouillon (appelée avant de quitter vers le lien externe)
  const saveDraftToStorage = (overrideStatus?: CatchRecord['complianceStatus']) => {
    const draft = {
        formData,
        complianceStatus: overrideStatus || complianceStatus,
        location,
        aiAdvice,
        catchDate
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };
  
  // Style harmonisé
  const textShadowClass = "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]";
  const labelClass = `text-white/80 font-semibold ${textShadowClass}`;
  const inputClass = 'bg-black/20 border-white/20 text-white focus:ring-blue-500/50 placeholder-white/40 shadow-inner';

  // Validation Logic (Biologie Marine)
  useEffect(() => {
    const selectedSpecies = SPECIES_DB.find(s => s.fr === formData.species || s.en === formData.species);
    setCurrentSpeciesData(selectedSpecies || null);
    
    if (selectedSpecies && formData.length_cm > 0) {
      if (formData.length_cm > selectedSpecies.limit) {
          setValidationStatus('error');
      } else if (formData.length_cm > selectedSpecies.max) {
          setValidationStatus('record');
      } else {
          setValidationStatus('valid');
      }
    } else {
      setValidationStatus('valid');
    }
  }, [formData.species, formData.length_cm]);

  // Auto-fill Location
  useEffect(() => {
    if (!isEditMode && weather?.locationName && !location) {
        setLocation(weather.locationName);
    }
  }, [weather, isEditMode]);

  // Déclenche la vérification de conformité
  useEffect(() => {
    const timer = setTimeout(() => {
        if (formData.species) {
            handleRecFishingCheck(formData);
        }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.species, formData.length_cm, formData.is_sensitive_species, lang]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleAnalyze = async () => {
    if (!file && !isEditMode) return;
    if (!file && isEditMode) {
        alert("Veuillez sélectionner une nouvelle image pour relancer l'analyse.");
        return;
    }

    setIsAnalyzing(true);
    try {
      if(file) {
        const result = await analyzeCatchImage(file, lang);
        
        let matchedSpecies = result.species;
        const found = SPECIES_DB.find(s => 
            s.fr.toLowerCase().includes(result.species.toLowerCase()) || 
            s.en.toLowerCase().includes(result.species.toLowerCase())
        );
        if (found) {
            matchedSpecies = lang === 'fr' ? found.fr : found.en;
        }

        setFormData(prev => ({
            ...result,
            species: matchedSpecies,
            technique: result.technique || prev.technique,
            spot_type: result.spot_type || prev.spot_type
        }));
      }
    } catch (error) {
      alert("Impossible d'analyser l'image. Veuillez réessayer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecFishingCheck = async (data: CatchAnalysis) => {
    setIsSyncing(true);
    try {
      const enrichedData: Partial<CatchRecord> = {
          ...data,
          weatherSnapshot: weather || undefined
      };

      const result: ProcessingResult = await processFishingData(enrichedData, lang);
      
      // Si l'utilisateur a déjà validé, on ne revient pas en arrière automatiquement
      if (complianceStatus === 'legal_declaration_validated' && result.status !== 'compliant') {
          setComplianceMessage(result.message);
      } else {
          setComplianceStatus(result.status);
          setComplianceMessage(result.message);
      }
      
      if ((!aiAdvice || isAnalyzing) && !isEditMode) {
          setAiAdvice(result.advice);
      } else if (isAnalyzing && isEditMode) {
          setAiAdvice(result.advice);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Gestion du clic sur le lien externe
  const handleLegalLinkClick = (e: React.MouseEvent) => {
     // 1. Mettre à jour l'état local immédiatement
     const newStatus = 'legal_declaration_validated';
     setComplianceStatus(newStatus);
     
     // 2. Sauvegarder dans le localStorage pour persistance si l'onglet reload
     saveDraftToStorage(newStatus);

     // L'événement suit son cours (ouverture du lien _blank)
  };

  const handleSave = async () => {
    if (!formData.species) {
        alert(t.validation.selectSpecies);
        return;
    }
    
    if (validationStatus === 'error') {
        const speciesName = currentSpeciesData ? (lang === 'fr' ? currentSpeciesData.fr : currentSpeciesData.en) : formData.species;
        alert(t.validation.sizeImpossible.replace('{species}', speciesName));
        return;
    }

    setIsSaving(true);
    try {
        let imageToSave = initialData?.imageUrl || DEFAULT_IMAGE;
        
        if (file) {
            imageToSave = await compressImage(file);
        }

        const recordToSave: CatchRecord = {
          ...formData,
          id: initialData?.id || crypto.randomUUID(), 
          date: new Date(catchDate).toISOString(), 
          imageUrl: imageToSave,
          complianceStatus: complianceStatus,
          aiAdvice: aiAdvice,
          location: location, 
          weatherSnapshot: initialData?.weatherSnapshot || weather || undefined 
        };
        onSave(recordToSave);
        clearDraft(); // Nettoyage après succès
    } catch (error) {
        console.error("Error preparing save:", error);
        alert("Erreur lors de la sauvegarde.");
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
      clearDraft();
      onCancel();
  };

  const isRequired = complianceStatus === 'legal_declaration_required';
  const isValidated = complianceStatus === 'legal_declaration_validated';
  const showLegalAlert = isRequired || isValidated;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold text-white ${textShadowClass}`}>
            {isEditMode ? t.editTitle : t.title}
        </h2>
        <button onClick={handleCancel} className={`flex items-center gap-2 transition-colors bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white ${textShadowClass}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{t.back}</span>
        </button>
      </div>

      <GlassCard theme={theme} className="space-y-8">
        {/* Photo Upload Area */}
        <div 
          className={`relative w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all border-white/30 hover:bg-white/10 cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <div 
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
                onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setFile(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <button
                      onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full backdrop-blur-md shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                  >
                      {isAnalyzing ? (
                           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                      )}
                      <span className="font-bold">{isAnalyzing ? t.analyzing : t.analyze}</span>
                  </button>
               </div>
            </>
          ) : (
            <div className="text-center p-6 text-white drop-shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg font-bold">{t.upload.title}</p>
              <p className="text-sm opacity-70">{t.upload.subtitle}</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Formulaire Toujours Visible */}
        <div className="animate-fade-in space-y-6">
            
            {/* Date Selection */}
            <div className="space-y-2">
                <label className={labelClass}>{t.fields.date}</label>
                <input 
                  type="datetime-local" 
                  value={catchDate} 
                  onChange={(e) => setCatchDate(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${inputClass} [color-scheme:dark]`}
                />
            </div>
            
            {/* Location (Lieu / Adresse) - Champ indépendant */}
            <div className="space-y-2">
                <label className={labelClass}>{t.fields.location}</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex: Port de Brest, Plage des Minimes..."
                  className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${inputClass}`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>{t.fields.species}</label>
                <div className="relative">
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({...formData, species: e.target.value})}
                    className={`w-full rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 ${inputClass}`}
                  >
                    <option value="" disabled>{t.fields.speciesPlaceholder}</option>
                    
                    <optgroup label={t.fields.groups.freshwater} className="bg-gray-800 text-white">
                      {SPECIES_DB.filter(s => s.type === 'freshwater').map(s => (
                        <option key={s.id} value={lang === 'fr' ? s.fr : s.en}>
                          {lang === 'fr' ? s.fr : s.en}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={t.fields.groups.saltwater} className="bg-gray-800 text-white">
                      {SPECIES_DB.filter(s => s.type === 'saltwater').map(s => (
                        <option key={s.id} value={lang === 'fr' ? s.fr : s.en}>
                           {lang === 'fr' ? s.fr : s.en}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className={labelClass}>{t.fields.length}</label>
                    <input 
                      type="number" 
                      value={formData.length_cm || ''} 
                      onChange={(e) => setFormData({...formData, length_cm: Number(e.target.value)})}
                      className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                          validationStatus === 'error' ? 'border-red-500 bg-red-900/20' : 
                          validationStatus === 'record' ? 'border-yellow-400 bg-yellow-900/20' : 
                          inputClass
                      }`}
                    />
                    {/* Validation Hints & Errors */}
                    {validationStatus === 'error' && (
                        <p className="text-red-400 text-xs font-bold mt-1">
                            {t.validation.sizeImpossible.replace('{species}', currentSpeciesData ? (lang === 'fr' ? currentSpeciesData.fr : currentSpeciesData.en) : formData.species)}
                        </p>
                    )}
                    {validationStatus === 'record' && (
                        <p className="text-yellow-400 text-xs font-bold mt-1 animate-pulse">
                            {t.validation.sizeRecord}
                        </p>
                    )}
                    {validationStatus === 'valid' && currentSpeciesData && (
                        <p className="text-white/40 text-xs mt-1">
                            {t.validation.sizeHint.replace('{max}', currentSpeciesData.max.toString())}
                        </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>{t.fields.weight}</label>
                    <input 
                      type="number" 
                      step="0.001"
                      value={formData.weight_kg || ''} 
                      onChange={(e) => setFormData({...formData, weight_kg: Number(e.target.value)})}
                      className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${inputClass}`}
                    />
                  </div>
              </div>
            </div>

            {/* Fields: Technique & Spot */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className={labelClass}>{t.fields.technique}</label>
                    <input 
                      type="text" 
                      value={formData.technique || ''} 
                      onChange={(e) => setFormData({...formData, technique: e.target.value})}
                      placeholder="e.g. Spinning, Surfcasting..."
                      className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>{t.fields.spot}</label>
                    <input 
                      type="text" 
                      value={formData.spot_type || ''} 
                      onChange={(e) => setFormData({...formData, spot_type: e.target.value})}
                      placeholder="e.g. River, Open Sea..."
                      className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${inputClass}`}
                    />
                  </div>
             </div>

            {/* RecFishing Compliance Check - REDUCED UI */}
            <div className={`border-t pt-6 border-white/20`}>
              {/* Entête */}
              <div className="flex items-center justify-between gap-4">
                 <div>
                    <h3 className={`text-lg font-bold text-white ${textShadowClass}`}>{t.compliance.title}</h3>
                 </div>
                 
                 {isSyncing ? (
                      <div className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 bg-white/10 text-white">
                         <span>{t.compliance.checking}</span>
                      </div>
                 ) : (
                    // Badges Simplifiés
                    <>
                        {complianceStatus === 'compliant' && (
                             <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                 </svg>
                                 {t.compliance.compliant}
                             </div>
                        )}
                         {complianceStatus === 'to_declare' && (
                            <div className="text-yellow-400 font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30">
                                ⚠️ {t.compliance.actionRequired}
                            </div>
                        )}
                        {isRequired && (
                            <div className="text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/50 animate-pulse">
                                ⚖️ {t.compliance.actionRequired}
                            </div>
                        )}
                        {isValidated && (
                            <div className="flex items-center gap-2 text-green-300 font-bold bg-green-500/20 px-3 py-1 rounded-full border border-green-500/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {t.status.legal_declaration_validated}
                            </div>
                        )}
                    </>
                 )}
              </div>
              
              {/* Alert Message Box - Only show if Not Compliant or Validated */}
              {(complianceMessage && complianceStatus !== 'compliant') && (
                  <div className={`mt-4 p-4 rounded-xl border flex flex-col gap-3 ${
                      isValidated 
                      ? 'bg-green-900/40 border-green-500/50 text-white'
                      : showLegalAlert 
                        ? 'bg-purple-900/40 border-purple-500/50 text-white' 
                        : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-100'
                  }`}>
                      <div className="flex items-start gap-3">
                          <span className="text-2xl">{isValidated ? '✅' : showLegalAlert ? '🚨' : '⚠️'}</span>
                          <p className="text-sm font-medium pt-1">{complianceMessage}</p>
                      </div>

                      {/* Specific Legal Button - ONLY if required */}
                      {isRequired && (
                        <a 
                            href="https://www.mer.gouv.fr/peche-de-loisir-declaration-de-captures" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={handleLegalLinkClick}
                            className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg text-center transition-all border border-white/20 flex items-center justify-center gap-2"
                        >
                            <span>Remplir ma déclaration (CERFA)</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                      )}
                  </div>
              )}
            </div>

            {/* Tacklor Guide AI Advice */}
            {aiAdvice && (
                <div className="border rounded-xl p-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500/20">
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-blue-200 drop-shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {t.adviceTitle}
                    </h3>
                    <p className="italic text-white/90">"{aiAdvice}"</p>
                </div>
            )}

            {/* Save Button */}
            <button 
              onClick={handleSave}
              disabled={isSaving || validationStatus === 'error'}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            >
              {isSaving ? "Sauvegarde..." : (isEditMode ? t.update : t.save)}
            </button>
          </div>
      </GlassCard>
    </div>
  );
};