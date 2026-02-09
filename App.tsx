import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { NewCatchForm } from './components/NewCatchForm';
import { CatchRecord, ViewState, Language, Theme } from './types';
import { translations } from './i18n';

// Initial Mock Data
const INITIAL_DATA: CatchRecord[] = [
  {
    id: '1',
    date: '2023-10-15T08:30:00Z',
    species: 'Rainbow Trout',
    length_cm: 45,
    weight_kg: 1.8,
    is_sensitive_species: false,
    complianceStatus: 'compliant',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e51281901dd?q=80&w=800&auto=format&fit=crop',
    technique: 'Fly Fishing',
    spot_type: 'Mountain River',
    aiAdvice: 'Great catch! Early morning hatches are key here.'
  },
  {
    id: '2',
    date: '2023-10-14T14:15:00Z',
    species: 'Bar Européen',
    length_cm: 82,
    weight_kg: 4.5,
    is_sensitive_species: false,
    complianceStatus: 'legal_declaration_required',
    imageUrl: 'https://images.unsplash.com/photo-1582239634563-0d257211a7a0?q=80&w=800&auto=format&fit=crop',
    technique: 'Surfcasting',
    spot_type: 'Atlantic Coast',
    aiAdvice: 'Huge Bass! Tide movement was likely the trigger.'
  }
];

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [catches, setCatches] = useState<CatchRecord[]>(INITIAL_DATA);
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('dark');

  const handleSaveNewCatch = (record: CatchRecord) => {
    setCatches([record, ...catches]);
    setView(ViewState.DASHBOARD);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen pb-10">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 px-6 py-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-2xl px-6 py-3 flex items-center justify-between ${theme === 'dark' ? 'liquid-glass' : 'liquid-glass bg-white/40'}`}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
               <img 
                 src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ebB7GZWegRbYq-_RKqU2d8qHqK0m6asNfhQDg5nEdQnwPE9X-duj2FXOEcxa0jBMRdQqH_jWzYOdGGlxUNqv21wqVk_15n5kAAqdcqB9X6JX1B5qeKL0gzGE_hy4o1LzM4MA0_o3k0sEfk2ZawNhyz6efj9QoU4u8xcpJkljzhFQYwChLXUrp4ya9LA/s320/Logo%20Tacklor%20Mark.png" 
                 alt="Tacklor Mark" 
                 className="w-10 h-10 object-contain drop-shadow-md" 
               />
               <span className="text-xl font-bold text-white tracking-tight">{t.appTitle}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(prev => prev === 'fr' ? 'en' : 'fr')}
                className="text-xs font-bold px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors uppercase tracking-wider"
              >
                {lang}
              </button>
              
               <div className="hidden sm:flex items-center gap-2 text-xs text-white/50 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                 {t.aiActive}
               </div>
               <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                 <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="transition-all duration-500 ease-in-out">
        {view === ViewState.DASHBOARD && (
          <Dashboard 
            catches={catches} 
            onAddNew={() => setView(ViewState.NEW_CATCH)} 
            lang={lang}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          />
        )}
        
        {view === ViewState.NEW_CATCH && (
          <NewCatchForm 
            onSave={handleSaveNewCatch} 
            onCancel={() => setView(ViewState.DASHBOARD)}
            lang={lang}
            theme={theme}
          />
        )}
      </main>
    </div>
  );
}
