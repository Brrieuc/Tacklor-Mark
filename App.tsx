import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { NewCatchForm } from './components/NewCatchForm';
import { CatchRecord, ViewState, Language, Theme, UserProfile } from './types';
import { translations } from './i18n';
import { getLogbook, saveToLogbook, getUserProfile } from './services/storageService';

export default function App() {
  console.log("App Component: Initializing..."); // Debug Log

  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // State initialization from empty, data loaded in useEffect
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('dark');

  // Load Data on Mount
  useEffect(() => {
    console.log("App Component: useEffect mounted. Loading data from LocalStorage...");
    try {
      const loadedCatches = getLogbook();
      const loadedProfile = getUserProfile();
      
      console.log("Data loaded:", { catchesCount: loadedCatches.length, profile: !!loadedProfile });
      
      setCatches(loadedCatches);
      setUserProfile(loadedProfile);
    } catch (error) {
      console.error("App Component: Error loading data", error);
    }
  }, []);

  const handleSaveNewCatch = (record: CatchRecord) => {
    console.log("Saving new catch:", record.id);
    // Save to LocalStorage and update state with the returned array (to ensure sync)
    const updatedLogbook = saveToLogbook(record);
    setCatches(updatedLogbook);
    setView(ViewState.DASHBOARD);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen pb-10 relative">
      {/* Progressive Blur Overlay for scrolling effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-48 z-40 pointer-events-none"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 px-6 py-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl ${theme === 'dark' ? 'liquid-glass' : 'liquid-glass bg-white/40'}`}>
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
               
               {/* User Profile Display */}
               {userProfile && (
                 <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                   <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                 </div>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="transition-all duration-500 ease-in-out relative z-0">
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
