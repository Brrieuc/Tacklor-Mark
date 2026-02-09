import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { analyzeCatchImage } from '../services/geminiService';
import { processFishingData, ProcessingResult } from '../services/recFishingService';
import { CatchAnalysis, CatchRecord, Language, Theme } from '../types';
import { translations } from '../i18n';

interface NewCatchFormProps {
  onSave: (record: CatchRecord) => void;
  onCancel: () => void;
  lang: Language;
  theme: Theme;
}

export const NewCatchForm: React.FC<NewCatchFormProps> = ({ onSave, onCancel, lang, theme }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [analysis, setAnalysis] = useState<CatchAnalysis | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<CatchRecord['complianceStatus']>('pending');
  const [complianceMessage, setComplianceMessage] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[lang].form;

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysis(null); // Reset analysis on new file
      setComplianceStatus('pending');
      setComplianceMessage('');
      setAiAdvice('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeCatchImage(file, lang);
      setAnalysis(result);
      
      // Auto-trigger compliance check after analysis
      handleRecFishingCheck(result);

    } catch (error) {
      alert("Failed to analyze image. Please try again.");
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
      setAiAdvice(result.advice);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = () => {
    if (!analysis || !previewUrl) return;

    const newRecord: CatchRecord = {
      ...analysis,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      imageUrl: previewUrl, 
      complianceStatus: complianceStatus,
      aiAdvice: aiAdvice
    };
    onSave(newRecord);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="text-white/60 hover:text-white flex items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t.back}
        </button>
        <h2 className="text-2xl font-bold">{t.title}</h2>
      </div>

      <GlassCard theme={theme} className="space-y-8">
        {/* Photo Upload Area */}
        <div 
          className={`relative w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden transition-all ${!previewUrl ? 'hover:bg-white/5 cursor-pointer' : ''}`}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setFile(null); setAnalysis(null); }}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {!analysis && (
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-full backdrop-blur-md shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span>{isAnalyzing ? t.analyzing : t.analyze}</span>
                    </button>
                 </div>
              )}
            </>
          ) : (
            <div className="text-center p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg font-medium">{t.upload.title}</p>
              <p className="text-sm text-white/40">{t.upload.subtitle}</p>
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

        {/* AI Results Section */}
        {analysis && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">{t.fields.species}</label>
                <input 
                  type="text" 
                  value={analysis.species} 
                  onChange={(e) => setAnalysis({...analysis, species: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">{t.fields.length}</label>
                    <input 
                      type="number" 
                      value={analysis.length_cm} 
                      onChange={(e) => setAnalysis({...analysis, length_cm: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">{t.fields.weight}</label>
                    <input 
                      type="number" 
                      value={analysis.weight_kg} 
                      onChange={(e) => setAnalysis({...analysis, weight_kg: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
              </div>
            </div>

            {/* New Fields: Technique & Spot (Auto-filled by AI) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">{t.fields.technique}</label>
                    <input 
                      type="text" 
                      value={analysis.technique || ''} 
                      onChange={(e) => setAnalysis({...analysis, technique: e.target.value})}
                      placeholder="e.g. Spinning, Surfcasting..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">{t.fields.spot}</label>
                    <input 
                      type="text" 
                      value={analysis.spot_type || ''} 
                      onChange={(e) => setAnalysis({...analysis, spot_type: e.target.value})}
                      placeholder="e.g. River, Open Sea..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
             </div>

            {/* RecFishing Compliance Check */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                 <div>
                    <h3 className="text-lg font-medium">{t.compliance.title}</h3>
                    <p className="text-sm text-white/50">{t.compliance.subtitle}</p>
                 </div>
                 
                 {isSyncing ? (
                      <div className="px-5 py-2.5 bg-white/10 rounded-xl text-sm font-medium flex items-center gap-2">
                         <span>{t.compliance.checking}</span>
                      </div>
                 ) : (
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                        complianceStatus === 'compliant' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-200' 
                        : complianceStatus === 'legal_declaration_required'
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-200'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200'
                    }`}>
                        <span className="font-medium capitalize">
                            {complianceStatus === 'compliant' ? t.compliance.compliant : 
                             complianceStatus === 'legal_declaration_required' ? t.compliance.actionRequired : 
                             t.compliance.actionRequired}
                        </span>
                    </div>
                 )}
              </div>
              
              {complianceMessage && (
                  <div className="mt-3 text-sm text-white/60 bg-white/5 p-3 rounded-lg border border-white/5">
                      {complianceMessage}
                  </div>
              )}

              {/* Specific Legal Button */}
              {complianceStatus === 'legal_declaration_required' && (
                  <button className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-md transition-colors">
                      {t.compliance.actionRequired} (CERFA)
                  </button>
              )}
            </div>

            {/* Tacklor Guide AI Advice */}
            {aiAdvice && (
                <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-blue-200 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {t.adviceTitle}
                    </h3>
                    <p className="text-white/90 italic">"{aiAdvice}"</p>
                </div>
            )}

            {/* Save Button */}
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              {t.save}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
