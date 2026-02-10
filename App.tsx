import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { NewCatchForm } from './components/NewCatchForm';
import { CatchRecord, ViewState, Language, Theme, UserProfile, WeatherData } from './types';
import { translations } from './i18n';
import { getLogbook, saveToLogbook, getUserProfile } from './services/storageService';
import { fetchCurrentWeather } from './services/weatherService';
import { CUSTOM_API_KEY_STORAGE, resetAiClient } from './services/geminiService';
import { GlassCard } from './components/GlassCard';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isScrolled, setIsScrolled] = useState(false);

  // API Key Management State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState('');

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
      
      const storedKey = localStorage.getItem(CUSTOM_API_KEY_STORAGE);
      if (storedKey) setCustomKey(storedKey);

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

    // 3. Scroll Listener for Shadow
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

  const handleSaveNewCatch = (record: CatchRecord) => {
    const updatedLogbook = saveToLogbook(record);
    setCatches(updatedLogbook);
    setView(ViewState.DASHBOARD);
  };

  const handleSaveApiKey = () => {
      if (customKey.trim()) {
          localStorage.setItem(CUSTOM_API_KEY_STORAGE, customKey.trim());
      } else {
          localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
      }
      resetAiClient(); // Force reload of AI client
      setShowKeyModal(false);
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
      <nav className="sticky top-0 z-[100] px-4 sm:px-6 py-4 mb-2">
        <div className="max-w-7xl mx-auto">
          {/* Navbar Background: Dynamic Shadow based on scroll */}
          <div 
            className={`
                rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-xl transition-all duration-500
                ${isDark ? 'bg-black/40 border-white/10' : 'bg-black/20 border-white/20'}
                ${isScrolled ? 'shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b' : 'shadow-2xl border'}
            `}
          >
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

              {/* API Key Button Moved Here */}
              <button
                onClick={() => setShowKeyModal(true)}
                className={`p-1.5 rounded-full border backdrop-blur-md transition-all bg-white/20 hover:bg-white/30 border-white/30 text-white/90 ${textShadowClass}`}
                title="Configurer clé API Gemini"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
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
            isScrolled={isScrolled}
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

      {/* API Key Modal */}
      {showKeyModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <GlassCard theme={theme} className="w-full max-w-md space-y-4">
                  <h3 className="text-xl font-bold text-white drop-shadow-md">Configuration Gemini API</h3>
                  <p className="text-sm text-white/80">
                      Entrez votre clé API Google Gemini personnelle pour utiliser l'analyse d'image. 
                      <br/><span className="text-xs opacity-60">(La clé est stockée uniquement dans votre navigateur)</span>
                  </p>
                  <input 
                      type="text" 
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="flex gap-3 justify-end pt-2">
                      <button 
                          onClick={() => setShowKeyModal(false)}
                          className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                      >
                          Annuler
                      </button>
                      <button 
                          onClick={handleSaveApiKey}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg"
                      >
                          Sauvegarder
                      </button>
                  </div>
              </GlassCard>
          </div>
      )}
    </div>
  );
}