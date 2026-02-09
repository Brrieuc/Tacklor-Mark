import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { NewCatchForm } from './components/NewCatchForm';
import { CatchRecord, ViewState, Language, Theme, UserProfile, WeatherData } from './types';
import { translations } from './i18n';
import { getLogbook, saveToLogbook, getUserProfile } from './services/storageService';
import { fetchCurrentWeather } from './services/weatherService';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('dark');

  // Weather State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationError, setLocationError] = useState(false);

  // Background Images
  const bgDay = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiYWwMD27VB-_OQ7OrwaiBqJ-7lNELdUS4CYyrelQi_0blK4duusIiPywZlzSoLPCGjK6p0YfV55PcwkgafWvtJOi3MTmpHwYfhravhXRLRCCa2Mq0YaVfMdGTYT1tKB3whMRbQdQVt0RERB1UnOO1NepeTof4Ti7_k7GzZO53n4e3NfwuEPgXucIZPjDI/s16000/Fond%20Tropical.png';
  const bgNight = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj20dNTvoUjjdxI39uKfSeA6UnGif5MhnMkTYrdK40ly6IGTIqXrXUY6_dfFBNd5kYsi_7EeXSAyAiBAuAPTikKnyrgneFcAcX6vPoaYzJN84YlzdaTOAE19jm6ElAd2oMt3g5y37FH9eGhpsOaUQce2hhJjIwMb8cC9DiQcYRYsrxYwHlbtNyjK3MAmgk/s16000/Fond%20Nuit.png';

  // Load Data & Fetch Weather on Mount
  useEffect(() => {
    // 1. Load LocalStorage Data
    try {
      const loadedCatches = getLogbook();
      const loadedProfile = getUserProfile();
      setCatches(loadedCatches);
      setUserProfile(loadedProfile);
    } catch (error) {
      console.error("App Component: Error loading storage", error);
    }

    // 2. Fetch Weather
    const initWeather = async () => {
        const data = await fetchCurrentWeather();
        if (data) {
            setWeatherData(data);
            setLocationError(false);
        } else {
            setLocationError(true);
        }
    };
    initWeather();

  }, []);

  const handleSaveNewCatch = (record: CatchRecord) => {
    const updatedLogbook = saveToLogbook(record);
    setCatches(updatedLogbook);
    setView(ViewState.DASHBOARD);
  };

  const t = translations[lang];
  const isDark = theme === 'dark';
  const textShadowClass = "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]";

  return (
    <div 
      className="min-h-screen pb-10 relative transition-all duration-700 ease-in-out"
      style={{
        backgroundImage: `url('${isDark ? bgNight : bgDay}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-4 mb-6">
        <div className="max-w-7xl mx-auto">
          {/* Navbar Background: Text always White. Background matches card logic (darker) */}
          <div className={`rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl backdrop-blur-xl transition-colors duration-300 ${isDark ? 'bg-black/40 border border-white/10' : 'bg-black/20 border border-white/20'}`}>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(ViewState.DASHBOARD)}>
               <img 
                 src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ebB7GZWegRbYq-_RKqU2d8qHqK0m6asNfhQDg5nEdQnwPE9X-duj2FXOEcxa0jBMRdQqH_jWzYOdGGlxUNqv21wqVk_15n5kAAqdcqB9X6JX1B5qeKL0gzGE_hy4o1LzM4MA0_o3k0sEfk2ZawNhyz6efj9QoU4u8xcpJkljzhFQYwChLXUrp4ya9LA/s320/Logo%20Tacklor%20Mark.png" 
                 alt="Tacklor Mark" 
                 className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" 
               />
               <span className={`text-xl font-bold tracking-tight text-white ${textShadowClass}`}>{t.appTitle}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLang(prev => prev === 'fr' ? 'en' : 'fr')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider border bg-white/20 hover:bg-white/30 text-white border-white/30 ${textShadowClass}`}
              >
                {lang}
              </button>

              <button 
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={`p-1.5 rounded-full border backdrop-blur-md transition-all bg-white/20 hover:bg-white/30 border-white/30 text-white/90 ${textShadowClass}`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
              </button>
              
               <div className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border text-white/80 bg-black/20 border-white/10 ${textShadowClass}`}>
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                 {t.aiActive}
               </div>
               
               {userProfile && (
                 <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
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
            weather={weatherData}
            locationError={locationError}
          />
        )}
        
        {view === ViewState.NEW_CATCH && (
          <NewCatchForm 
            onSave={handleSaveNewCatch} 
            onCancel={() => setView(ViewState.DASHBOARD)}
            lang={lang}
            theme={theme}
            weather={weatherData}
          />
        )}
      </main>
    </div>
  );
}