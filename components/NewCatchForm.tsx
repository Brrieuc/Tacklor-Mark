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

// Image par défaut si aucune photo n'est fournie (Pattern subtil ou logo)
const DEFAULT_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ebB7GZWegRbYq-_RKqU2d8qHqK0m6asNfhQDg5nEdQnwPE9X-duj2FXOEcxa0jBMRdQqH_jWzYOdGGlxUNqv21wqVk_15n5kAAqdcqB9X6JX1B5qeKL0gzGE_hy4o1LzM4MA0_o3k0sEfk2ZawNhyz6efj9QoU4u8xcpJkljzhFQYwChLXUrp4ya9LA/s320/Logo%20Tacklor%20Mark.png";

export const NewCatchForm: React.FC<NewCatchFormProps> = ({ onSave, onCancel, lang, theme, weather, initialData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const isEditMode = !!initialData;
  
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
  
  // Style harmonisé : Texte blanc + Ombre portée adoucie
  const textShadowClass = "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]";
  const labelClass = `text-white/80 font-semibold ${textShadowClass}`;
  const inputClass = 'bg-black/20 border-white/20 text-white focus:ring-blue-500/50 placeholder-white/40 shadow-inner';

  // Auto-fill Location if weather contains location name (Reverse Geo) - ONLY if not editing and field is empty
  useEffect(() => {
    if (!isEditMode && weather?.locationName && !location) {
        setLocation(weather.locationName);
    }
  }, [weather, isEditMode]);

  // Déclenche la vérification de conformité lorsque les données changent (Debounce simple)
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
      // Revoke only if it was a blob URL created by user selection
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
        setFormData(prev => ({
            ...result,
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
      const result: ProcessingResult = await processFishingData(data, lang);
      setComplianceStatus(result.status);
      setComplianceMessage(result.message);
      // On garde l'ancien conseil si on édite, sauf si l'analyse vient de tourner
      if ((!aiAdvice || isAnalyzing) && !isEditMode) {
          setAiAdvice(result.advice);
      } else if (isAnalyzing && isEditMode) {
          // Si on analyse explicitement en mode edit, on met à jour
          setAiAdvice(result.advice);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (!formData.species) {
        alert(lang === 'fr' ? "Veuillez entrer au moins une espèce." : "Please enter at least a species.");
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
    } catch (error) {
        console.error("Error preparing save:", error);
        alert("Erreur lors de la sauvegarde.");
        setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold text-white ${textShadowClass}`}>
            {isEditMode ? t.editTitle : t.title}
        </h2>
        <button onClick={onCancel} className={`flex items-center gap-2 transition-colors bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white ${textShadowClass}`}>
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
                <input 
                  type="text" 
                  value={formData.species} 
                  onChange={(e) => setFormData({...formData, species: e.target.value})}
                  placeholder="ex: Bar, Truite..."
                  className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${inputClass}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className={labelClass}>{t.fields.length}</label>
                    <input 
                      type="number" 
                      value={formData.length_cm || ''} 
                      onChange={(e) => setFormData({...formData, length_cm: Number(e.target.value)})}
                      className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${inputClass}`}
                    />
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

            {/* RecFishing Compliance Check */}
            <div className={`border-t pt-6 border-white/20`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                 <div>
                    <h3 className={`text-lg font-bold text-white ${textShadowClass}`}>{t.compliance.title}</h3>
                    <p className={`text-sm text-white/70 ${textShadowClass}`}>{t.compliance.subtitle}</p>
                 </div>
                 
                 {isSyncing ? (
                      <div className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 bg-white/10 text-white">
                         <span>{t.compliance.checking}</span>
                      </div>
                 ) : (
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                        complianceStatus === 'compliant' 
                        ? 'bg-green-500/20 border-green-500/30 text-green-200' 
                        : complianceStatus === 'legal_declaration_required'
                        ? 'bg-purple-500/20 border-purple-500/30 text-purple-200'
                        : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200'
                    }`}>
                        <span className="font-bold capitalize drop-shadow-sm">
                            {complianceStatus === 'compliant' ? t.compliance.compliant : 
                             complianceStatus === 'legal_declaration_required' ? t.compliance.actionRequired : 
                             t.compliance.actionRequired}
                        </span>
                    </div>
                 )}
              </div>
              
              {complianceMessage && (
                  <div className="mt-3 text-sm p-3 rounded-lg border bg-black/20 border-white/10 text-white/80">
                      {complianceMessage}
                  </div>
              )}

              {/* Specific Legal Button */}
              {complianceStatus === 'legal_declaration_required' && (
                  <button className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-md transition-colors border border-white/20">
                      {t.compliance.actionRequired} (CERFA)
                  </button>
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
              disabled={isSaving}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            >
              {isSaving ? "Sauvegarde..." : (isEditMode ? t.update : t.save)}
            </button>
          </div>
      </GlassCard>
    </div>
  );
};